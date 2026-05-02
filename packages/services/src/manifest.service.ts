import type { SupabaseClient } from "@workspace/database/supabase.types"
import type { Manifest, ManifestSummary, ManifestFilters } from "@workspace/types"
import { ManifestStatus } from "@workspace/types"

export function createManifestService(db: SupabaseClient) {
  return {
    async getManifests(filters: ManifestFilters = {}): Promise<ManifestSummary[]> {
      let query = db
        .from("manifests")
        .select("id, manifest_number, status, transport_mode, origin_hub, dest_hub, total_shipments, total_pieces, total_weight, departure_date, created_at")
        .order("created_at", { ascending: false })
        .limit(filters.pageSize ?? 50)

      if (filters.status?.length) query = query.in("status", filters.status)
      if (filters.originHub) query = query.eq("origin_hub", filters.originHub)
      if (filters.destHub) query = query.eq("dest_hub", filters.destHub)
      if (filters.search) query = query.ilike("manifest_number", `%${filters.search}%`)

      const { data, error } = await query
      if (error) throw error
      return (data ?? []).map(mapManifestSummary)
    },

    async getManifestById(id: string): Promise<Manifest | null> {
      const { data, error } = await db
        .from("manifests")
        .select("*")
        .eq("id", id)
        .single()
      if (error) throw error
      return data ? mapManifest(data) : null
    },

    async getManifestShipments(manifestId: string) {
      const { data, error } = await db
        .from("manifest_shipments")
        .select(`shipment_id, awb_number, added_at, added_by, shipments(status, pieces, chargeable_weight)`)
        .eq("manifest_id", manifestId)
        .order("added_at", { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => {
        const r = row as Record<string, unknown>
        const shipment = r.shipments as Record<string, unknown> | null
        return {
          id: r.shipment_id as string,
          awb_number: r.awb_number as string,
          added_at: r.added_at as string,
          status: shipment?.status as string ?? "UNKNOWN",
          pieces: shipment?.pieces as number ?? 0,
          chargeable_weight: shipment?.chargeable_weight as number ?? 0,
        }
      })
    },

    async createManifest(input: {
      transportMode: string
      originHub: string
      destHub: string
      notes?: string
    }): Promise<Manifest> {
      const { data, error } = await db
        .from("manifests")
        .insert({
          transport_mode: input.transportMode,
          origin_hub: input.originHub,
          dest_hub: input.destHub,
          notes: input.notes,
          status: ManifestStatus.DRAFT,
        })
        .select()
        .single()
      if (error) throw error
      return mapManifest(data)
    },

    async addShipmentToManifest(manifestId: string, awbNumber: string): Promise<void> {
      const { error } = await db.from("manifest_shipments").insert({
        manifest_id: manifestId,
        awb_number: awbNumber,
      })
      if (error) throw error
    },

    async removeShipmentFromManifest(manifestId: string, awbNumber: string): Promise<void> {
      const { error } = await db
        .from("manifest_shipments")
        .delete()
        .eq("manifest_id", manifestId)
        .eq("awb_number", awbNumber)
      if (error) throw error
    },

    async closeManifest(manifestId: string): Promise<void> {
      const { error } = await db.rpc("close_manifest_atomic", { p_manifest_id: manifestId })
      if (error) throw error
    },

    async departManifest(manifestId: string): Promise<void> {
      const { error } = await db
        .from("manifests")
        .update({ status: ManifestStatus.DEPARTED, departed_at: new Date().toISOString() })
        .eq("id", manifestId)
      if (error) throw error
    },

    async arriveManifest(manifestId: string): Promise<void> {
      const { error } = await db
        .from("manifests")
        .update({ status: ManifestStatus.ARRIVED, arrived_at: new Date().toISOString() })
        .eq("id", manifestId)
      if (error) throw error
    },

    async reconcileManifest(manifestId: string): Promise<void> {
      const { error } = await db
        .from("manifests")
        .update({ status: ManifestStatus.RECONCILED })
        .eq("id", manifestId)
      if (error) throw error
    },
  }
}

function mapManifestSummary(row: Record<string, unknown>): ManifestSummary {
  return {
    id: row.id,
    manifestNumber: row.manifest_number,
    status: row.status,
    transportMode: row.transport_mode,
    originHub: row.origin_hub,
    destHub: row.dest_hub,
    totalShipments: (row.total_shipments as number) ?? 0,
    totalPieces: (row.total_pieces as number) ?? 0,
    totalWeight: (row.total_weight as number) ?? 0,
    departureDate: row.departure_date as string | undefined,
    createdAt: row.created_at,
  } as unknown as ManifestSummary
}

function mapManifest(row: Record<string, unknown>): Manifest {
  return {
    id: row.id,
    manifestNumber: row.manifest_number,
    status: row.status,
    transportMode: row.transport_mode,
    originHub: row.origin_hub,
    destHub: row.dest_hub,
    departureDate: row.departure_date,
    arrivalDate: row.arrival_date,
    totalShipments: (row.total_shipments as number) ?? 0,
    totalPieces: (row.total_pieces as number) ?? 0,
    totalWeight: (row.total_weight as number) ?? 0,
    createdBy: row.created_by,
    closedBy: row.closed_by,
    departedBy: row.departed_by,
    arrivedBy: row.arrived_by,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as unknown as Manifest
}

