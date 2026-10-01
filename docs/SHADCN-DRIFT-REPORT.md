# shadcn drift report

Generated: 2026-10-01T09:35:33.211Z

Tracks how far TAC's @tac primitives have diverged from the upstream shadcn 4.7.0 registry. Run by the `shadcn-drift-check` GitHub Actions cron.

**Signal vs. noise:** the actionable signal is the `NEW SINCE LAST RUN` column — that means upstream changed something since the last cron tick. Long-standing `UNCHANGED` drift is the steady-state TAC customization layer and doesn't need monthly triage. The previous-run hashes live in `docs/shadcn-drift-last-report.json` (checked into git so the snapshot survives across runs).

Cherry-pick decisions go in `docs/primitive-upgrade-audit.md` (Cherry-pick backlog table) — this report is the trigger, not the resolution.

| Primitive | Status | Detail |
|---|---|---|
| `button` | DRIFT · NEW SINCE LAST RUN | local has 72 lines not upstream · upstream has 30 lines not local · upstream hash eb22ee6ae1083e4d |
| `input` | DRIFT · NEW SINCE LAST RUN | local has 2 lines not upstream · upstream has 2 lines not local · upstream hash a578a495be70de1a |
| `label` | DRIFT · NEW SINCE LAST RUN | local has 2 lines not upstream · upstream has 2 lines not local · upstream hash 2818f28ea21a7c24 |
| `textarea` | DRIFT · NEW SINCE LAST RUN | local has 7 lines not upstream · upstream has 3 lines not local · upstream hash ee5c869462b6963b |
| `badge` | DRIFT · NEW SINCE LAST RUN | local has 1 lines not upstream · upstream has 1 lines not local · upstream hash 849a539256294d9f |
| `separator` | DRIFT · NEW SINCE LAST RUN | local has 1 lines not upstream · upstream has 1 lines not local · upstream hash b5b5460e5337c2d5 |
| `card` | DRIFT · NEW SINCE LAST RUN | local has 71 lines not upstream · upstream has 7 lines not local · upstream hash f2cef6bb36d35d6a |
| `select` | DRIFT · NEW SINCE LAST RUN | local has 7 lines not upstream · upstream has 35 lines not local · upstream hash 3d0dc3c37e542d26 |
| `dialog` | DRIFT · NEW SINCE LAST RUN | local has 16 lines not upstream · upstream has 28 lines not local · upstream hash 8492b60d53610529 |
| `sheet` | DRIFT · NEW SINCE LAST RUN | local has 9 lines not upstream · upstream has 13 lines not local · upstream hash ab1890ce4d1764f5 |
| `popover` | DRIFT · NEW SINCE LAST RUN | local has 12 lines not upstream · upstream has 23 lines not local · upstream hash 4b31dcd02ecd964b |
| `tabs` | DRIFT · NEW SINCE LAST RUN | local has 8 lines not upstream · upstream has 29 lines not local · upstream hash 177eab37d9b1181f |
| `table` | DRIFT · NEW SINCE LAST RUN | local has 5 lines not upstream · upstream has 5 lines not local · upstream hash e87f4888357e1c8d |
| `calendar` | DRIFT · NEW SINCE LAST RUN | local has 67 lines not upstream · upstream has 154 lines not local · upstream hash f7f438b0fd63d778 |

**Summary:** 14 primitives checked · 14 drifted (total) · 14 new-since-last-run · 0 errors.
