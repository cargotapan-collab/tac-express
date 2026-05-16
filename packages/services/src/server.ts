import { createServerClient } from "@workspace/database/client"
import { createDashboardService } from "./dashboard.service"
import { createShipmentService } from "./shipment.service"
import { createManifestService } from "./manifest.service"
import { createInvoiceService } from "./invoice.service"
import { createExceptionService } from "./exception.service"
import { createCustomerService } from "./customer.service"
import { createAnalyticsService } from "./analytics.service"
import { createAdminService } from "./admin.service"
import {
  createTrackedWhatsAppServiceFromEnv,
  type TrackedWhatsAppService,
} from "./whatsapp-tracked.service"

type CookieStore = Parameters<typeof createServerClient>[0]

export function createDashboardServerService(cookieStore: CookieStore) {
  return createDashboardService(createServerClient(cookieStore))
}

export function createShipmentServerService(cookieStore: CookieStore) {
  return createShipmentService(createServerClient(cookieStore))
}

export function createManifestServerService(cookieStore: CookieStore) {
  return createManifestService(createServerClient(cookieStore))
}

export function createInvoiceServerService(cookieStore: CookieStore) {
  return createInvoiceService(createServerClient(cookieStore))
}

export function createExceptionServerService(cookieStore: CookieStore) {
  return createExceptionService(createServerClient(cookieStore))
}

export function createCustomerServerService(cookieStore: CookieStore) {
  return createCustomerService(createServerClient(cookieStore))
}

export function createAnalyticsServerService(cookieStore: CookieStore) {
  return createAnalyticsService(createServerClient(cookieStore))
}

export function createAdminServerService(cookieStore: CookieStore) {
  return createAdminService(createServerClient(cookieStore))
}

/**
 * Tracked WhatsApp service bound to the per-request Supabase client.
 *
 * Wraps createWhatsAppService with whatsapp_sends delivery-tracking writes
 * (see packages/services/src/whatsapp-tracked.service.ts header + the
 * PHASE-0 decision doc at docs/decisions/2026-05-17-whatsapp-sends-mechanism.md
 * for the full contract). The Supabase client honours the caller's RLS —
 * INSERT/UPDATE on whatsapp_sends require role ∈ SUPER_ADMIN / ADMIN /
 * MANAGER / INVOICE / FINANCE_STAFF.
 *
 * The route handler at apps/dashboard/app/api/whatsapp/send-invoice/route.ts
 * is the single consumer today; it passes invoiceId + userId on each send
 * so the resulting whatsapp_sends row is linked back to the invoice and
 * the operator.
 */
export function createTrackedWhatsAppServerService(
  cookieStore: CookieStore,
): TrackedWhatsAppService {
  return createTrackedWhatsAppServiceFromEnv(createServerClient(cookieStore))
}
