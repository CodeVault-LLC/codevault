import { createFileRoute, notFound } from "@tanstack/react-router"

import { NotFound } from "@/core/pages/not-found"
import { ReportRecord } from "@/components/reports/report-record"
import { fetchPublicReport } from "@/server/reports/functions"
import { formatAuthors } from "@/components/reports/format"
import { site } from "@/core/config/site"

export const Route = createFileRoute("/reports/$accessionId")({
  loader: async ({ params }) => {
    const report = await fetchPublicReport({
      data: { accessionId: params.accessionId },
    })

    // A record the viewer may not see and a record that does not exist are
    // deliberately the same answer — a 403 would confirm the record exists
    // (design §8.4).
    if (!report) throw notFound()

    return report
  },
  component: ReportRecordRoute,
  notFoundComponent: () => <NotFound />,
  head: ({ loaderData }) => {
    if (!loaderData) return {}

    return {
      meta: [
        { title: `${loaderData.title} — ${site.name}` },
        { name: "description", content: loaderData.abstract.slice(0, 300) },
        // Enough of a citation for a human-facing share card. The Highwire
        // Press tags Google Scholar actually reads land in Phase 3 (design §12).
        { name: "author", content: formatAuthors(loaderData.authors, 99) },
      ],
    }
  },
})

function ReportRecordRoute() {
  return <ReportRecord report={Route.useLoaderData()} />
}
