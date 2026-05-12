import { redirect } from "next/navigation"

/**
 * Customer detail is served by the v6 surface — it carries the full feature
 * set (edit form via `useUpdateCustomer`, Notes thread via `useNotes` +
 * `useCreateNote` + `useDeleteNote`, shipment history with status filters).
 * The paper variant once existed here as a simplified read-only view; that
 * dropped functionality, which violates the project rule "forbidden to
 * change features — only UI/UX". We redirect so any bookmarked or linked
 * `/ops-console/customers/[id]` URL still resolves to the full v6 surface.
 *
 * When a paper variant with full parity ships, replace this redirect with a
 * `<OpsCustomerDetailLive id={id} />` render again.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/customers/${id}`)
}
