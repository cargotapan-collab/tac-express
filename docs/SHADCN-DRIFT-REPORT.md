# shadcn drift report

Generated: 2026-05-13T02:11:55.187Z

Tracks how far TAC's @tac primitives have diverged from the upstream shadcn 4.7.0 registry. Run by the `shadcn-drift-check` GitHub Actions cron.

**Signal vs. noise:** the actionable signal is the `NEW SINCE LAST RUN` column — that means upstream changed something since the last cron tick. Long-standing `UNCHANGED` drift is the steady-state TAC customization layer and doesn't need monthly triage. The previous-run hashes live in `docs/shadcn-drift-last-report.json` (checked into git so the snapshot survives across runs).

Cherry-pick decisions go in `docs/primitive-upgrade-audit.md` (Cherry-pick backlog table) — this report is the trigger, not the resolution.

| Primitive | Status | Detail |
|---|---|---|
| `button` | DRIFT · UNCHANGED | local has 96 lines not upstream · upstream has 58 lines not local · upstream hash 8faa967fe5e7a409 |
| `input` | DRIFT · UNCHANGED | local has 17 lines not upstream · upstream has 16 lines not local · upstream hash 76487cd7e1c6cf70 |
| `label` | DRIFT · UNCHANGED | local has 21 lines not upstream · upstream has 20 lines not local · upstream hash bc6def371c5ecb10 |
| `textarea` | DRIFT · UNCHANGED | local has 20 lines not upstream · upstream has 15 lines not local · upstream hash 76061f768b3c442b |
| `badge` | DRIFT · UNCHANGED | local has 44 lines not upstream · upstream has 43 lines not local · upstream hash 93e4f1ed20ab9d6d |
| `separator` | DRIFT · UNCHANGED | local has 25 lines not upstream · upstream has 24 lines not local · upstream hash 2eaccc917de329c8 |
| `card` | DRIFT · UNCHANGED | local has 110 lines not upstream · upstream has 45 lines not local · upstream hash e03bc2949310fc17 |
| `select` | DRIFT · UNCHANGED | local has 116 lines not upstream · upstream has 143 lines not local · upstream hash 27333a3f3f760aa8 |
| `dialog` | DRIFT · UNCHANGED | local has 95 lines not upstream · upstream has 106 lines not local · upstream hash b408941b7837f11f |
| `sheet` | DRIFT · UNCHANGED | local has 94 lines not upstream · upstream has 97 lines not local · upstream hash c0945c23efc480cd |
| `popover` | DRIFT · UNCHANGED | local has 46 lines not upstream · upstream has 56 lines not local · upstream hash 4c7bd7dbfa306ea3 |
| `tabs` | DRIFT · UNCHANGED | local has 8 lines not upstream · upstream has 29 lines not local · upstream hash ec5377aacd03ef0b |
| `table` | DRIFT · UNCHANGED | local has 5 lines not upstream · upstream has 5 lines not local · upstream hash a71030ab5d09539d |
| `calendar` | DRIFT · UNCHANGED | local has 101 lines not upstream · upstream has 187 lines not local · upstream hash bf6f13e3854d6268 |

**Summary:** 14 primitives checked · 14 drifted (total) · 0 new-since-last-run · 0 errors.
