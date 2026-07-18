import type { CitationLinksProps } from "./types"
import { CITATION_FORMATS } from "@/core/reports/citation-formats"

// Export links, as downloads rather than a copy-to-clipboard widget.
//
// Plain anchors to a GET endpoint: a reference manager can be pointed at the
// URL, and the formats are generated server-side because that is where the
// record already is (design §12).
export function CitationLinks({ accessionId }: CitationLinksProps) {
  return (
    <p className="text-faded flex flex-wrap items-baseline gap-x-4 gap-y-1 text-detail-xs">
      <span className="tracking-wide uppercase">Cite</span>
      {CITATION_FORMATS.map((format) => (
        <a
          key={format.slug}
          href={`/reports/${accessionId}/cite/${format.slug}`}
          className="rounded-sm font-mono underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {format.label}
        </a>
      ))}
    </p>
  )
}
