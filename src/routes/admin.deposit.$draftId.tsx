import { createFileRoute, notFound } from "@tanstack/react-router"

import { DepositWorkspace } from "@/components/admin/deposit/deposit-workspace"
import { getDraftFn } from "@/server/deposit/functions"

/**
 * The deposit workspace for one draft.
 *
 * The draft already exists by the time this route is reached — it is created by
 * the landing screen's button and named in the URL, which also means the work
 * survives a refresh and can be linked to. A draft ID that does not resolve is
 * a 404 rather than a fresh draft, because silently creating one is how the
 * previous version got into trouble.
 */
export const Route = createFileRoute("/admin/deposit/$draftId")({
  loader: async ({ params }) => {
    const draft = await getDraftFn({ data: { reportId: params.draftId } })
    if (!draft) throw notFound()

    return { draft }
  },
  component: DepositWorkspaceRoute,
})

function DepositWorkspaceRoute() {
  const { draftId } = Route.useParams()
  const { draft } = Route.useLoaderData()

  return <DepositWorkspace reportId={draftId} initialDraft={draft} />
}
