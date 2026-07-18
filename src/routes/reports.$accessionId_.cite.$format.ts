import { createFileRoute } from "@tanstack/react-router"

import { PUBLIC_VIEWER } from "@/server/reports/functions"
import { findCitationFormat } from "@/core/reports/citation-formats"
import { getReportByAccessionId } from "@/server/reports/queries"
import { site } from "@/core/config/site"

// Citation export — BibTeX and RIS, generated server-side (design §12).
//
// `_` on the parent segment escapes nesting: this returns a file, not a view
// inside the record page. It reads through the same query layer as everything
// else, so a record the viewer may not see exports as a 404 rather than as a
// citation for a document they cannot read.
export const Route = createFileRoute("/reports/$accessionId_/cite/$format")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const format = findCitationFormat(params.format)
        if (!format) return new Response("Not found", { status: 404 })

        const report = await getReportByAccessionId(
          PUBLIC_VIEWER,
          params.accessionId
        )
        if (!report?.accessionId) {
          return new Response("Not found", { status: 404 })
        }

        const body = format.render(
          { ...report, accessionId: report.accessionId },
          { institution: site.name, baseUrl: site.url }
        )

        return new Response(body, {
          headers: {
            "content-type": format.contentType,
            // Named after the record so a downloads folder stays legible.
            "content-disposition": `attachment; filename="${report.accessionId}.${format.extension}"`,
            // Metadata changes when a record is edited, and a citation is
            // cheap to regenerate — an hour is long enough to matter for a
            // crawler and short enough that a correction lands the same day.
            "cache-control": "public, max-age=3600",
          },
        })
      },
    },
  },
})
