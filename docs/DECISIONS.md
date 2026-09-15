# Implementation decisions — 0.1.0

## Browser, TypeScript, minimal toolchain

The game follows the local-first browser architecture in the design baseline. The alpha uses the TypeScript compiler, a small Node static server, and Node's built-in test runner rather than Vite/Vitest. This keeps install/runtime dependencies minimal and permits an inspectable, deterministic build. `npm ci`, `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, and browser tests remain explicit workflows. The UI is plain semantic HTML/CSS/TypeScript with Canvas used only for presentation.

The local build environment could not reach the npm registry. Its installed TypeScript 5.8.3 compiler was used; package.json and the lockfile pin that same version and the official registry integrity. Clean `npm ci` verification belongs to CI and a clean local checkout. No generated dependency directory is checked in.

## Full-run alpha before human milestone sign-off

The user requested implementation in the empty repository. This delivery implements the full run and authored catalogue together, with a modular engine, content validation and regression tests. It does **not** assert that the design's M1 enjoyment gate, qualitative tester sessions, or release audit have passed. 0.1.0 is a playtest alpha; expanding scope further should wait for feedback on the actual loop.

## Firm rules retained

- Input advances the same clock as hostile pressure. There is no offline income or catch-up damage.
- All roots resolve atomically. A same-tick clear wins before an attack.
- Copies move downstream and never clone original-root identity.
- All Guard-generation penalties apply after a root, independent of tile position.
- Offers and RNG state are saved; a reload is not a free reroll.
- One snapshot transaction includes profile, run and earned-reward ledger.
- A complete standard run pays 34 Fragments, and results do not pay them again.
- Rigs and bonuses have caps; a fresh profile can win in recorded fixtures.
- Reordering is limited to drafts/intermissions. Pause never becomes an inventory exploit.
- No generated text is executed, and gameplay does not need a network or paid service.

## Small implementation choices

Normal UI-created runs are marked `seeded`, since each exposes its seed; rewards and rules are the same as Standard. The guide uses the fixed four-family first-act library and limited first-project lethal protection. Practice is a reward-free clone that restores the original game on return.

The alpha uses versioned whole-game snapshots in one IndexedDB object store, including two recovery snapshots. Unknown explicit rules versions are refused rather than silently falling back to an older interpretation. Writer ownership is checked inside transactions, not only through a UI flag.

The controls use fresh-input gating on decisions, separate physical input state from saved game state, and stop on focus loss and long frame gaps. No control requires faster tapping than holding a key.

## Next decisions require play evidence

First inspect whether quick batches dominate too broadly, whether the first two module choices are understandable, whether a rare/breakthrough feels different, and whether the final act creates decisions rather than waiting. Change numerical content only with a version bump and a deliberate active-save policy. Do not add more currencies or modes to repair a weak core loop.
