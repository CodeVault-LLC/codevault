import { createFileRoute, stripSearchParams } from "@tanstack/react-router"

import {
  REPORT_SEARCH_DEFAULTS,
  reportSearchSchema,
} from "@/core/reports/search-params"
import { SearchResultsView } from "@/components/reports/search-results"
import { fetchReportSearch } from "@/server/reports/functions"
import { reportsArchive } from "@/core/config/reports"
import { seo } from "@/core/lib/seo"
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
  // The canonical is the bare listing, deliberately. `stripSearchParams` above
  // already keeps a defaulted URL clean, but a faceted one (`?q=…&page=3`) is
  // a view of the archive rather than a page of its own, and pointing every
  // one of them at /reports is what stops them competing with each other.
  head: () =>
    seo({
      title: `${reportsArchive.name} — ${site.name}`,
      description: reportsArchive.description,
      path: "/reports",
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
