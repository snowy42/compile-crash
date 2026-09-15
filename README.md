# COMPILE / CRASH

**Build an absurd software machine. Feed it nonsense keystrokes. Survive the internet.**

A local-first, single-player programming-fantasy roguelite. Generate fictional code, compile it through six ordered software modules, draft upgrades, and ship increasingly ridiculous projects before a Trojan crashes the run. No actual programming, combat controls, account, API key, or paid service is required.

**Version 0.1.0: playable full-run alpha.** All three acts and the authored item catalogue are implemented. This is ready for playtesting, not a claim of finished balance or complete cross-browser/accessibility certification.

## Run it on Windows, macOS, or Linux

Install **Node.js 24 LTS** (Node 22 or later is supported) and Git. Open a terminal where you keep your projects:

```sh
git clone https://github.com/snowy42/compile-crash.git
cd compile-crash
npm ci
npm run dev
```

Open **http://localhost:5173** in your browser. Leave the terminal running. Press **Ctrl+C in the terminal** to stop the server.

On Windows, after cloning, you can also double-click **`PLAY.bat`**. It installs the pinned TypeScript dependency when needed, opens the game URL, and starts the local development server. On macOS/Linux, `./play.sh` does the same server setup.

For an already-cloned copy:

```sh
git pull
npm ci
npm run dev
```

The development server compiles TypeScript changes automatically. **Refresh the page** to load changes; there is no hot-module reload. Saved runs return stopped.

For a normal production build:

```sh
npm run build
npm run preview
```

Or use `npm start` to build and serve in one command. Development and preview both use **localhost:5173** deliberately: browser saves belong to an origin. Stop one server before starting the other. Do not double-click `public/index.html`; the ES modules need the local server.

Package installation needs internet access. After that, the game and its assets run locally without network services. The only npm dependency is the pinned TypeScript compiler.

## First run

Choose **Boot machine**, or the **Guided first act** for the fixed introductory library. Tap or hold ordinary keys to generate code. Your buffer compiles automatically; choose one of three upgrades when you level up. Work completes projects and purges Trojans. Guard absorbs announced attacks before Integrity is lost.

The important decisions are which tools you install, their left-to-right order, and whether to compile small, medium, or full batches. A copier followed by a flat bonus behaves differently from those tools in the reverse order. Inspect a compile receipt to see the actual calculation.

| Action | Default control |
|---|---|
| Generate code | Tap or hold letters, numbers, punctuation, or Space |
| Compile early | Enter, with at least 25% of the buffer filled |
| Stop time | Release all coding keys / the held Code button |
| Pause | Escape or Pause button |
| Select a draft | Fresh 1, 2, or 3; or click a card |
| Reorder modules | Build panel during drafts or between encounters |
| Change batch size | 25%, 50%, or 100% controls |

Holding one key is as effective as mashing. The game advances at most eight simulation ticks per second. **Releasing input freezes production and threats together.** Optional Toggle and Single-step controls are available in Settings. Toggle runs until explicitly stopped, but pauses on menus, drafts, focus loss, and tab changes; it never restarts itself.

Cards cannot be selected by a key held before a draft opens. Release first, then make a fresh choice. Browser/OS modifier shortcuts are not intercepted.

## What's in this build

- Three acts: nine projects, three Trojan encounters, real victory and crash outcomes.
- Six different Trojans, selected when the seeded run is created, with visible rules and attack forecasts.
- 48 modules, 36 passive patches, and 12 two-parent breakthroughs. Modules have three ranks; patches have two. Cards interpolate the same numbers the engine uses.
- Four-family run libraries drawn from eight families; rerolls, replacements, repairs, training, and twelve contract variations.
- Four unlockable rigs, four capped/refundable permanent upgrade tracks, twelve challenges, six themes, collection, and a recent-run archive.
- JS-like and VBA-like decorative code, progress-driven project previews, pipeline effects, optional synthesized audio, exact compile receipts, and a reward-free 30-second practice bench.
- Seeded RNG streams, saved offers, Assist settings, five challenge tiers, quiet/reduced-motion options, larger text, and keyboard controls.
- IndexedDB saves with recovery snapshots, a single-writer tab lease, confirmed JSON import/export, and explicit storage-failure handling.

All generated code and Trojans are fictional display data. The game never executes the code, scans a network, reads your files, or changes your computer. It does not record the actual keys you type. No analytics leave your machine.

## Saves and backups

Progress saves automatically after choices, rewards, pauses, and at most two advancing seconds between periodic snapshots. Fragments are banked with encounter completion, not paid again on the results screen. Starting a new run resets run-local upgrades and Credits, not banked Fragments.

Saves live in **this browser profile at http://localhost:5173**, not in your Git checkout. A different browser, private session, `127.0.0.1` instead of `localhost`, or clearing browser storage gives you a different/empty save. Use **Export backup** before clearing data, changing browsers, or updating a valuable run. Imports require confirmation and refuse unknown rules versions. There is no cloud backup.

Only one tab can write a save. A second tab offers an explicit takeover. A failed save stops play and displays a warning, with retry, export, or an explicitly non-durable memory-only option. A sudden process termination can lose activity since the last completed save. Check the visible save status rather than assuming an export or write succeeded.

## Development and tests

```sh
npm run typecheck
npm run lint
npm test
npm run test:content
npm run test:seeds
```

`lint` is a small architecture/safety check; strict TypeScript checks run separately. `npm test` compiles and uses Node's built-in test runner. `test:seeds` runs a transparent benchmark-driven drafting policy, not a model of human enjoyment. See [testing notes](docs/TESTING.md) for executed checks and limitations.

Optional browser regression tests require Python 3.10+ and Playwright:

```sh
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
npm run build
npm run test:e2e
```

The browser suite starts a preview server if one is not already running. It tests a fresh isolated browser profile. It never uses or modifies your everyday browser profile. `--supplied-assets` is a restricted-environment fallback that explicitly skips origin-dependent storage tests; CI must run the normal mode.

## Repository map

- `src/core/`: serializable state, seeded randomness, ordered pipeline, drafting, encounters, rewards, and validated commands.
- `src/content/`: authored item, rig, project, contract, and Trojan definitions.
- `src/ui/`: semantic screens, input clock, and non-authoritative presentation.
- `src/platform/`: save validation/transactions and bounded synthesized sound.
- `public/`: original CSS/SVG presentation and entry HTML.
- `scripts/`: local server/build tools and seeded simulation checks.
- `tests/`: engine, content, validation, and browser regressions.
- `docs/`: implemented scope, decisions, balance notes, assets, and test evidence.

## Troubleshooting

**`npm` is not recognised:** install Node, then reopen your terminal. Check `node --version` and `npm --version`.

**PowerShell blocks `npm.ps1`:** use `npm.cmd ci` and `npm.cmd run dev`, or use Command Prompt. You do not need to weaken your system's execution policy.

**Port 5173 is in use:** stop the other dev/preview terminal with Ctrl+C. The server intentionally does not pick another port and make your save appear missing.

**Page is blank or assets return 404:** run `npm ci`, then `npm run build`, then `npm run preview`; open the printed local URL rather than an HTML file.

**A new version refuses a save:** keep/export the old backup. The alpha currently supports rules version 0.1.0 only; it does not silently reinterpret unknown future or incompatible rules.

## Current limits

Balance and voluntary replay still need human playtesting. The first-act guide is lightweight, not a full adaptive tutorial. No Windows installer, multiplayer, cloud sync, daily rewards, endless mode, real-code execution, or runtime AI exists. The 1.0 design remains a destination: implemented features should not be confused with a completed human usability, accessibility, performance, and compatibility audit.
