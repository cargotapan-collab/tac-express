import { cookies } from "next/headers"

import { captureRbacDenial } from "@workspace/auth"
import { getServerAuth } from "@workspace/auth/server"
import { isManagerOrAbove } from "@workspace/auth/rbac"
import {
  createAdminServerService,
  createTrackedWhatsAppServerService,
} from "@workspace/services/server"
import { OpsWhatsAppFailedSendsView } from "@workspace/ui/components/composed/ops-console/pages"
import { UserRole } from "@workspace/types"

/**
 * Server-side wrapper for the WhatsApp failed-sends operator triage page
 * (backlog item W2 — issue #142, PR 1 of 2).
 *
 * Responsibilities (LAW 5 — apps/ holds composition + data, NOT reusable
 * UI; the OpsWhatsAppFailedSendsView is pure in packages/ui):
 *  1. Authenticate via `getServerAuth(cookieStore)` + look up the user's
 *     role on `public.profiles`. Mirrors the role-gate in
 *     `apps/dashboard/app/api/whatsapp/send-invoice/route.ts`.
 *  2. Gate at MANAGER+ — same scope as the `whatsapp_sends_select_admin`
 *     RLS policy. Defense-in-depth: RLS returns 0 rows for unauthorized
 *     callers; this page short-circuits before the query.
 *  3. On RBAC denial: emit `captureRbacDenial(...)` + render a minimal
 *     "Not authorized" view (no PII, no row data).
 *  4. On allowed: call `listFailedWhatsappSends()` on the tracked-
 *     WhatsApp service directly (server component → service is the
 *     idiomatic Next.js 16 read path; an API route is reserved for
 *     PR 2's POST /retry-send mutation per the brief's read/retry split).
 *  5. Pass `rows` + `windowDays` to the pure view.
 *
 * Zero retry-related code in this PR (PR 2 adds the button + the POST
 * route + the in-flight state).
 */

const WINDOW_DAYS = 7

export async function OpsWhatsAppFailedSendsLive() {
  const cookieStore = await cookies()
  const auth = getServerAuth(cookieStore)
  const user = await auth.getUser().catch(() => null)
  if (!user) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Sign in required.
      </div>
    )
  }

  const adminService = createAdminServerService(cookieStore)
  const profile = await adminService.getProfileById(user.id).catch(() => null)
  const role = profile?.role as UserRole | undefined
  if (!role || !isManagerOrAbove(role)) {
    captureRbacDenial({
      requiredRole: UserRole.MANAGER,
      actualRole: role ?? UserRole.OPS_STAFF,
      surface: "/ops-console/whatsapp/failed-sends",
    })
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Not authorized. This view requires MANAGER role or above.
      </div>
    )
  }

  const svc = createTrackedWhatsAppServerService(cookieStore)
  const rows = await svc.listFailedWhatsappSends({ sinceDays: WINDOW_DAYS })

  return <OpsWhatsAppFailedSendsView rows={rows} windowDays={WINDOW_DAYS} />
}
