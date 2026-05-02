import type { Metadata } from "next"
import { ExceptionDetailClient } from "./exception-detail-client"

export const metadata: Metadata = { title: "Exception Detail | TAC Express" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function ExceptionDetailPage({ params }: Props) {
  const { id } = await params
  return <ExceptionDetailClient exceptionId={id} />
}
