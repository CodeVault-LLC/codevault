import { createFileRoute } from "@tanstack/react-router"

import { DepositPage } from "@/components/admin/deposit/deposit-page"
import { createDraftFn, getDraftFn } from "@/server/deposit/functions"

// A fresh draft per visit. It is keyed by an internal UUID and burns no
// accession identifier — that is allocated at publish, so an abandoned draft
// never consumes one (design §4.5, §8.4).
export const Route = createFileRoute("/admin/deposit")({
  loader: async () => {
    const reportId = await createDraftFn()
    const draft = await getDraftFn({ data: { reportId } })

    return { reportId, draft: draft! }
  },
  component: DepositRoute,
})

function DepositRoute() {
  const { reportId, draft } = Route.useLoaderData()

  return <DepositPage reportId={reportId} initialDraft={draft} />
}
