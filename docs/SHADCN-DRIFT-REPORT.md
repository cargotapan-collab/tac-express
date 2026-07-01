# shadcn drift report

Generated: 2026-07-01T07:04:17.641Z

Tracks how far TAC's @tac primitives have diverged from the upstream shadcn 4.7.0 registry. Run by the `shadcn-drift-check` GitHub Actions cron.

**Signal vs. noise:** the actionable signal is the `NEW SINCE LAST RUN` column — that means upstream changed something since the last cron tick. Long-standing `UNCHANGED` drift is the steady-state TAC customization layer and doesn't need monthly triage. The previous-run hashes live in `docs/shadcn-drift-last-report.json` (checked into git so the snapshot survives across runs).

Cherry-pick decisions go in `docs/primitive-upgrade-audit.md` (Cherry-pick backlog table) — this report is the trigger, not the resolution.

| Primitive | Status | Detail |
|---|---|---|
| `button` | DRIFT · NEW SINCE LAST RUN | local has 72 lines not upstream · upstream has 30 lines not local · upstream hash 4d671c38631224ac |
| `input` | DRIFT · UNCHANGED | local has 2 lines not upstream · upstream has 2 lines not local · upstream hash 76487cd7e1c6cf70 |
| `label` | DRIFT · UNCHANGED | local has 2 lines not upstream · upstream has 2 lines not local · upstream hash bc6def371c5ecb10 |
| `textarea` | DRIFT · UNCHANGED | local has 7 lines not upstream · upstream has 3 lines not local · upstream hash 76061f768b3c442b |
| `badge` | DRIFT · UNCHANGED | local has 1 lines not upstream · upstream has 1 lines not local · upstream hash 93e4f1ed20ab9d6d |
| `separator` | DRIFT · UNCHANGED | local has 1 lines not upstream · upstream has 1 lines not local · upstream hash 2eaccc917de329c8 |
| `card` | DRIFT · NEW SINCE LAST RUN | local has 71 lines not upstream · upstream has 7 lines not local · upstream hash a4a9ca954b8e9b3c |
| `select` | DRIFT · UNCHANGED | local has 7 lines not upstream · upstream has 35 lines not local · upstream hash 27333a3f3f760aa8 |
| `dialog` | DRIFT · UNCHANGED | local has 16 lines not upstream · upstream has 28 lines not local · upstream hash b408941b7837f11f |
| `sheet` | DRIFT · UNCHANGED | local has 9 lines not upstream · upstream has 13 lines not local · upstream hash c0945c23efc480cd |
| `popover` | DRIFT · UNCHANGED | local has 12 lines not upstream · upstream has 23 lines not local · upstream hash 4c7bd7dbfa306ea3 |
| `tabs` | DRIFT · UNCHANGED | local has 8 lines not upstream · upstream has 29 lines not local · upstream hash ec5377aacd03ef0b |
| `table` | DRIFT · UNCHANGED | local has 5 lines not upstream · upstream has 5 lines not local · upstream hash a71030ab5d09539d |
| `calendar` | DRIFT · NEW SINCE LAST RUN | local has 67 lines not upstream · upstream has 154 lines not local · upstream hash 87da62f4d705d454 |

**Summary:** 14 primitives checked · 14 drifted (total) · 3 new-since-last-run · 0 errors.
