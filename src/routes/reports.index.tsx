import { createFileRoute } from "@tanstack/react-router"

import { ReportList } from "@/components/reports/report-list"
import { fetchPublicReports } from "@/server/reports/functions"
import { reportsArchive } from "@/core/config/reports"
import { site } from "@/core/config/site"

const PAGE_SIZE = 50

export const Route = createFileRoute("/reports/")({
  // Loaded server-side so the listing ships as real anchors in the initial
  // HTML. A crawler that runs no JavaScript still sees every record
  // (design §12).
  loader: () => fetchPublicReports({ data: { limit: PAGE_SIZE, offset: 0 } }),
  component: ReportsIndexRoute,
  head: () => ({
    meta: [
      { title: `${reportsArchive.name} — ${site.name}` },
      { name: "description", content: reportsArchive.description },
    ],
  }),
})

function ReportsIndexRoute() {
  return <ReportList reports={Route.useLoaderData()} />
}
