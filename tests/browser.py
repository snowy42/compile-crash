"""Browser regressions. Requires: pip install -r requirements-dev.txt; playwright install chromium.

Normal mode uses the real HTTP origin and tests IndexedDB. --supplied-assets only
is for managed browsers that prohibit navigation. It tests actual UI modules on
an opaque page, explicitly skips durable storage tests, and changes no policies.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import posixpath
import re
import subprocess
import time
import urllib.request
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "artifacts"
ART.mkdir(exist_ok=True)
parser = argparse.ArgumentParser()
parser.add_argument("--supplied-assets", action="store_true")
args = parser.parse_args()
server = None
checks: list[str] = []
errors: list[str] = []

def passed(name: str) -> None:
    checks.append(name)
    print("PASS", name, flush=True)

def load_supplied(page) -> None:
    root = ROOT / "dist"
    html = re.sub(r"<script[^>]*>.*?</script>", "", (root / "index.html").read_text())
    html = re.sub(r"<link[^>]*>", "", html)
    page.set_content(html)
    page.add_style_tag(content='\n'.join((root / f"style-{i}.css").read_text() for i in range(1, 4)))
    loaded: dict[str, str] = {}
    def module(path: str) -> str:
        if path in loaded:
            return loaded[path]
        source = (root / path).read_text()
        source = re.sub(r'''(from\s+["'])(\.[^"']+)(["'])''', lambda m:
            m[1] + module(posixpath.normpath(posixpath.join(posixpath.dirname(path), m[2]))) + m[3], source)
        if path == "app/main.js":
            source = source.replace("new URLSearchParams(location.search).has('test') && ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)",
                                    "true /* supplied-asset test harness only */")
        loaded[path] = page.evaluate("code => URL.createObjectURL(new Blob([code], {type:'text/javascript'}))", source)
        return loaded[path]
    page.evaluate("url => import(url)", module("app/main.js"))
    page.locator('[data-action="memory-only"]').wait_for()
    page.locator('[data-action="memory-only"]').click()

def wait_until(page, predicate, label: str, timeout_ms: int = 5000) -> None:
    deadline = time.monotonic() + timeout_ms / 1000
    while time.monotonic() < deadline:
        try:
            if predicate():
                return
        except Exception:
            pass
        page.wait_for_timeout(25)
    raise TimeoutError(f"Timed out waiting for browser condition: {label}")

def open_game(context):
    page = context.new_page()
    page.on("pageerror", lambda e: errors.append(str(e)))
    if args.supplied_assets:
        load_supplied(page)
    else:
        page.goto("http://localhost:5173/?test=1")
    wait_until(page, lambda: page.evaluate("Boolean(window.__ccTest && !window.__ccTest.view().saving)"), "test harness ready")
    page.wait_for_timeout(300)
    return page

def state(page):
    return page.evaluate("window.__ccTest.state()")

def ready(page):
    wait_until(page, lambda: page.evaluate("!window.__ccTest.view().saving"), "save settled")
    page.wait_for_timeout(250)

def click(page, action):
    ready(page)
    page.locator(f'[data-action="{action}"]').first.click()
    ready(page)

def command(page, obj):
    return page.evaluate("command => window.__ccTest.command(command)", obj)

try:
    if not args.supplied_assets:
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        try:
            opener.open("http://localhost:5173", timeout=1)
        except Exception:
            server = subprocess.Popen(["node", "scripts/serve.mjs"], cwd=ROOT)
            for _ in range(50):
                try:
                    opener.open("http://localhost:5173", timeout=1)
                    break
                except Exception:
                    time.sleep(.1)
            else:
                raise RuntimeError("Local server did not start on port 5173")
    with sync_playwright() as p:
        launch = {"headless": True}
        if os.environ.get("CHROMIUM_EXECUTABLE"):
            launch["executable_path"] = os.environ["CHROMIUM_EXECUTABLE"]
        browser = p.chromium.launch(**launch)
        context = browser.new_context(viewport={"width":1366,"height":768})
        page = open_game(context)
        assert page.locator('[data-action="new"]').is_visible()
        assert "COMPILE" in page.title()
        page.screenshot(path=str(ART / "home.png"), full_page=True)
        passed("home boots with local assets")
        page.locator('#seed').fill('UI-INPUT')
        click(page, 'new')
        assert state(page)['run']['phase'] == 'prep'
        assert page.locator('[data-action="connect"]').count() == 3
        page.screenshot(path=str(ART / "contracts.png"), full_page=True)
        passed("seeded run previews three explicit contracts")
        click(page, 'connect')
        page.keyboard.down('a')
        page.wait_for_timeout(550)
        page.keyboard.up('a')
        ticks = state(page)['run']['encounter']['tick']
        assert 3 <= ticks <= 6, ticks
        page.wait_for_timeout(450)
        assert state(page)['run']['encounter']['tick'] == ticks
        passed("hold advances at capped speed; key release stops the entire clock")
        button = page.locator('#code-pad')
        rect = button.bounding_box()
        assert rect and rect['y'] + rect['height'] <= 768
        page.mouse.move(rect['x'] + 10, rect['y'] + 10)
        page.mouse.down()
        page.wait_for_timeout(500)
        page.mouse.up()
        after = state(page)['run']['encounter']['tick']
        assert after > ticks
        page.wait_for_timeout(250)
        assert state(page)['run']['encounter']['tick'] == after
        passed("pointer hold/release works; main controls fit 1366x768")
        # Reach the tick before a compile that earns the first genuine draft.
        while state(page)['run']['raw'] < 23 or state(page)['run']['encounter']['work'] < 50:
            page.evaluate('window.__ccTest.advance(1)')
            assert state(page)['run']['phase'] == 'playing'
        page.keyboard.down('1')
        wait_until(page, lambda: page.evaluate("window.__ccTest.state().run.phase === 'draft'"), "draft opened")
        offer = state(page)['run']['offer']
        page.wait_for_timeout(400)
        page.keyboard.down('1')  # auto-repeat must not buy the first card
        assert state(page)['run']['offer'] == offer
        assert page.locator('[data-choice="0"]').get_attribute('aria-disabled') == 'true'
        page.keyboard.up('1')
        ready(page)
        page.screenshot(path=str(ART / "draft.png"), full_page=True)
        page.keyboard.press('1')
        ready(page)
        assert state(page)['run']['phase'] == 'playing'
        assert len(state(page)['profile']['taken']) >= 1
        passed("held digits cannot choose drafts; a fresh released press can")
        assert command(page, {'type':'SETTING','key':'input','value':'toggle'})
        ready(page)
        click(page, 'code')
        page.wait_for_timeout(350)
        assert page.evaluate('window.__ccTest.view().running')
        click(page, 'pause')
        snapshot = state(page)
        page.wait_for_timeout(300)
        assert state(page) == snapshot
        click(page, 'close')
        assert not page.evaluate('window.__ccTest.view().running')
        passed("toggle runs deliberately; pause and resume never restart it")
        click(page, 'code')
        page.wait_for_timeout(150)
        page.evaluate('window.dispatchEvent(new Event("blur"))')
        ready(page)
        assert not page.evaluate('window.__ccTest.view().running')
        assert page.evaluate('window.__ccTest.view().panel') == 'pause'
        passed("focus loss stops production and opens a deliberate resume screen")
        click(page, 'close')
        click(page, 'settings')
        page.locator('[data-setting="language"]').select_option('vba')
        ready(page)
        assert state(page)['profile']['settings']['language'] == 'vba'
        page.locator('[data-setting="scale"]').select_option('1.5')
        ready(page)
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
        page.locator('[data-setting="scale"]').select_option('1')
        ready(page)
        click(page, 'close')
        passed("language and 150% UI scale settings are functional and reflow")
        shortcut = page.evaluate("""() => {
          const event = new KeyboardEvent('keydown', {key:'l', code:'KeyL', ctrlKey:true, bubbles:true, cancelable:true});
          window.dispatchEvent(event); return event.defaultPrevented;
        }""")
        assert shortcut is False
        passed("browser modifier shortcuts are not intercepted")
        page.screenshot(path=str(ART / "game.png"), full_page=True)
        click(page, 'trace')
        assert page.locator('.dialog').inner_text().find('Line Expander') >= 0
        click(page, 'close')
        passed("compile inspector shows the actual contributing modules")
        click(page, 'home')
        before = state(page)
        click(page, 'practice')
        click(page, 'connect')
        page.evaluate('window.__ccTest.advance(240)')
        assert state(page)['run']['outcome'] == 'benchmark'
        click(page, 'end-practice')
        assert state(page) == before
        passed("30-second practice bench restores live state exactly and earns no rewards")
        backup = page.evaluate('window.__ccTest.export()')
        page.evaluate('text => window.__ccTest.import(text)', backup)
        ready(page)
        assert page.evaluate('window.__ccTest.view().panel') == 'import'
        click(page, 'confirm-import')
        assert state(page) == before
        passed("backup import requires confirmation and round-trips live state")
        if not args.supplied_assets:
            page.evaluate('window.__ccTest.save()')
            page.reload()
            ready(page)
            assert state(page) == before
            assert not page.evaluate('window.__ccTest.view().running')
            passed("IndexedDB reload restores the exact stopped run")
            other = open_game(context)
            assert other.evaluate('window.__ccTest.view().readOnly')
            assert state(other) == state(page)
            click(other, 'takeover')
            assert not other.evaluate('window.__ccTest.view().readOnly')
            page.evaluate('window.__ccTest.save()')
            assert page.evaluate('window.__ccTest.view().readOnly')
            passed("second tab is read-only; takeover blocks stale writes")
            other.evaluate('window.__ccTest.failSave()')
            other.evaluate('window.__ccTest.save()')
            assert other.evaluate('window.__ccTest.view().panel') == 'storage'
            click(other, 'memory-only')
            assert other.evaluate('window.__ccTest.view().volatile')
            passed("storage failure is visible and permits explicit non-durable continuation")
        else:
            print('SKIP durable IndexedDB/reload/multiple-tab tests: supplied-assets uses an opaque origin.', flush=True)
        assert not errors, errors
        passed("no uncaught browser JavaScript errors")
        report = {'checks':len(checks),'passed':checks,'browser':browser.version,
                  'mode':'supplied-assets (durable storage not tested)' if args.supplied_assets else 'HTTP + IndexedDB',
                  'durableStorageTested':not args.supplied_assets,'pageErrors':errors}
        (ART / 'browser-report.json').write_text(json.dumps(report, indent=2))
        print(json.dumps(report, indent=2))
        browser.close()
finally:
    if server is not None:
        server.terminate()
        server.wait(timeout=5)
