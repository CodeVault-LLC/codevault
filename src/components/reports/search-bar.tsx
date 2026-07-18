import { Link, useNavigate } from "@tanstack/react-router"

import type { SearchBarProps } from "./types"
import { reportsArchive } from "@/core/config/reports"

// One wide input, because the archive is search-first (design §13).
//
// A real <form method="get">, not an onChange handler: it submits without
// JavaScript, which is the same property the listing's anchors have. The
// navigate() call intercepts the submit when JS is running so the page does not
// reload, but the fallback is the behaviour, not a degradation.
export function SearchBar({ search, total }: SearchBarProps) {
  const navigate = useNavigate({ from: "/reports" })

  return (
    <form
      method="get"
      action="/reports"
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        const value = new FormData(event.currentTarget).get("q")
        void navigate({
          search: (prev) => ({
            ...prev,
            q: typeof value === "string" ? value : "",
            // A new query invalidates the page you were on.
            page: 1,
          }),
        })
      }}
    >
      <label htmlFor="reports-q" className="sr-only">
        {reportsArchive.searchLabel}
      </label>

      <div className="flex gap-2">
        <input
          id="reports-q"
          name="q"
          type="search"
          defaultValue={search.q}
          placeholder={reportsArchive.searchPlaceholder}
          className="border-faded rounded-m w-full border bg-transparent px-3 py-2 text-paragraph-s placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
        <button
          type="submit"
          className="rounded-m bg-primary px-4 py-2 text-detail-xs font-medium tracking-wide text-primary-foreground uppercase transition-colors hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Search
        </button>
      </div>

      {/* The filters the query box does not own still have to survive a
          submit without JavaScript. */}
      {search.year && <input type="hidden" name="year" value={search.year} />}
      {search.type && <input type="hidden" name="type" value={search.type} />}
      {search.subject && (
        <input type="hidden" name="subject" value={search.subject} />
      )}
      {search.project && (
        <input type="hidden" name="project" value={search.project} />
      )}
      {search.author && (
        <input type="hidden" name="author" value={search.author} />
      )}

      <p
        className="text-faded mt-2 flex items-baseline gap-3 font-mono text-detail-xs"
        aria-live="polite"
      >
        <span>
          {total} {total === 1 ? "record" : "records"}
        </span>
        <Link
          to="/reports/browse"
          className="rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Browse by year and subject
        </Link>
      </p>
    </form>
  )
}
