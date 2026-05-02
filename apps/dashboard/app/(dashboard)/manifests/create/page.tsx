import type { Metadata } from "next"
import { CreateManifestClient } from "./create-manifest-client"

export const metadata: Metadata = { title: "Create Manifest | TAC Express" }

export default function CreateManifestPage() {
  return <CreateManifestClient />
}
