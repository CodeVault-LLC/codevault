import { Link } from "@tanstack/react-router"

import type { BrowseIndexProps } from "./types"
import { Container } from "@/components/layout/container"
import { reportsArchive } from "@/core/config/reports"

// Walking the shelves: every year and every subject, each one link away
// (design §13).
//
// This page exists as much for crawlers as for readers. It is the hub that
// keeps every record within a couple of links of the homepage without a
// thousand-row listing, and every entry is a plain <a href> to a filtered
// search — the same URLs the facet rail produces.
export function BrowseIndexView({ index }: BrowseIndexProps) {
  return (
    <Container className="py-10 md:py-12">
      <header className="max-w-2xl">
        <h1 className="text-display-m font-semibold text-balance">
          {reportsArchive.browseTitle}
        </h1>
        <p className="text-faded mt-3 text-paragraph-s text-pretty">
          {reportsArchive.browseDescription}
        </p>
        <p className="text-faded mt-3 font-mono text-detail-xs">
          {index.total} {index.total === 1 ? "record" : "records"}
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-faded text-detail-xs tracking-wide uppercase">
          By year
        </h2>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {index.years.map((year) => (
            <li key={year.year}>
              <Link
                to="/reports"
                search={{ year: year.year, page: 1, q: "" }}
                className="group rounded-sm font-mono text-paragraph-s focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="group-hover:underline">{year.year}</span>
                <span className="text-faded ml-1.5 text-detail-xs tabular-nums">
                  {year.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-faded text-detail-xs tracking-wide uppercase">
          By subject
        </h2>
        <ul className="border-faded mt-4 border-t">
          {index.subjects.map((subject) => (
            <li key={subject.slug} className="border-faded border-b">
              <Link
                to="/reports"
                search={{ subject: subject.slug, page: 1, q: "" }}
                className="group flex items-baseline justify-between gap-4 rounded-sm py-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="text-paragraph-s group-hover:underline">
                  {subject.name}
                </span>
                <span className="text-faded font-mono text-detail-xs tabular-nums">
                  {subject.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {index.years.length === 0 && index.subjects.length === 0 && (
        <p className="text-faded border-faded mt-10 border-t py-8 text-paragraph-s">
          {reportsArchive.emptyListing}
        </p>
      )}
    </Container>
  )
}
