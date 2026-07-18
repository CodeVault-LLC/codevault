import type { SearchResultsViewProps } from "./types"
import { Container } from "@/components/layout/container"
import { FacetRail } from "./facet-rail"
import { Pagination } from "./pagination"
import { ReportRow } from "./report-row"
import { SearchBar } from "./search-bar"
import { hasActiveFilters } from "@/core/reports/search-params"
import { reportsArchive } from "@/core/config/reports"

// The archive's front door: search across the top, facets in a left rail,
// dense catalogue rows down the middle (design §13).
//
// Everything here is server-rendered from the loader, so the initial HTML a
// crawler receives already contains the rows and their links.
export function SearchResultsView({ results, search }: SearchResultsViewProps) {
  const filtered = hasActiveFilters(search)

  return (
    <Container className="py-10 md:py-12">
      <header className="max-w-2xl">
        <h1 className="text-display-m font-semibold text-balance">
          {reportsArchive.name}
        </h1>
        <p className="text-faded mt-3 text-paragraph-s text-pretty">
          {reportsArchive.description}
        </p>
      </header>

      <div className="mt-8 max-w-2xl">
        <SearchBar search={search} total={results.total} />
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-[13rem_1fr] md:gap-12">
        <FacetRail facets={results.facets} search={search} />

        <div>
          {results.reports.length === 0 ? (
            <p className="text-faded border-faded border-t py-8 text-paragraph-s">
              {filtered
                ? reportsArchive.emptySearch
                : reportsArchive.emptyListing}
            </p>
          ) : (
            <>
              <ul className="border-faded border-t">
                {results.reports.map((report) => (
                  <ReportRow key={report.accessionId} report={report} />
                ))}
              </ul>
              <Pagination page={search.page} total={results.total} />
            </>
          )}
        </div>
      </div>
    </Container>
  )
}
