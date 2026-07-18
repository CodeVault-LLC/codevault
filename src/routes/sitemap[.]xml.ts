import { createFileRoute } from "@tanstack/react-router"

import { PUBLIC_VIEWER } from "@/server/reports/functions"
import { legalNav } from "@/core/config/legal"
import { recordUrl } from "@/core/reports/citation"
import { site } from "@/core/config/site"
import { sitemapEntries } from "@/server/reports/queries"

// `sitemap.xml`, generated from the same query layer as every other listing
// (design §12).
//
// `[.]` escapes the dot in the file name so this is one route at /sitemap.xml
// rather than a `.xml` child of a `sitemap` route.
//
// It uses `listableBy`, which is what keeps an internal or unlisted record out
// of it. Building the XML from a bespoke query is exactly the mistake §11's
// test exists to catch, so it does not.

// XML has five predefined entities and no CDATA escape hatch inside <loc>.
// Accession IDs and the site URL are tame, but escaping is the kind of thing
// you do unconditionally or eventually forget.
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function urlEntry(loc: string, lastmod?: Date): string {
  const lastmodTag = lastmod
    ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>`
    : ""

  return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag}</url>`
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = await sitemapEntries(PUBLIC_VIEWER)
        const base = site.url.replace(/\/+$/, "")

        const urls = [
          urlEntry(`${base}/reports`),
          urlEntry(`${base}/reports/browse`),
          ...legalNav.map((item) => urlEntry(`${base}${item.href}`)),
          ...entries.map((entry) =>
            urlEntry(recordUrl(entry.accessionId, base), entry.updatedAt)
          ),
        ]

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`

        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        })
      },
    },
  },
})
