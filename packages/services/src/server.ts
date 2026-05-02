import { createServerClient } from "@workspace/database/client"
import { createDashboardService } from "./dashboard.service"
import { createShipmentService } from "./shipment.service"
import { createManifestService } from "./manifest.service"
import { createInvoiceService } from "./invoice.service"
import { createExceptionService } from "./exception.service"
import { createCustomerService } from "./customer.service"
import { createAnalyticsService } from "./analytics.service"
import { createAdminService } from "./admin.service"

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
