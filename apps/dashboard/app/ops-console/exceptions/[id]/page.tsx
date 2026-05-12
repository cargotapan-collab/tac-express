import { redirect } from "next/navigation"

/**
 * Exception detail is served by the v6 surface — it carries the
 * `ExceptionResolveForm` with a real text input for the resolution note.
 * The paper variant once existed here but submitted a hardcoded resolution
 * string, silently dropping operator input — which violates the project
 * rule "forbidden to change features — only UI/UX". We redirect so any
 * bookmarked or linked `/ops-console/exceptions/[id]` URL still resolves
 * to the full v6 surface.
 *
 * When a paper variant with full parity ships (resolution textarea +
 * isResolved gate), replace this redirect with `<OpsExceptionDetailLive />`.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/exceptions/${id}`)
}
