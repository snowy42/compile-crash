# Balance notebook — 0.1.0

All values are initial tuning, not validated human balance.

## Stable baseline

125 ms ticks; eight ticks/second maximum. Raw Code 1/tick, buffer 24, default full batch. A player compile consumes `b` Raw Code and creates `b * (1 + 0.25 * b/capacity)` base Work and 2 Guard. Base crit is 5% ×1.75 before modules. The Workstation starts with Line Expander +4, so a noncritical first full root yields 34 Work. Quick batches trade base efficiency for more per-compile triggers and Guard.

Exact ordering fixture: rank-II F01 → F02 → E02 → E04 → G01 → B01, full noncritical player batch, no patches: **144.34875 Work and 7 Guard**, with one original and one child. The regression test checks that number.

Targets are 160/400/800; 1800/2800/4000; 6500/8500/11000. Trojan purge targets are 1600, 6000 and 15000. Content contains the exact contract, pulse, deadline and phase parameters.

## Seeded policies

`scripts/simulate.mjs` exposes two simple agents. The greedy policy evaluates draft options using the actual reward-free engine benchmark, selects a threshold, repairs and trains. The cycling policy picks cards without an intelligent strategy. Both exercise real command paths and validate saved shapes. Neither establishes player win rates or guarantees a seed is easy/impossible.

Fresh-profile recorded wins include QA-0 (Flow/Cache/Batch/Guard), QA-1 (Flow/Cache/Batch/Risk), QA-2 (Flow/Workers/Batch/Guard) and QA-3 (Flow/Guard/Cache/Workers), with no permanent bonuses or Assist. Advancing durations were approximately 342–666 seconds; decision/pause time is additional. Later examples include Echo/Critical and Workers/Risk libraries. This confirms more than one mechanically different fresh-profile completion exists.

## First playtest questions

Does quick-batch flat-output stacking dominate too frequently? Does Full Build feel worth choosing without a complete recipe? Is Guard generation understandable? Are worker roots visible enough? Does a loss reveal a repair/contract/build decision, or only feel like bad card luck? Does the late game remain engaging when most progression is automated?

Do not secretly scale threats to measured output. Preserve strong runs while improving meaningful alternative strategies. If the first draft feels dull, changing numerical targets alone will not fix it.

## Recorded alpha sweep

QA-0 through QA-29, greedy policy: 27 victories / 30 runs, median 485.25 advancing seconds, no command-limit stalls. QA-0 through QA-999, cycling policy: 0 victories / 1,000 runs, median 259 advancing seconds, no stalls. Both used Workstation, tier 0, no permanent bonuses and no Assist. These are policy-specific observations, not human win rates. The very large gap reinforces the need to test onboarding and avoid rewarding only one unintuitive batching strategy.
