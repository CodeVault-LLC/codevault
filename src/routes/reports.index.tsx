import { createFileRoute, stripSearchParams } from "@tanstack/react-router"

import {
  REPORT_SEARCH_DEFAULTS,
  reportSearchSchema,
} from "@/core/reports/search-params"
import { SearchResultsView } from "@/components/reports/search-results"
import { fetchReportSearch } from "@/server/reports/functions"
import { reportsArchive } from "@/core/config/reports"
import { site } from "@/core/config/site"

export const Route = createFileRoute("/reports/")({
  // Zod 4 works with `validateSearch` directly — no adapter needed (design §13).
  validateSearch: reportSearchSchema,
  // Keeps `?q=&page=1` off a URL that is at its defaults, so the archive's
  // canonical listing has exactly one address.
  search: { middlewares: [stripSearchParams(REPORT_SEARCH_DEFAULTS)] },
  // The loader depends on the whole search object, so a facet click refetches
  // and nothing else does.
  loaderDeps: ({ search }) => search,
  // Loaded server-side so the results ship as real anchors in the initial
  // HTML. A crawler that runs no JavaScript still sees every record
  // (design §12).
  loader: ({ deps }) => fetchReportSearch({ data: deps }),
  component: ReportsIndexRoute,
  head: () => ({
    meta: [
      { title: `${reportsArchive.name} — ${site.name}` },
      { name: "description", content: reportsArchive.description },
    ],
  }),
})

function ReportsIndexRoute() {
  return (
    <SearchResultsView
      results={Route.useLoaderData()}
      search={Route.useSearch()}
    />
  )
}
