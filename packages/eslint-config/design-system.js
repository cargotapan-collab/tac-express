/**
 * TAC Express Design System Governance Rules
 * Derived from: TAC-EXPRESS-IMPLEMENTATION-PLAN-v2.md, Section 8
 * ESLint Flat Config format (ESLint v9+)
 *
 * All rules are "error" severity.
 * Violations BLOCK commits (pre-commit hook) and CI (GitHub Actions).
 * Zero warnings permitted — only hard failures.
 */

/** @type {import("eslint").Linter.Config} */
export const designSystemConfig = {
  rules: {
    /**
     * LAW 2: No direct icon library imports.
     * Icons must flow through @workspace/ui/icons only.
     *
     * LAW 3: No animation library except tw-animate-css.
     *
     * LAW 5: No UI components outside packages/ui.
     *
     * LAW 8: No direct Supabase client in apps/.
     */
    "no-restricted-imports": [
      "error",
      {
        paths: [
          // ── ICON VIOLATIONS ──────────────────────────────────────────
          {
            name: "lucide-react",
            message:
              '❌ [TAC LAW-2] lucide-react is NOT installed. Use: import { Icon } from "@workspace/ui/icons"',
          },
          // ── ANIMATION VIOLATIONS ─────────────────────────────────────
          {
            name: "framer-motion",
            message:
              "❌ [TAC LAW-3] framer-motion is LEGACY. Use the new 'motion' package instead: import { motion } from 'motion/react'",
          },
          {
            name: "@motionone/react",
            message:
              "❌ [TAC LAW-3] @motionone/react is FORBIDDEN. Use the new 'motion' package instead.",
          },
          // ── DATABASE VIOLATIONS ───────────────────────────────────────
          {
            name: "@supabase/supabase-js",
            message:
              '❌ [TAC LAW-8] Direct Supabase imports are FORBIDDEN in apps/. Use: import { ... } from "@workspace/database"',
          },
          // ── FORBIDDEN UTILITY LIBRARIES ───────────────────────────────
          {
            name: "axios",
            message: "❌ [TAC] axios is FORBIDDEN. Use native fetch() API.",
          },
          {
            name: "moment",
            message:
              "❌ [TAC] moment is FORBIDDEN. Use date-fns or native Intl API.",
          },
          {
            name: "lodash",
            message:
              "❌ [TAC] lodash is FORBIDDEN. Use native ES methods.",
          },
          // ── COMPONENT VIOLATIONS ──────────────────────────────────────
          {
            name: "@/components/ui",
            message:
              '❌ [TAC LAW-5] Import all components from "@workspace/ui" only. Not app-local shadcn copies.',
          },
        ],
        patterns: [
          // Block react-icons
          {
            group: ["react-icons", "react-icons/*"],
            message:
              '❌ [TAC LAW-2] react-icons is FORBIDDEN. Use: import { Icon } from "@workspace/ui/icons"',
          },
          // Block external UI libraries
          {
            group: ["@mui/*", "@mui/material", "@mui/icons-material"],
            message:
              "❌ [TAC LAW-5] MUI is FORBIDDEN. Use @workspace/ui components only.",
          },
          {
            group: ["@chakra-ui/*"],
            message:
              "❌ [TAC LAW-5] Chakra UI is FORBIDDEN. Use @workspace/ui components only.",
          },
          {
            group: ["antd", "antd/*"],
            message:
              "❌ [TAC LAW-5] Ant Design is FORBIDDEN. Use @workspace/ui components only.",
          },
          // Block GSAP
          {
            group: ["gsap", "gsap/*"],
            message:
              "❌ [TAC LAW-3] GSAP is FORBIDDEN. Use tw-animate-css classes.",
          },
          // Block styled-components
          {
            group: ["styled-components"],
            message:
              "❌ [TAC] styled-components is FORBIDDEN. Use TailwindCSS v4 tokens only.",
          },
          // Block shadcn/ui direct imports (must go through @workspace/ui)
          {
            group: ["@/components/ui/*"],
            message:
              '❌ [TAC LAW-5] Import from "@workspace/ui" — not local shadcn copies.',
          },
        ],
      },
    ],

    /**
     * LAW 1:  No color values outside packages/ui/src/styles/globals.css
     * LAW 9:  No hardcoded spacing arbitrary values
     * LAW 10: No hardcoded Tailwind color utilities
     */
    "no-restricted-syntax": [
      "error",

      // ── Block named Tailwind color utilities ──────────────────────────
      // e.g. bg-red-500, text-blue-400, border-green-300, ring-purple-500
      {
        selector:
          "JSXAttribute[name.name='className'] > Literal[value=/\\b(bg|text|border|ring|outline|fill|stroke|shadow|decoration|caret|accent|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)-[0-9]+\\b/]",
        message:
          "❌ [TAC LAW-10] Hardcoded Tailwind color class. Use semantic tokens: bg-primary, text-foreground, border-border, text-destructive, bg-muted, etc.",
      },

      // ── Block arbitrary color values in className ─────────────────────
      // e.g. className="bg-[#6d28d9]", className="bg-[rgb(0,0,0)]"
      {
        selector:
          "JSXAttribute[name.name='className'] > Literal[value=/\\[#[0-9a-fA-F]{3,8}\\]|\\[rgb|\\[hsl|\\[oklch/]",
        message:
          "❌ [TAC LAW-1] Arbitrary color value in className. Use CSS variables via var(--token) in style prop or semantic Tailwind class.",
      },

      // ── Block hardcoded colors in inline style prop ───────────────────
      {
        selector:
          "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression > Property[key.name=/(^color$|background|backgroundColor|borderColor|fill|stroke)/] > Literal[value=/^#|^rgb|^hsl|^blue|^red|^green|^white|^black/]",
        message:
          "❌ [TAC LAW-1] Hardcoded color in style prop. Use CSS variables: { color: 'var(--foreground)' }",
      },

      // ── Block arbitrary spacing in className ──────────────────────────
      // e.g. className="p-[13px]", className="mt-[27px]"
      {
        selector:
          "JSXAttribute[name.name='className'] > Literal[value=/\\b(p|pt|pr|pb|pl|px|py|m|mt|mr|mb|ml|mx|my|gap|space-x|space-y|w|h|min-w|min-h|max-w|max-h|inset|top|right|bottom|left)-\\[\\d/]",
        message:
          "❌ [TAC LAW-9] Arbitrary spacing value. Use Tailwind spacing scale (p-4, m-6, gap-3) — no arbitrary [px] values.",
      },

      // ── v6: Block arbitrary motion durations in className ─────────────
      // e.g. className="duration-[200ms]", className="duration-[450ms]"
      // Components must use the 3-layer motion vocabulary:
      //   instant     duration-[80ms]   (mission-control)
      //   smooth      duration-[180ms]  (modal/sheet)
      //   expressive  duration-[320ms]  (hero/onboarding)
      // Tailwind tokens duration-75 / duration-150 / duration-300 also OK.
      {
        selector:
          "JSXAttribute[name.name='className'] > Literal[value=/\\bduration-\\[(?!80ms\\]|180ms\\]|320ms\\])\\d+m?s\\]/]",
        message:
          "❌ [v6 motion] Arbitrary duration value. Use the 3-layer motion vocabulary: duration-[80ms] (instant), duration-[180ms] (smooth), or duration-[320ms] (expressive). See globals.css --motion-instant/smooth/expressive.",
      },
    ],
  },
}
