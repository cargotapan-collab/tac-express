import { redirect } from "next/navigation"

/**
 * Management (staff + hubs + tariffs + permissions) is served by the v6
 * surface — it carries the full HubsManager (Add Hub dialog), RolesMatrix,
 * StaffTable with role editing, and invite flow. The paper variant once
 * existed here as a read-only stat view with decorative tabs that didn't
 * swap content — that left operators on fresh installs unable to create
 * the first hub (TestSprite TC011 caught this as a production blocker).
 *
 * Redirect preserves URL stability so the paper sidebar "Management" link
 * still works, while routing operators to the full v6 management surface.
 * When a paper variant with full parity ships, replace this redirect with
 * `<OpsManagementLive />` again.
 */
export default function OpsConsoleManagementPage() {
  redirect("/management")
}
