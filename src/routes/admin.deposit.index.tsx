import { createFileRoute } from "@tanstack/react-router"

import { DepositLanding } from "@/components/admin/deposit/deposit-landing"
import { listDraftsFn } from "@/server/deposit/functions"

/**
 * The deposit landing screen.
 *
 * This loader reads. It does not write, and that is the entire point of the
 * route existing separately from the workspace: the previous version created a
 * draft row here, so every visit — including a refresh or a back-navigation —
 * minted a report nobody had asked for. Creating a draft is now an explicit
 * POST from a button (design §8.4: a draft that is never published should not
 * burn anything, least of all silently).
 */
export const Route = createFileRoute("/admin/deposit/")({
  loader: async () => ({
    drafts: await listDraftsFn(),
    // The server's clock, not the renderer's, so relative timestamps render
    // identically during SSR and hydration.
    generatedAt: new Date(),
  }),
  component: DepositIndexRoute,
})

function DepositIndexRoute() {
  const { drafts, generatedAt } = Route.useLoaderData()

  return <DepositLanding drafts={drafts} generatedAt={generatedAt} />
}
