import { readdirSync, readFileSync, statSync } from "node:fs"
import { extname, join, relative, sep } from "node:path"

const root = process.cwd()
const excludedDirs = new Set([
  "node_modules",
  ".next",
  "dist",
  "coverage",
  "playwright-report",
  ".turbo",
  // `.claude/` houses git worktrees + skill files — both legitimately
  // contain source-shaped artefacts (other-branch code under
  // `worktrees/`, skill markdown that may quote forbidden patterns) that
  // shouldn't trip the governance scan.
  ".claude",
])
const sourceExtensions = new Set([".ts", ".tsx"])
const errors = []

function collectFiles(directory) {
  const entries = []
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      if (!excludedDirs.has(entry)) {
        entries.push(...collectFiles(fullPath))
      }
      continue
    }
    if (stats.isFile() && sourceExtensions.has(extname(entry))) {
      entries.push(fullPath)
    }
  }
  return entries
}

function collectPackageManifests(directory) {
  const entries = []
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      if (!excludedDirs.has(entry)) {
        entries.push(...collectPackageManifests(fullPath))
      }
      continue
    }
    if (stats.isFile() && entry === "package.json") {
      entries.push(fullPath)
    }
  }
  return entries
}

function toRepoPath(filePath) {
  return relative(root, filePath).split(sep).join("/")
}

function fail(filePath, message) {
  errors.push(`${toRepoPath(filePath)} — ${message}`)
}

const files = collectFiles(root)
const packageManifests = collectPackageManifests(root)

for (const file of files) {
  const repoPath = toRepoPath(file)
  const content = readFileSync(file, "utf8")

  // LAW 8 — `@supabase/supabase-js` only in packages/database OR in
  // Supabase Edge Functions (which run on Deno and import via JSR /
  // esm.sh by design — see `tac-api-surface` skill). Both are legitimate.
  if (
    !repoPath.startsWith("packages/database/") &&
    !repoPath.startsWith("supabase/functions/") &&
    content.includes("@supabase/supabase-js")
  ) {
    fail(file, "imports @supabase/supabase-js outside packages/database")
  }

  if (content.includes("text-orange-500") || content.includes("border-orange-500") || content.includes("bg-orange-500")) {
    fail(file, "uses named orange Tailwind color utilities")
  }

  if (content.includes("backdrop-blur")) {
    fail(file, "uses backdrop blur instead of solid TAC Precision overlay")
  }

  if (repoPath === "packages/ui/src/components/composed/marquee.tsx" && content.includes("dangerouslySetInnerHTML")) {
    fail(file, "defines scoped keyframes instead of using globals.css")
  }
}

for (const file of packageManifests) {
  const repoPath = toRepoPath(file)
  const content = readFileSync(file, "utf8")

  if (!repoPath.startsWith("packages/database/") && content.includes("\"@supabase/supabase-js\"")) {
    fail(file, "declares @supabase/supabase-js outside packages/database")
  }
}

if (errors.length > 0) {
  console.error("Governance audit failed:")
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log("Governance audit passed")
