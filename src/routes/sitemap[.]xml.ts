import { createFileRoute } from "@tanstack/react-router"

import { PUBLIC_VIEWER } from "@/server/reports/functions"
import { aboutNav } from "@/core/config/about"
import { legalNav } from "@/core/config/legal"
import { projectPaths } from "@/core/config/projects"
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
//
// The marketing pages come from the same nav configs the site renders from —
// `aboutNav`, `legalNav`, `projectPaths` — rather than a list maintained here.
// A hand-kept copy is how the homepage and every /about and /projects page
// ended up missing from this file in the first place.

/**
 * Public pages that no nav config already covers.
 *
 * Two of them, and both are deliberate: the root is not in any nav (the logo
 * links to it), and the plant-pi log is a child of one project rather than a
 * project in its own right, so it has no entry in `projectPaths`. Anything
 * else belongs in a config, not here.
 */
const EXTRA_PATHS = ["/", "/projects", "/projects/plant-pi/log"]

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

        // `/` would render as a trailing slash on `base`, which is a distinct
        // URL to a crawler. Normalising here keeps the root entry equal to the
        // canonical the homepage advertises.
        const pagePaths = [
          ...EXTRA_PATHS,
          ...aboutNav.map((item) => item.href),
          ...Object.values(projectPaths),
          ...legalNav.map((item) => item.href),
          "/reports",
          "/reports/browse",
        ]

        const urls = [
          ...pagePaths.map((path) =>
            urlEntry(path === "/" ? base : `${base}${path}`)
          ),
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
