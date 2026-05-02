import type { Metadata } from "next"
import { ManifestDetailClient } from "./manifest-detail-client"

export const metadata: Metadata = { title: "Manifest Details | TAC Express" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function ManifestDetailPage({ params }: Props) {
  const { id } = await params
  return <ManifestDetailClient manifestId={id} />
}
