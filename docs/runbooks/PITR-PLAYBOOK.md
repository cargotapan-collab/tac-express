# PITR / Database Restore Playbook

> **STATUS: WONTFIX-UNLESS-TRIGGERED.** This document is intentionally a STUB. The substantive procedure will be written when a trigger condition fires (see below). Filing the stub now reserves the grep handle (`WONTFIX-UNLESS-TRIGGERED`) and the file path so a future incident-response agent doesn't waste 10 minutes asking "is there a runbook for this?"

**Pattern lineage:** same shape as `docs/audits/2026-05-15-rbac-denial-audit.md § 6 item 3` (PR #121), `dashboard.service.ts:getSLABreaches` SENTRY-SILENT-BY-DESIGN marker (PR #120), and `CLAUDE.md § 6` (PR #N landing this).

---

## Status

**Last reviewed:** 2026-05-16
**Re-evaluate at:** 2026-08-16 OR on trigger
**Triggers (any one re-opens this document):**

1. **Real incident:** Supabase project becomes unreachable for >15 min, OR data corruption is suspected, OR an accidental destructive query is run on production.
2. **Scheduled DR drill:** Owner schedules a deliberate restore test against a staging clone. (Recommended cadence: quarterly once the substantive runbook exists. Not scheduled today.)
3. **Compliance demand:** A customer or regulator requests the BCDR procedure document.
4. **Scale threshold:** Production data grows past 50GB (the cost of being unable to restore quickly compounds with data size).

---

## Why this is a stub today (the WONTFIX rationale)

Supabase auto-PITRs every Supabase project with the Pro plan and above:

- Point-in-time recovery within the retention window (default 7 days; can be extended to 30 days per Supabase plan tier — verify current plan at `https://supabase.com/dashboard/project/<project-ref>/settings/database`)
- Daily logical backups retained per the plan
- Read replicas available on Team+ plans

The procedural complexity is in the **decision points**, not the mechanics:
- WHICH point in time do we restore to?
- DO we restore to the same project or spin up a replica and re-point the application?
- HOW do we handle in-flight transactions during the restore window?
- WHAT downstream consumers (Sentry, Vercel, Upstash, WhatsApp queue) need re-sync?

These decisions need to be made **by an alert human, against the specific incident's facts**, not pre-baked into a runbook. The substantive runbook would prescribe a decision tree that may not match the actual incident's shape.

**The smaller, more honest artifact today:** the trigger conditions above + the fact that Supabase's own docs at `https://supabase.com/docs/guides/platform/backups` cover the mechanics. When an incident fires, the responder reads Supabase's docs + this file's "When triggered" section below, in that order.

---

## When triggered — what to write here

The substantive runbook should cover (in this order):

1. **First 15 minutes — assessment**
   - Is the project actually down vs. a transient network blip?
   - What's the last-known-good state? (Sentry breadcrumbs, last successful PR merge, last green CI run.)
   - Is data loss suspected, or is it pure availability?

2. **Decision tree — restore vs. replica vs. wait**
   - Restore-to-same-project: fast but destroys post-incident writes
   - Spin-up-replica-and-cutover: slower but preserves the post-incident state for forensics
   - Wait-for-Supabase: if Supabase status page acknowledges a platform issue, restore actions may compound the problem

3. **Mechanical steps per decision branch**
   - Supabase CLI commands
   - Vercel env-var updates if project ref changes
   - Sentry release tag updates
   - Upstash key rotation if applicable

4. **Post-restore verification**
   - `pnpm migrations-fresh-apply` against the restored DB confirms schema integrity
   - `node scripts/sentry/create-alert-rules.mjs --dry-run` confirms Sentry wiring survived
   - Smoke-test the canonical paths: invoice creation, payment recording, WhatsApp send

5. **Postmortem template**
   - Trigger that fired
   - Decision path taken
   - What worked / what didn't
   - Updates to THIS document so the next responder benefits

---

## Pattern note: deferral as discipline

Writing this stub instead of the full runbook is a deliberate trade. The CTO/PM/FSE call: spending one session writing a comprehensive DR runbook today, when no trigger has fired, would (a) produce decisions that don't match the actual incident shape when it eventually fires, AND (b) lock in those wrong decisions because the runbook itself becomes the canonical reference. A grep-able stub with explicit triggers is the smaller correct artifact.

This is the third instance of the WONTFIX-UNLESS-TRIGGERED pattern in this repo (PR #121 audit § 6 → PR #120 source markers → this file). The pattern is now codified.

**Filed under #102 Backlog → "PITR / database restore playbook."** Tick the #102 box when this status changes from STUB to substantive.
