import { Link } from "@tanstack/react-router"

import type { FacetGroupProps, FacetRailProps } from "./types"
import {
  FACET_DIMENSIONS,
  FACET_PARAM,
  hasActiveFilters,
} from "@/core/reports/search-params"
import { facetLabels } from "@/core/config/reports"

// A left rail of facets, rendered as real anchors.
//
// Every value is a <Link>, which is an <a href> in the HTML — clicking one is a
// GET to a URL that fully describes the result set. That is what makes a
// filtered view linkable, bookmarkable and crawlable (design §12).
export function FacetRail({ facets, search }: FacetRailProps) {
  const active = hasActiveFilters(search)

  return (
    <aside aria-label="Filters" className="text-detail-xs">
      {active && (
        <Link
          to="/reports"
          search={{ q: search.q, page: 1 }}
          className="text-faded rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Clear filters
        </Link>
      )}

      <div className={active ? "mt-6 space-y-6" : "space-y-6"}>
        {FACET_DIMENSIONS.map((dimension) => (
          <FacetGroup
            key={dimension}
            dimension={dimension}
            values={facets[dimension]}
            search={search}
          />
        ))}
      </div>
    </aside>
  )
}

function FacetGroup({ dimension, values, search }: FacetGroupProps) {
  if (values.length === 0) return null

  const param = FACET_PARAM[dimension]
  const current = search[param]

  return (
    <section>
      <h2 className="text-faded text-detail-xs tracking-wide uppercase">
        {facetLabels[dimension]}
      </h2>

      <ul className="mt-2 space-y-1">
        {values.map((value) => {
          // Selecting a value that is already selected clears it, so the same
          // link is both "filter by this" and "stop filtering by this" and the
          // rail needs no separate remove control.
          const selected = String(current ?? "") === value.value
          // Facet values arrive from SQL as strings. The year has to go back
          // into the URL as a number or the router serializes it as a quoted
          // JSON string — `?year=%222026%22` parses correctly and reads
          // terribly, and a URL this page hands to a crawler should be clean.
          const next = selected
            ? undefined
            : dimension === "year"
              ? Number(value.value)
              : value.value

          return (
            <li key={value.value}>
              <Link
                to="/reports"
                search={(prev) => ({ ...prev, [param]: next, page: 1 })}
                aria-current={selected ? "true" : undefined}
                className={`group flex items-baseline justify-between gap-3 rounded-sm py-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                  selected ? "font-medium text-foreground" : "text-faded"
                }`}
              >
                <span className="group-hover:underline">{value.label}</span>
                <span className="font-mono tabular-nums opacity-60">
                  {value.count}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
