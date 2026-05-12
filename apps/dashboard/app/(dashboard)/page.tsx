import { redirect } from "next/navigation"

// As of May 2026, `/` redirects directly to the Paper Ops Console. The proxy
// (`proxy.ts`) handles this earlier in the request pipeline; this server
// redirect is the defense-in-depth fallback in case the proxy is ever bypassed.
export default function DashboardRootPage() {
  redirect("/ops-console")
}
