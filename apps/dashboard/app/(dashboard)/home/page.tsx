import type { Metadata } from "next"
import { cookies } from "next/headers"
import { createDashboardServerService } from "@workspace/services/server"
import { HomeClient } from "./home-client"

export const metadata: Metadata = {
  title: "Overview | TAC Express Dashboard",
  description: "Logistics operations overview",
}

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const cookieStore = await cookies()
  const dashboardService = createDashboardServerService(cookieStore)
  const kpis = await dashboardService.getKPIs().catch(() => ({
    activeShipments: 0,
    inTransit: 0,
    delivered: 0,
    openExceptions: 0,
    totalRevenueToday: 0,
    pendingInvoices: 0,
    activeManifests: 0,
    shipmentsCreatedToday: 0,
  }))

  return <HomeClient initialKpis={kpis} />
}

