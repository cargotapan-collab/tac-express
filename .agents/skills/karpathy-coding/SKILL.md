---
name: karpathy-coding
description: >
  Behavioral guidelines to reduce common LLM coding mistakes.
  Adapted from Andrej Karpathy's observations on LLM coding pitfalls and integrated
  with TAC Express monorepo constraints. Load this skill before ANY non-trivial task:
  feature work, bug fixes, refactors, and code reviews.
  Biases toward caution over speed — use judgment for truly trivial one-liners.
---

# Karpathy Coding Principles — TAC Express Edition

> Derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls.
> Enhanced for the TAC Express monorepo architecture, ZNG design system, and The Twelve Laws.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks (typo fixes, obvious one-liners), use judgment — not every change needs the full rigor.

---

## PRINCIPLE 1 — Think Before Coding

> "The models make wrong assumptions on your behalf and just run along with them without checking." — Karpathy

**Don't assume. Don't hide confusion. Surface tradeoffs.**

### Before writing a single line:

1. **State assumptions explicitly.** If uncertain about scope, data shape, user intent, or edge cases — ASK, don't guess.
2. **Surface ambiguity.** If the request has multiple valid interpretations, present them. Never pick silently.
3. **Push back when warranted.** If a simpler approach exists, say so. If the ask would violate The Twelve Laws, name the violation and propose a compliant alternative.
4. **Stop when confused.** Name what's unclear. Ask for clarification before proceeding.

### TAC Express–specific checks BEFORE coding:

- Which package does this code belong in? (`packages/ui`, `packages/services`, `packages/database`, `apps/web`, `apps/dashboard`)
- Does this violate any of The Twelve Laws? (see `tac-express-rules` skill)
- Am I about to install a forbidden package?
- Is this business logic ending up in a component instead of `packages/services`?
- Am I touching a font, or directly calling Supabase?

### Anti-pattern examples:

```
❌ "Add an export feature" → immediately writes a function exporting all users to a JSON file
✅ "Before implementing, I need to clarify: all users or filtered? download or API? which fields?"

❌ "Make it faster" → adds Redis cache, async processing, and indexes all at once
✅ "Make it faster could mean: (1) response time, (2) concurrent throughput, (3) perceived UX speed. Which?"

❌ "Update the shipment status" → writes a `status` field on the shipment record
✅ Flags: ADR-004 says status is event-derived, not stored. Offering the correct event-based approach.
```

---

## PRINCIPLE 2 — Simplicity First

> "They really like to overcomplicate code and APIs, bloat abstractions, don't clean up dead code." — Karpathy

**Minimum code that solves the problem. Nothing speculative.**

### Rules:

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, **rewrite it**.
- Add complexity only when the actual requirement makes it necessary.

**The test:** "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### TAC Express–specific simplicity rules:

- Don't pre-build multi-variant CVA components when only one variant is needed yet.
- Don't create a service layer for something that will only ever be called once.
- Don't add loading/error states to a component that has no async data yet.
- Don't add Zod schemas for data that isn't user-facing input yet.
- Don't create new tokens in `globals.css` when existing ones already express the intent.

### Anti-pattern example:

```tsx
// ❌ Over-abstracted for a simple case
const DiscountStrategy = { Percentage: ..., Fixed: ..., Tiered: ... }
class DiscountCalculator { constructor(config: DiscountConfig) { ... } }

// ✅ What was actually asked
function calculateDiscount(amount: number, percent: number): number {
  return amount * (percent / 100)
}
```

---

## PRINCIPLE 3 — Surgical Changes

> "They still sometimes change/remove comments and code they don't sufficiently understand." — Karpathy

**Touch only what you must. Clean up only your own mess.**

### When editing existing TAC Express files:

- Do **NOT** "improve" adjacent code, comments, or formatting.
- Do **NOT** refactor things that aren't broken.
- **Match existing style**, even if you'd do it differently. (Same quote style, same spacing pattern.)
- If you notice unrelated dead code, **mention it** — don't delete it.
- Do **NOT** add `data-slot` or `className` rewrites to components you aren't specifically tasked to modify.

### When YOUR changes create orphans:

- Remove imports, variables, and functions that **your changes** made unused.
- Do NOT remove pre-existing unused code unless explicitly asked.

### The surgical test:

> Every changed line must trace directly to the user's request.
> If you can't explain why a line changed, revert it.

### TAC Express–specific surgical rules:

- Don't reorder exports in `packages/ui/src/components/index.ts` unless the task requires it.
- Don't rename CSS custom properties you didn't introduce.
- Don't touch `apps/web/app/layout.tsx` fonts unless the task is specifically font-related (ADR-005).
- Don't "clean up" `globals.css` tokens while fixing a layout bug.
- Don't switch `var(--token)` to inline hex while "just fixing padding".

### Anti-pattern example:

```diff
  // ❌ Drive-by refactoring — bug fix + unsolicited improvements
- def validate(user_data):
+ def validate(user_data: dict) -> bool:  # Added type hints nobody asked for
+   """Validate user data."""                # Added docstring nobody asked for
+   email = user_data.get('email', '').strip()
...

  // ✅ Surgical — only the broken line changes
  def validate(user_data):
-   if not user_data.get('email'):
+   email = user_data.get('email', '')
+   if not email or not email.strip():
      raise ValueError("Email required")
```

---

## PRINCIPLE 4 — Goal-Driven Execution

> "LLMs are exceptionally good at looping until they meet specific goals. Don't tell it what to do, give it success criteria and watch it go." — Karpathy

**Define success criteria. Loop until verified.**

### Transform imperative tasks into verifiable goals:

| Instead of... | Transform to... |
|---------------|-----------------|
| "Add validation" | "Write tests for invalid inputs → make them pass" |
| "Fix the bug" | "Write a test that reproduces it → make it pass" |
| "Refactor X" | "Ensure tests pass before and after" |
| "Make it look better" | "Apply ZNG glass-card pattern → screenshot for review" |
| "Integrate the service" | "Mock at DB boundary → unit test passes → integration test passes" |

### For multi-step tasks, state the plan explicitly:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

### TAC Express verification ladder (use in order):

```
Level 1: pnpm typecheck            → zero TypeScript errors
Level 2: pnpm lint --max-warnings 0→ zero ESLint warnings
Level 3: pnpm test                 → all tests pass
Level 4: pnpm build                → build succeeds in all packages
Level 5: Browser check             → feature works end-to-end in dev
Level 6: Visual review             → ZNG token compliance, no hardcoded values
```

### Anti-pattern example:

```
❌ Vague:  "I'll fix the authentication system by reviewing and improving the code."
✅ Clear:  
   1. Write test: change password → old session invalidated → verify: test FAILS (reproduces bug)
   2. Implement: invalidate sessions on password change → verify: test PASSES
   3. Run: pnpm test → all auth tests still pass
   4. Run: pnpm build → succeeds
```

---

## QUICK DECISION MATRIX

Use this before any task to select the right operating mode:

| Task Type | Mode | Apply Principles |
|-----------|------|-----------------|
| Obvious 1-liner / typo fix | Speed | 3 (surgical) only |
| Bug fix | Caution | 1 + 3 + 4 |
| New feature | Full rigor | All 4 |
| Refactor | Caution | 1 + 2 + 3 + 4 |
| Code review | Full rigor | All 4 |
| Design/token change | Full rigor | 1 + 3 + Law compliance |

---

## TAC EXPRESS LAW COMPLIANCE CHECKLIST

Run this before every PR, not just at the end of each phase:

```
[ ] LAW  1 — No color value outside packages/ui/src/styles/globals.css
[ ] LAW  2 — No icon except @remixicon/react via @workspace/ui/icons
[ ] LAW  3 — No animation library except tw-animate-css
[ ] LAW  4 — No font declaration except in apps/web/app/layout.tsx
[ ] LAW  5 — No UI component in apps/ — only in packages/ui
[ ] LAW  6 — No database call in any component — only via packages/services
[ ] LAW  7 — No business logic in components — only in packages/services
[ ] LAW  8 — No @supabase/supabase-js import in apps/ — only via packages/database
[ ] LAW  9 — No hardcoded spacing, radius, or shadow values
[ ] LAW 10 — No Tailwind color class (bg-blue-500, text-red-400) — semantic tokens only
[ ] LAW 11 — No arbitrary Tailwind values (w-[347px], h-[52px]) — scale tokens only
[ ] LAW 12 — No npm or yarn — pnpm only across entire monorepo
```

---

## VIOLATION RESPONSE PROTOCOL

When asked to do something that violates The Twelve Laws or these principles:

```
Response format:
"I can't do that — it violates [LAW X / Principle N].

What you asked: [restate request]
Why it violates: [brief explanation]
Compliant approach: [concrete alternative]"
```

Never silently comply with a violation. Always name it and propose the fix.

---

## HOW TO KNOW IT'S WORKING

These principles are succeeding when you observe:

- ✅ **Fewer unnecessary diff lines** — only requested changes appear
- ✅ **No rewrites due to overcomplication** — code is simple the first time
- ✅ **Questions arrive before implementation** — not after mistakes
- ✅ **Clean, minimal PRs** — no drive-by refactoring or "improvements"
- ✅ **Zero Law violations** at quality gate
- ✅ **Short feedback loops** — each step verifiable before the next

---

## REFERENCES

- Original: [CLAUDE.md by forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills/blob/main/CLAUDE.md)
- Examples: [EXAMPLES.md](https://github.com/forrestchang/andrej-karpathy-skills/blob/main/EXAMPLES.md)
- Karpathy post: https://x.com/karpathy/status/2015883857489522876
- TAC Express rules: `.agents/skills/tac-express-rules/SKILL.md`
- TAC Express master: `.agents/skills/MASTER-RULES.md`
