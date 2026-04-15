---
name: tac-code-review
description: "Use when completing a feature, before merging a PR, or after fixing a bug. Reviews for law compliance, ZNG adherence, architecture correctness, and code quality."
---

# TAC Express — Code Review

Invoke this skill before any merge to main, after completing a feature, or when a fresh perspective is needed.

> **Core principle:** Review early, review often. Catching violations at review is cheaper than in production.

---

## Review Checklist (Run in This Order)

### 1. Law Compliance (Hard Gates — Any Violation = Reject)

```
[ ] LAW 1: No color values outside globals.css
         grep -r "#[0-9A-Fa-f]{3,6}" packages/ui/src/components apps/
         Should return: nothing (except comments)

[ ] LAW 2: No lucide-react, react-icons, or other icon libs
         grep -r "from 'lucide-react'" .
         grep -r "from 'react-icons'" .

[ ] LAW 3: No framer-motion, gsap, @motionone
         grep -r "framer-motion\|gsap\|@motionone" .

[ ] LAW 5: No components in apps/*/components/
         find apps/ -name "*.tsx" -path "*/components/*"
         All should be pages/layouts, not reusable components

[ ] LAW 8: No supabase-js in apps/
         grep -r "@supabase/supabase-js" apps/
         Should return: nothing

[ ] LAW 10: No raw Tailwind color classes
          grep -r "bg-blue-\|bg-red-\|bg-green-\|text-blue-\|text-red-" .
          grep -r "bg-\[#\|text-\[#" .

[ ] LAW 11: No arbitrary pixel values
          grep -r "w-\[.*px\]\|h-\[.*px\]\|p-\[.*px\]\|m-\[.*px\]" .

[ ] LAW 12: No npm/yarn usage
          grep -r '"scripts"' apps/*/package.json packages/*/package.json
          Ensure no "npm run" or "yarn" in scripts
```

### 2. Architecture Review

```
[ ] Data flow respected: UI → packages/services → packages/database
[ ] No business logic inside React components (only display/interaction logic)
[ ] No direct Supabase calls outside packages/database
[ ] All new types in packages/types (not inline in components)
[ ] Cross-package imports use @workspace/* aliases (not relative ../../../)
```

### 3. ZNG Design Compliance

```
[ ] All CSS variables used (not raw hex values)
[ ] Glass card pattern used correctly (var(--glass-bg), backdrop-blur, border)
[ ] Accent colors used sparingly (interactive states only — 10% rule)
[ ] Animation uses tw-animate-css classes (not inline keyframes)
[ ] Radius uses var(--radius-*) tokens (not rounded-lg etc.)
[ ] Typography uses font-heading / font-sans / font-mono classes
[ ] Icons: @remixicon/react via @workspace/ui/icons, size-* class, aria-hidden
```

### 4. Component Quality

```
[ ] data-slot attribute on every component root element
[ ] Named exports only — no export default for components
[ ] CVA used for variants (not conditional className strings)
[ ] Exported from packages/ui/src/index.ts
[ ] Props interface extends HTML element types
[ ] asChild pattern implemented (using Radix Slot)
[ ] TypeScript — no `any` types
[ ] No TODO comments without TAC-XXX ticket reference
```

### 5. Test Coverage

```
[ ] Test file exists alongside implementation
[ ] Each CVA variant has a test
[ ] Interactive states tested (click, keyboard, focus)
[ ] Service tests mock at database boundary
[ ] Error states covered
[ ] All tests pass: pnpm test
```

### 6. Build & Lint Gates

```bash
pnpm lint --max-warnings 0     ← MUST be zero
pnpm typecheck                  ← MUST be zero errors
pnpm build                      ← MUST succeed
pnpm test                       ← MUST all pass
```

---

## Review Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **CRITICAL** | Law violation, security issue, data loss risk | Block merge immediately |
| **IMPORTANT** | Architecture violation, missing tests, type errors | Fix before merge |
| **MINOR** | Style preference, naming, micro-optimization | Fix if quick, else ticket |
| **NOTE** | Observation, future improvement | Ticket for later |

---

## Self-Review Template

Use this before requesting a human review:

```
## Self-Review: [Feature Name]
Date: YYYY-MM-DD

### Laws Compliance
[ ] LAW 1-12 verified via grep commands above

### Architecture
[ ] Data flow correct
[ ] No forbidden imports

### ZNG Design
[ ] Tokens used correctly
[ ] Glass patterns applied

### Tests
[ ] All new code has tests
[ ] pnpm test passes

### Build
[ ] pnpm build succeeds
[ ] pnpm lint --max-warnings 0 passes
[ ] pnpm typecheck passes

### Issues Found & Fixed
- [list any issues caught and resolved]

### Remaining Concerns
- [anything needing human review]
```

---

## Common Review Failures in This Codebase

| Pattern | Violation | Fix |
|---------|-----------|-----|
| `className="bg-[#11161C]"` | LAW 1 | `className="bg-[var(--bg-secondary)]"` |
| `import { X } from 'lucide-react'` | LAW 2 | `import { RiX } from "@workspace/ui/icons"` |
| `export default function Card` | Component standard | `function Card` + `export { Card }` |
| `import { createClient } from '@supabase/supabase-js'` in `apps/` | LAW 8 | Move to `packages/database` |
| `const db = await getUser()` in component body | LAW 6/7 | Move to service, pass as prop/hook |
| `rounded-2xl` in component | LAW 9 | `rounded-[var(--radius-xl)]` |
