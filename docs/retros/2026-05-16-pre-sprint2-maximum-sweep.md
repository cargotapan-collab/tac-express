# Pre-Sprint-2 Maximum-Sweep Session Retro — 2026-05-16

> Three sequential PRs (#126 → #128) consolidating #102 backlog deferrals before Sprint 2's per-PR-per-session cadence kicks in. Continues the post-two-day-arc arc (see [`docs/retros/2026-05-15-2026-05-16-two-day-arc.md`](2026-05-15-2026-05-16-two-day-arc.md)).

**Author:** Claude Code (Opus 4.7), PM-mode + Senior FSE + Big-Tech CTO
**Branch state at session start:** `main` at `994d12b` (post-#125)
**Branch state at session end:** `main` at `188e31c` (post-#128)
**Total PRs merged:** 3 (#126 → #128)

---

## 0. TL;DR

| PR | Title | Net |
|---|---|---|
| [#126](https://github.com/cargotapan-collab/tac-express/pull/126) | docs(102): owner tick-list + WONTFIX codifications | 2 commits, docs-only |
| [#127](https://github.com/cargotapan-collab/tac-express/pull/127) | chore(archive): orphan UI + scratchpad docs | 2 commits, +97/-0 + 6 file renames + lint update |
| [#128](https://github.com/cargotapan-collab/tac-express/pull/128) | fix(types): cast cleanups via root-cause fixes | 3 commits, +34/-170 |

**Casts dropped:** 4 (`proxy.ts × 2`, `track/[awb]/page.tsx × 2`, `ops-create-invoice-live.tsx`).
**Casts kept + documented:** 1 (`invoice-pdf/route.ts:111` → `THIRD-PARTY-TYPE-GAP` grep handle).
**Lockfile shrinkage:** 146 lines (`next@16.1.6` → `16.2.6` dedupe).
**User-visible bug fix:** public tracking page Mode column now correctly shows "Air" for EXPRESS/PRIORITY shipments (was ALWAYS "Surface").
**#102 sub-items ticked:** 3 — orphan UI archive, scratchpad doc archive, as-unknown-as casts removed.

---

## 1. What survived

Permanent infrastructure / discipline added this session:

- **`_archive/` subtree convention** now extends to `packages/ui/src/components/composed/` and `docs/`. Matches `supabase/migrations/_archive/` (which predates this session). `audit:governance` taught to skip the subtrees.
- **`THIRD-PARTY-TYPE-GAP` grep handle** at `apps/dashboard/app/api/public/invoice-pdf/route.ts:107`. Joins the family: `SENTRY-MIGRATION-DEFERRED` (PR #114), `SENTRY-SILENT-BY-DESIGN` (PR #120), `WONTFIX-UNLESS-TRIGGERED` (PR #126). Same shape: cite the upstream gap + the runtime contract + the trigger to revisit.
- **`AIR_SERVICE_PATTERN` module-level const** in `apps/dashboard/app/track/[awb]/page.tsx`. Single source of truth for the public-tracking air-vs-surface predicate (used in 3 places: ModeIcon, Mode stat, computeEta SLA).
- **Two stale #102 backlog lines identified and explicitly documented:**
  - "7 dashboard cards" → cards are LIVE behind the `tac-design` v7 flag. Documented in [`packages/ui/src/components/composed/_archive/2026-05-16/README.md`](../../packages/ui/src/components/composed/_archive/2026-05-16/README.md).
  - "`docs/NEXT-SESSION-HANDOFF.md` archive" → handoff doc was promoted to load-bearing cross-session protocol artifact during the two-day arc. Documented in [`docs/_archive/2026-05-14/README.md`](../_archive/2026-05-14/README.md).

---

## 2. What didn't

**Nothing abandoned mid-arc.** Both stale #102 lines (above) were explicitly *renounced* with a written explanation in the archive READMEs — not silently skipped. The discipline: if you can't act on a #102 line because the line is wrong, NAME why it's wrong so the next contributor doesn't re-open it.

---

## 3. Bidirectional learnings

### CodeRabbit caught a textbook catalog-pattern #4 violation by the agent

Round 1 (PR γ): agent extracted `/express|priority/i` into `isAirService` at 2 call sites (ModeIcon + Mode stat).

Round 2 (PR γ): CodeRabbit found a **third** occurrence at line 221 (`computeEta` SLA calc) using **reversed alternation order** `/priority|express/i`. The agent's grep for `express|priority` returned only the 2 sites it consolidated; the 3rd was invisible to that exact-string search.

This is catalog pattern #4 ("sweep the whole describe block, not one site at a time") manifesting on regex alternation. The first agent fix consolidated 2 of 3 because the third site had alternation order reversed.

**New rule for the catalog (entry #10):** when extracting a regex pattern, grep both alternation orders OR grep for each alternative independently. The alternation operator commutes; the literal source-text grep doesn't.

CodeRabbit replied confirming the fix lands clean across all 3 sites. Bot-side learning recorded.

### The cast comment WAS the documentation, but never the fix

`proxy.ts:79`'s cast had been there with a comment saying "duplicate-Next type install in the monorepo (multiple pnpm-resolved next@16.1.6 hashes)". The comment named the root cause and stated "the runtime types are identical".

That comment had existed for an unknown duration. Nobody read it as a fixable issue — it read as documentation of a permanent fact. But the actual fix was a 2-character version bump in 2 package.json files (16.1.6 → 16.2.6 to match the apps) + `pnpm install`. Lockfile dropped 146 lines. Cast deleted.

**New rule for the catalog (entry #11):** A cast with a "we have to do this because X is impossible to fix" comment IS a cast worth fixing. The comment IS the bug ticket; nobody re-reads it because it reads as a permanent fact. Periodically grep for `as unknown as` followed within 10 lines by a `Cast through unknown` / `duplicate` / `type-only bridge` comment and treat them as candidates for re-evaluation.

### Audit-governance now multi-purpose

The script started as a forbidden-package check (LAW 2 / LAW 8). It's accreted: orange-tailwind check (LAW 1), backdrop-blur check, dangerouslySetInnerHTML marquee-specific check, LAW 2 app-component allowlist, orphan-component gate + baseline. This session added `_archive/` subtree skip + removed the dead marquee check.

The script is approaching the size where "splitting it" might be considered. Not now — under 400 lines and each section has a comment block explaining its purpose. But: by the time we have 8+ distinct checks, the next agent should consider whether to split into `audit-laws.mjs` + `audit-orphans.mjs` + `audit-allowlists.mjs`. Trigger: when adding a new check requires reading >100 lines of unrelated code to find the insertion point.

---

## 4. The cast inventory revisited

The original #102 audit listed 4 cast sites with line numbers. Reality (this session):

| Audit said | Reality |
|---|---|
| `track/[awb]/page.tsx` (no line) | Lines 57 + 98 — **2 sites, dead defensive code hiding a bug** |
| `proxy.ts:21-22` | Lines 79 + 106 — **2 sites, duplicate-Next workaround** |
| `ops-create-invoice-live.tsx:88` | Line 263 — **1 site, under-typed mutation noise** |
| `invoice-pdf/route.ts` (no line) | Line 111 — **1 site, third-party type gap (kept)** |

So 4 audit entries → 6 reality sites, with 100% line-number drift on the entries that named lines. This is catalog pattern #5 ("no hardcoded line numbers in audits") applying retroactively to an earlier audit doc.

**Recommendation for future audit docs:** quote a 3-5 token grep handle for each site (e.g., `service_level (track page)`, `Parameters<typeof createMiddlewareClient> (proxy.ts)`). The grep handle is stable across refactors; line numbers aren't.

---

## 5. CI behavior on this branch

All three PRs got full CI runs:
- PR α (#126, docs-only): 3 checks ran (Macroscope ×2 + CodeRabbit review-skipped via path-filter)
- PR β (#127): 10/10 checks green, no inline findings
- PR γ (#128): 10/10 checks green, 2 substantive CodeRabbit nitpicks (both addressed)

CodeRabbit cycle time:
- Round 1 inline finding → fix-pushed → "Confirmed" reply: ~3 min
- Round 2 inline finding → fix-pushed → "Confirmed" reply: ~2 min

This is faster than the PR #123 baseline (~10-15 min per cycle). Either CR is faster now, or the smaller-PR scope reduced cycle time. The next session's substantive PR should re-measure.

---

## 6. Sprint 2 cadence — the test

The two-day-arc retro at `§ 5` codified: "Sprint 2 cadence: ONE PR per session." This session shipped THREE PRs, which violates that rule on its face.

**The defense:** these three PRs were "pre-Sprint-2 cleanup" — short, low-risk, sequential, and each ticking #102 boxes that had been deferred during the two-day arc. The cadence rule is for **substantive Sprint 2 work** (shipment.service.ts, manifest.service.ts, whatsapp.service.ts, E2E suites). Cleanup work that consolidates loose ends from prior sprints is the correct shape for multi-PR sessions.

The trigger-condition in the two-day-arc retro § 5 stated: "Default is one-PR. Multi-PR cadence MAY return if Sprint 2 surfaces three or more sub-200-LoC follow-up issues in the same session that could legitimately ship together." This session is exactly that shape, but pre-Sprint-2 rather than mid-Sprint-2. The rule held.

**Next session: hard one-PR.** The shipment.service.ts test floor is the lead task (per [`docs/NEXT-SESSION-HANDOFF.md`](../NEXT-SESSION-HANDOFF.md)).

---

## 7. Honest read

Three things I'd extract:

**(a) The `next` version bump should have been done weeks ago.** The cast comment named the root cause; the fix was 2 character edits. The reason it wasn't fixed: nobody re-read the comment with "is this fixable" in mind. The pattern (cast comment = bug ticket) should be a discipline going forward, not a one-time observation.

**(b) "Dead defensive cast = real bug" is now confirmed on this codebase.** The track-page Mode column was ALWAYS rendering "Surface" for EXPRESS shipments. The cast was the only thing hiding it. **If a cast asserts a field shape, grep the data layer for the field — if the data layer doesn't supply it, the cast is hiding a bug, not defending against one.** This deserves a catalog entry.

**(c) Two stale #102 lines is not zero stale lines.** The backlog is canonical, but it's also written-once and not re-validated as the codebase moves. Both stale lines in this session were items that became inappropriate due to design system changes (`tac-design` v7 flag) or process maturation (handoff doc promotion). Periodic backlog re-validation against current code state would catch these before an agent acts on them and creates churn.

The most surprising outcome: the `proxy.ts` casts coming out as a 2-character fix in `package.json`. The comment had said "TS-only bridge"; the implication was "load-bearing forever." The reality was "load-bearing because nobody bumped two dev-dependencies." **Read load-bearing-cast comments adversarially**, especially when the comment names a specific cause and the cause is something fixable.
