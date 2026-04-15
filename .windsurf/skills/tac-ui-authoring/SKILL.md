---
name: tac-ui-authoring
description: "MANDATORY when writing or modifying any UI component in TAC Express. Enforces ZNG design system tokens, CVA pattern, packages/ui location, and Radix/shadcn primitives."
---

# TAC Express — UI Component Authoring

Every UI component in this project MUST follow the ZNG (Zen/Neo-Glass) design system and the strict component authoring pattern below.

> **Before starting:** Check `packages/ui/src/components/` — does a similar component already exist? Extend it before creating a new one.

---

## Pre-Flight Checklist

```
[ ] Component doesn't already exist in packages/ui/src/components/
[ ] Design approved via tac-brainstorming skill
[ ] Failing test written (tac-tdd)
[ ] ZNG tokens identified in DESIGN_SYSTEM.md
[ ] Radix primitive identified (if applicable)
```

---

## Component File Structure

```
packages/ui/src/components/
  ComponentName/
    ComponentName.tsx         ← implementation
    ComponentName.test.tsx    ← co-located tests
    index.ts                  ← re-export
```

**OR** for simple single-file components:

```
packages/ui/src/components/
  ComponentName.tsx
  ComponentName.test.tsx
```

Add to `packages/ui/src/index.ts` exports after creation.

---

## Component Template

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@workspace/ui/lib/utils"

const componentVariants = cva(
  // Base classes — ZNG tokens only, no raw colors
  [
    "relative inline-flex items-center",
    "transition-all duration-[250ms] ease-out",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--bg-secondary)]",
          "border border-[var(--border-subtle)]",
          "text-[var(--foreground)]",
        ],
        glass: [
          "bg-[var(--glass-bg)]",
          "backdrop-blur-xl",
          "border border-[var(--glass-border)]",
          "shadow-[var(--shadow-md)]",
          "text-[var(--foreground)]",
          "hover:bg-[var(--glass-bg-hover)]",
          "hover:border-[var(--glass-highlight)]",
        ],
        accent: [
          "bg-gradient-to-r from-[rgba(125,249,255,0.15)] to-[rgba(167,139,250,0.1)]",
          "border border-[var(--accent-primary)]",
          "text-[var(--accent-primary)]",
          "hover:shadow-[var(--glow-cyan)]",
        ],
      },
      size: {
        sm: "text-sm px-3 py-1.5 rounded-[var(--radius-sm)]",
        md: "text-base px-4 py-2 rounded-[var(--radius-md)]",
        lg: "text-lg px-6 py-3 rounded-[var(--radius-lg)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  asChild?: boolean
}

function ComponentName({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      data-slot="component-name"
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { ComponentName, componentVariants }
export type { ComponentProps }
```

---

## ZNG Design Tokens — Quick Reference

Use these CSS variables in your className strings:

```
Backgrounds:
  var(--background)          deep night page
  var(--bg-secondary)        card/panel bg
  var(--glass-bg)            glass card bg
  var(--glass-bg-hover)      glass hover state

Borders:
  var(--border-subtle)       subtle borders
  var(--glass-border)        glass card border
  var(--glass-highlight)     hover highlight border

Text:
  var(--foreground)          primary text
  var(--text-secondary)      supporting text
  var(--text-muted)          labels, placeholders

Accents (10% rule — interactive only):
  var(--accent-primary)      cyber cyan
  var(--accent-secondary)    soft violet
  var(--accent-success)      jade green
  var(--accent-warning)      muted gold
  var(--accent-danger)       soft red

Shadows:
  var(--shadow-sm/md/lg/xl)  elevation shadows
  var(--glow-cyan)            cyan glow on hover
  var(--glow-violet)          violet glow

Radius:
  var(--radius-sm)   8px   inputs
  var(--radius-md)   12px  buttons
  var(--radius-lg)   16px  cards
  var(--radius-xl)   20px  glass cards
```

---

## Radix Primitive Mapping

When a Radix primitive exists, wrap it — don't build from scratch:

| UI Need | Radix Primitive | Import |
|---------|----------------|--------|
| Dialog/Modal | `@radix-ui/react-dialog` | via shadcn |
| Dropdown | `@radix-ui/react-dropdown-menu` | via shadcn |
| Select | `@radix-ui/react-select` | via shadcn |
| Popover | `@radix-ui/react-popover` | via shadcn |
| Tooltip | `@radix-ui/react-tooltip` | via shadcn |
| Tabs | `@radix-ui/react-tabs` | via shadcn |
| Checkbox | `@radix-ui/react-checkbox` | via shadcn |
| Switch | `@radix-ui/react-switch` | via shadcn |

Add via: `pnpm dlx shadcn@latest add [component]` from workspace root.

---

## Glass Card Pattern (Most Used)

```tsx
<div
  data-slot="glass-card"
  className={cn(
    "rounded-[var(--radius-xl)]",
    "bg-[var(--glass-bg)] backdrop-blur-xl",
    "border border-[var(--glass-border)]",
    "shadow-[var(--shadow-md)]",
    "p-6",
    "transition-all duration-[250ms] ease-out",
    "hover:bg-[var(--glass-bg-hover)]",
    "hover:border-[var(--glass-highlight)]",
    "hover:shadow-[var(--shadow-lg)]",
    className
  )}
  {...props}
/>
```

---

## Icon Usage

```tsx
import { RiArrowRightLine } from "@workspace/ui/icons"

// Always:
<RiArrowRightLine className="size-5 text-[var(--text-muted)]" aria-hidden="true" />

// With label context:
<button aria-label="Next page">
  <RiArrowRightLine className="size-5" aria-hidden="true" />
</button>
```

---

## Animation Patterns

```tsx
// Entrance:
className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300"

// Exit:
className="animate-out fade-out-0 slide-out-to-bottom-2 duration-200"

// Hover lift:
className="transition-transform duration-200 hover:-translate-y-0.5"

// Hover glow:
className="transition-shadow duration-300 hover:shadow-[var(--glow-cyan)]"
```

---

## Validation Before Export

```
[ ] data-slot attribute set
[ ] Named export (not default)
[ ] CVA variants use ZNG tokens only
[ ] No raw hex colors in className
[ ] No Tailwind color classes (bg-blue-*, text-red-*)
[ ] No arbitrary [px] values
[ ] TypeScript props interface defined and exported
[ ] Accessibility attributes present (aria-*, role)
[ ] Exported from packages/ui/src/index.ts
[ ] Tests written alongside (tac-tdd)
```
