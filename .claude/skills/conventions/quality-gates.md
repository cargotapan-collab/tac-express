# Convention — Quality Gates

> Cross-cutting rule. Applies to every task regardless of which specialist skill loaded.
> Authority: `AGENTS.md` § 8.

---

## The Five Must-Pass Commands

Run these from the workspace root (`c:\tac\tac-express`) before declaring any task done. ALL must pass.

```bash
pnpm typecheck                # Zero TypeScript errors
pnpm lint                     # Zero ESLint warnings (config enforces --max-warnings 0)
pnpm test                     # All unit tests pass
pnpm build                    # Both apps build (web + dashboard)
```

Plus, if the change touches `.md` governance or skills:

```bash
pnpm tsx scripts/audit-skills.ts   # Governance self-consistency
```

## When a gate fails

- **Don't suppress.** No `// eslint-disable` for the offending line, no `// @ts-ignore`, no `--no-verify`, no `skip()` on tests.
- **Diagnose the root cause.** Load `tac-debug` if needed.
- **Fix the cause, not the symptom.** If a test fails because of a real behaviour change, update the test only after confirming the new behaviour is intentional and documented.

## Pre-PR self-check (in addition to the five gates)

- [ ] Diff size ≤ 1,500 LoC additions (or PR description explains why the split would create more risk than the size)
- [ ] If touching `packages/services/src/orbital.service.ts` or any new direct-Supabase read → RLS audit linked
- [ ] If adding charts or large client-side libs → bundle-size delta measured
- [ ] If touching print routes / `<ShippingLabel>` / `<InvoicePrintView>` → visual snapshot run
- [ ] If a new feature could need rollback → entry added to `docs/ROLLBACK-PLAYBOOK.md`
- [ ] PR description names the issue it closes + the manual-verification test plan

## What to do when blocked

If a gate fails and you cannot diagnose the cause within a reasonable attempt:
1. Stop. Don't push.
2. Capture the failing command + output verbatim in a conversation note.
3. Load `tac-debug` and walk the root-cause protocol.
4. If still stuck, escalate to the user with what you tried and what you observed.

Never ship around a failing gate.
