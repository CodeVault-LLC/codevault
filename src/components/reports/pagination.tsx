import { Link } from "@tanstack/react-router"

import type { PaginationProps } from "./types"
import { REPORTS_PAGE_SIZE } from "@/core/reports/search-params"

// Previous/next as real anchors, not buttons.
//
// A crawler has to be able to reach page two, and every record must be within
// ten links of the homepage (design §12) — which is also why the page size is
// generous rather than a tidy ten.
export function Pagination({ page, total }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / REPORTS_PAGE_SIZE))
  if (pages <= 1) return null

  return (
    <nav
      aria-label="Pagination"
      className="border-faded text-faded mt-8 flex items-baseline justify-between border-t pt-4 font-mono text-detail-xs"
    >
      {page > 1 ? (
        <Link
          to="/reports"
          search={(prev) => ({ ...prev, page: page - 1 })}
          rel="prev"
          className="rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          ← Previous
        </Link>
      ) : (
        <span aria-hidden />
      )}

      <span>
        Page {page} of {pages}
      </span>

      {page < pages ? (
        <Link
          to="/reports"
          search={(prev) => ({ ...prev, page: page + 1 })}
          rel="next"
          className="rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Next →
        </Link>
      ) : (
        <span aria-hidden />
      )}
    </nav>
  )
}
