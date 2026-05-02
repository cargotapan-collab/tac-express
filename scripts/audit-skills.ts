#!/usr/bin/env tsx
/**
 * audit-skills.ts
 *
 * Self-consistency audit for tac-express governance files.
 * Checks for stale references across AGENTS.md, CLAUDE.md, PROJECT-RULES.md,
 * DESIGN_SYSTEM.md, and all SKILL.md files in .agents/skills/ and .claude/skills/.
 *
 * Usage: pnpm tsx scripts/audit-skills.ts
 * Or:    node --experimental-vm-modules scripts/audit-skills.ts
 */

import { readFileSync, readdirSync, statSync } from "fs"
import { join } from "path"

const ROOT = join(__dirname, "..")
let errors = 0
let warnings = 0

function fail(file: string, issue: string) {
  console.error(`  ❌ FAIL  [${file}] ${issue}`)
  errors++
}

function warn(file: string, issue: string) {
  console.warn(`  ⚠️  WARN  [${file}] ${issue}`)
  warnings++
}

function pass(label: string) {
  console.log(`  ✅ PASS  ${label}`)
}

function readFile(filePath: string): string {
  try {
    return readFileSync(filePath, "utf-8")
  } catch {
    return ""
  }
}

function collectSkillFiles(dir: string): string[] {
  const results: string[] = []
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        const skillFile = join(full, "SKILL.md")
        try {
          statSync(skillFile)
          results.push(skillFile)
        } catch {
          // no SKILL.md in this dir
        }
      }
    }
  } catch {
    // dir doesn't exist
  }
  return results
}

// ─── Governance files ────────────────────────────────────────────────────────
const govFiles: Record<string, string> = {
  "AGENTS.md": readFile(join(ROOT, "AGENTS.md")),
  "CLAUDE.md": readFile(join(ROOT, "CLAUDE.md")),
  "PROJECT-RULES.md": readFile(join(ROOT, "PROJECT-RULES.md")),
  "DESIGN_SYSTEM.md": readFile(join(ROOT, "DESIGN_SYSTEM.md")),
}

// ─── Skill files ─────────────────────────────────────────────────────────────
// `.claude/skills/` is the canonical location (Claude Code primary).
// `.agents/skills/` is preserved for compatibility with the GSD framework.
// `.windsurf/skills/` was removed in the 2026-05-02 doc cleanup.
const agentSkills = collectSkillFiles(join(ROOT, ".agents/skills"))
const claudeSkills = collectSkillFiles(join(ROOT, ".claude/skills"))
const allSkills = [...agentSkills, ...claudeSkills]

const allFiles: Record<string, string> = { ...govFiles }
for (const f of allSkills) {
  const label = f.replace(ROOT, "").replace(/\\/g, "/")
  allFiles[label] = readFile(f)
}

console.log("\n╔════════════════════════════════════════════╗")
console.log("║  TAC Express — Governance Audit            ║")
console.log("╚════════════════════════════════════════════╝\n")

// ─── CHECK 1: No stale Clerk references ──────────────────────────────────────
console.log("► CHECK 1: No Clerk references")
const clerkPatterns = [
  "@clerk/nextjs",
  "ClerkProvider",
  "UserButton",
  "useUser",
  "auth() from clerk",
  "clerk_user_id",
  "Clerk JWT",
]
for (const [label, content] of Object.entries(allFiles)) {
  for (const pattern of clerkPatterns) {
    if (content.toLowerCase().includes(pattern.toLowerCase())) {
      fail(label, `Contains stale Clerk reference: "${pattern}"`)
    }
  }
}
pass("Clerk reference scan complete")

// ─── CHECK 2: No stale ZNG references ────────────────────────────────────────
console.log("\n► CHECK 2: No ZNG design system references")
const zngPatterns = ["ZNG", "Zen/Neo-Glass", "Nordic Sharp", "VELOX Aurora"]
for (const [label, content] of Object.entries(allFiles)) {
  for (const pattern of zngPatterns) {
    if (content.includes(pattern)) {
      fail(label, `Contains stale design system reference: "${pattern}"`)
    }
  }
}
pass("Design system reference scan complete")

// ─── CHECK 3: Law count is always 'Fourteen' or '14' — never 'Ten', 'Twelve', '10', '12' ────
console.log("\n► CHECK 3: Law count consistency (must be Fourteen/14 — not Ten/Twelve/10/12)")
const staleCountPatterns = ["Twelve Laws", "Twelve laws", "Ten Laws", "Ten laws", "the 10 laws", "the 12 laws", "12 laws", "10 laws"]
for (const [label, content] of Object.entries(allFiles)) {
  for (const pattern of staleCountPatterns) {
    if (content.includes(pattern)) {
      fail(label, `Stale law count: "${pattern}" — must be "Fourteen Laws" or "14 laws"`)
    }
  }
}
pass("Law count scan complete")

// ─── CHECK 4: Forbidden packages not mentioned as 'approved' ─────────────────
console.log("\n► CHECK 4: Forbidden packages not listed as approved/active")
const forbiddenPackages = [
  "lucide-react",
  "framer-motion",
  "@motionone/react",
  "gsap",
  "styled-components",
  "@mui/material",
  "antd",
  "chakra-ui",
  "react-icons",
  "@tabler/icons-react",
]
// Only flag if they appear in an 'approved' or 'active' context
for (const [label, content] of Object.entries(allFiles)) {
  for (const pkg of forbiddenPackages) {
    // Naive check: appears in an "Active" column context
    if (content.match(new RegExp(`\\| \`?${pkg.replace("/", "/")}\`? \\| [✅]? ?Active`))) {
      fail(label, `Forbidden package listed as Active: "${pkg}"`)
    }
  }
}
pass("Forbidden package approval scan complete")

// ─── CHECK 5: Required skills exist ──────────────────────────────────────────
console.log("\n► CHECK 5: Required canonical skills exist")
const requiredSkills = [
  "tac-express-onboarding",
  "tac-express-rules",
  "tac-express-stack",
  "tac-express-ui",
  "tac-express-auth",
  "tac-express-conventions",
  "karpathy-coding",
  "gsd",
]
const existingSkillNames = agentSkills.map((f) => {
  const parts = f.replace(/\\/g, "/").split("/")
  return parts[parts.length - 2] // dir name
})
for (const skill of requiredSkills) {
  if (existingSkillNames.includes(skill)) {
    pass(`  Skill exists: .agents/skills/${skill}/SKILL.md`)
  } else {
    fail(".agents/skills/", `Missing required skill: "${skill}/SKILL.md"`)
  }
}

// ─── CHECK 6: No npx in skill files (use pnpm dlx) ───────────────────────────
console.log("\n► CHECK 6: No 'npx' commands in skill files (use pnpm dlx)")
for (const f of allSkills) {
  const label = f.replace(ROOT, "").replace(/\\/g, "/")
  const content = readFile(f)
  // Allow npx in comments that reference avoiding it
  const lines = content.split("\n")
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.includes("npx ") && !line.includes("never npx") && !line.trim().startsWith("#") && !line.trim().startsWith("//") && !line.trim().startsWith(">")) {
      // Skip lines within a forbidden-example block (preceded by ❌ / Forbidden: / Avoid:)
      const lookback = lines.slice(Math.max(0, i - 3), i + 1).join("\n")
      if (/❌|Forbidden:|Avoid:|never use/i.test(lookback)) continue
      warn(label, `Line ${i + 1}: Contains "npx " — use "pnpm dlx" instead`)
    }
  }
}
pass("npx reference scan complete")

// ─── CHECK 7: AGENTS.md references both apps in architecture ─────────────────
console.log("\n► CHECK 7: AGENTS.md documents both apps")
const agentsMd = govFiles["AGENTS.md"]!
if (agentsMd.includes("apps/web") && agentsMd.includes("apps/dashboard")) {
  pass("AGENTS.md documents both apps/web and apps/dashboard")
} else {
  fail("AGENTS.md", "Missing one or both app entries (apps/web, apps/dashboard)")
}

// ─── CHECK 8: Auth package documented ────────────────────────────────────────
console.log("\n► CHECK 8: Auth package documented in governance files")
const authKeywords = ["packages/auth", "@workspace/auth"]
for (const keyword of authKeywords) {
  let found = false
  for (const [label, content] of Object.entries(govFiles)) {
    if (content.includes(keyword)) { found = true; break }
  }
  if (found) {
    pass(`  "${keyword}" documented in governance files`)
  } else {
    warn("governance files", `"${keyword}" not found in any governance file`)
  }
}

// ─── CHECK 9: No 'npm install' or 'yarn add' in skill files ──────────────────
// Skill files MAY document forbidden patterns (e.g. inside a "❌ Forbidden:"
// example block). The check below is line-level and skips: comment-prefixed
// lines, blockquotes, and any line within 3 lines of a "❌" / "Forbidden:"
// / "Avoid:" marker.
console.log("\n► CHECK 9: No npm/yarn install commands in skill files")
// Word-boundary regex so `pnpm install` (which contains the substring
// "npm install") doesn't false-trigger on the `npm install` pattern.
const pmPatterns: Array<{ rx: RegExp; label: string }> = [
  { rx: /\bnpm install\b/, label: "npm install" },
  { rx: /\bnpm i\b/, label: "npm i" },
  { rx: /\byarn add\b/, label: "yarn add" },
  { rx: /\byarn install\b/, label: "yarn install" },
]
for (const f of allSkills) {
  const label = f.replace(ROOT, "").replace(/\\/g, "/")
  const content = readFile(f)
  const lines = content.split("\n")
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ""
    const trimmed = line.trim()
    if (trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed.startsWith(">")) continue
    // Skip if this line OR any of the previous 3 non-blank lines marks a
    // forbidden-example block.
    const lookback = lines.slice(Math.max(0, i - 3), i + 1).join("\n")
    if (/❌|Forbidden:|Avoid:|never use/i.test(lookback)) continue
    for (const pattern of pmPatterns) {
      if (pattern.rx.test(line)) {
        fail(label, `Line ${i + 1}: Contains "${pattern.label}" — use "pnpm add" instead`)
      }
    }
  }
}
pass("Package manager command scan complete")

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
console.log("\n╔════════════════════════════════════════════╗")
if (errors === 0 && warnings === 0) {
  console.log("║  ✅ ALL CHECKS PASSED — Governance clean   ║")
} else {
  console.log(`║  Results: ${errors} error(s), ${warnings} warning(s)${" ".repeat(Math.max(0, 15 - String(errors + warnings).length))}     ║`)
}
console.log("╚════════════════════════════════════════════╝\n")

if (errors > 0) {
  process.exit(1)
}
