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

    const withdrawn = loaderData.status === "withdrawn"

    return {
      meta: [
        {
          title: withdrawn
            ? `Withdrawn: ${loaderData.title} — ${site.name}`
            : `${loaderData.title} — ${site.name}`,
        },
        { name: "description", content: loaderData.abstract.slice(0, 300) },
        // Enough of a citation for a human-facing share card. The Highwire
        // Press tags Google Scholar actually reads land in Phase 3 (design §12).
        { name: "author", content: formatAuthors(loaderData.authors, 99) },
        // A tombstone must keep resolving — that is the whole reason
        // withdrawal is a state transition and not a delete — but it should not
        // go on competing in search results with reports the archive still
        // stands behind. `follow` stays on so the links out of it are still
        // walked.
        ...(withdrawn ? [{ name: "robots", content: "noindex, follow" }] : []),
      ],
    }
  },
})

function ReportRecordRoute() {
  return <ReportRecord report={Route.useLoaderData()} />
}
