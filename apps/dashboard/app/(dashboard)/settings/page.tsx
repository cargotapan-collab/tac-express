import type { Metadata } from "next"
import { SettingsClient } from "./settings-client"

export const metadata: Metadata = { title: "Settings | TAC Express" }

export default function SettingsPage() {
  return <SettingsClient />
}
