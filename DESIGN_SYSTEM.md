# Nordic Sharp / SaaS Design System

This document outlines the strict geometric and typographic constraints governing the TAC Express interface. 
We strictly implement **Nordic Sharp Minimalism** — removing all elements of Neo-Glass, Brutalism, and unnecessary depth.

## Core Philosophy: The Sharp Grid
- **Function Over Form:** Every visual element must serve a hierarchical or functional purpose.
- **Extreme Contrast:** Rely on typography weight and stark geometric spacing rather than color accents or drop shadows.
- **Zero-Tolerance Rounding:** All `border-radius` variables are locked to `0px`. Circular elements are strictly forbidden unless describing native icon vectors.

## Topology & Borders
- **Strictly 0px Radius:** No `rounded-md`, `rounded-full`, etc. All geometry is sharp.
- **Divider Hierarchy:**
  - `border-subtle` (8% opacity): Used for internal grid delineation.
  - `border-strong` (30% opacity): Used for interactive bounds and input fields.
- **Bento Grid Refinement:** Asymmetric grids must rely on whitespace and 1px borders to separate content, not shadows or gradient blurs.

## Color Foundation (Deep Night)
- **Background:** `--background: #0B0F14` (Deep Night).
- **Secondary Surface:** `--bg-secondary: #11161C`.
- **Text Primary:** `--foreground: #E6EDF3`.
- **Text Secondary/Muted:** `--muted-foreground: #6B7280`.

## Interactions & Motion (Solid Physics)
- No `hover:shadow-brutal` or soft glowing neon drop-shadows.
- Buttons `btn-primary` utilize pure, inverted-fill contrast on hover or strict `2px` hard offsets in mono-color.
- Easing: Use linear or swift snaps. No prolonged floating/drifting.
- Z-Index mechanics rely on opacity layers of pure black shadows rather than glowing colors.

*Violation of these rules, including the re-introduction of `rounded` utility classes, breaks the CI.*
