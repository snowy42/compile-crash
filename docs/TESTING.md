# Test evidence — alpha 0.1.0

## Local execution

Environment: Linux container, Node 22.16.0, TypeScript 5.8.3, Python Playwright 1.57.0, Chromium 144.0.7559.96. This is not a test on the user's Windows/Opera installation.

- `npm run build`: passed; emitted ES modules plus local assets.
- `npm run typecheck`: passed with strict/no-unused checks.
- `npm run lint`: passed the repository's explicit architecture/safety rules.
- `npm test`: 133 tests passed, zero failed, zero skipped at the initial alpha checkpoint.
- Browser supplied-assets suite: 13 checks passed, zero uncaught JavaScript errors. It exercised actual compiled UI modules and CSS, including held-key/toggle/blur behavior, draft neutral-input gating, 1366×768 controls, 150% UI scale, trace inspection, practice isolation, and confirmed backup import.
- Seed sweeps: 30 greedy-policy runs (27 victories) and 1,000 cycling-policy runs (0 victories), all completed without command-limit stalls or validation errors. These are deterministic agent observations, not player win rates.
- Local server HTTP/asset response checks passed. Clean npm installation could not be executed in the network-restricted container; the installed compiler version matched the lockfile.

**Important browser limitation:** the container's managed Chromium blocks navigation to normal URLs. Its policies were not changed. The local browser suite therefore supplied the actual compiled modules and assets to a blank opaque-origin page and explicitly selected memory-only mode. This checks UI behavior but cannot verify durable IndexedDB/reload/multiple-tab behavior. The normal-origin CI suite tests those separately. Read the actual GitHub Actions result before treating those CI checks as passed.

## What engine tests establish

Every item/rank resolves with finite values. Selected exact fixtures establish base/quarter formulas; ordered copy math; no duplicated root-only grants; crit inheritance; manual compile/overflow windows; worker timing; deferred deposits; health snapshots; placement-independent Guard penalties; same-tick clear priority; fixed XP/rewards; single aggregate multi-hit block events; capped repair; safe self-costs; deterministic save/restore; draft eligibility, stale offer rejection and replacement; breakthrough parent consumption; 34-Fragment victory; capped/refundable meta; and reward-free practice.

Import tests reject malformed, tampered, oversized, unknown-version, nonfinite, duplicate-item, unknown-item and unsafe-property data. This is accidental-corruption/safety validation, not competitive anti-cheat.

The catalogue tests are not exhaustive proofs of every trigger boundary in every possible build. A deterministic simulator cannot prove that the game is enjoyable.

## Normal browser suite and CI

`npm run test:e2e` runs the real localhost origin and additionally checks exact IndexedDB reload, two-tab read-only/takeover protection and visible failed-save handling. It does not silently use supplied-assets mode. CI clean-installs dependencies and runs type/lint/unit/seed/browser checks. Test screenshots and JSON results are uploaded as workflow artifacts.

## Still needs a person

Play a fresh-profile run on Windows, identify why a particular compile grew, resume after an interruption, inspect the final loss cause, export a valuable run, and test whether a different build is worth trying. Audit keyboard and screen-reader navigation and the audio mix on real devices. These are not marked complete by automated success.
