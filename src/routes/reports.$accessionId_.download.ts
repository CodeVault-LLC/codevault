import { createFileRoute } from "@tanstack/react-router"

import { resolveDownloadUrl } from "@/server/reports/download"

// `_` suffix on the parent segment escapes nesting: this is a redirect, not a
// view rendered inside the record page.
//
// It redirects to a short-lived presigned URL rather than proxying the bytes,
// so the file is served from the content domain with its own headers and never
// from an origin that holds session cookies (design §5.3).
export const Route = createFileRoute("/reports/$accessionId_/download")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const url = await resolveDownloadUrl(
          { kind: "anonymous" },
          params.accessionId
        )

        // Withheld and non-existent are the same response.
        if (!url) return new Response("Not found", { status: 404 })

        return new Response(null, {
          status: 302,
          headers: {
            location: url,
            // The signed URL is per-request and short-lived; caching the
            // redirect would hand a stale signature to the next reader.
            "cache-control": "no-store",
          },
        })
      },
    },
  },
})
