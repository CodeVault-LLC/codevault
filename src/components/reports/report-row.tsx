import { Link } from "@tanstack/react-router"

import type { ReportRowProps } from "./types"
import { docTypeLabels } from "@/core/config/reports"
import { formatAuthors, formatDate, formatPageCount } from "./format"

// A catalogue row, not a card. The archive lists with hairline separators and
// mono identifiers where the marketing site uses cards in a grid (design §13).
//
// The whole row is one real <a href>, which Google Scholar requires — it will
// not follow JavaScript-only navigation (design §12).
export function ReportRow({ report }: ReportRowProps) {
  return (
    <li className="border-faded border-b">
      <Link
        to="/reports/$accessionId"
        params={{ accessionId: report.accessionId! }}
        className="group block rounded-sm px-2 py-4 transition-colors hover:bg-ivory-medium/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:hover:bg-white/5"
      >
        <div className="text-faded flex items-baseline gap-3 font-mono text-detail-xs">
          <span>{report.accessionId}</span>
          <span aria-hidden>·</span>
          <span>{docTypeLabels[report.docType]}</span>
        </div>

        <h2 className="mt-1 text-paragraph-s font-medium text-pretty group-hover:underline">
          {report.title}
        </h2>

        <p className="text-faded mt-1.5 text-detail-xs">
          {formatAuthors(report.authors)}
          <span aria-hidden> · </span>
          <span className="font-mono">{formatDate(report.publishedAt)}</span>
          <span aria-hidden> · </span>
          <span className="font-mono">{formatPageCount(report.pageCount)}</span>
        </p>
      </Link>
    </li>
  )
}
