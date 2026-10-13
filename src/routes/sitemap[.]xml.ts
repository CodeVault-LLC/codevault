import { createFileRoute } from "@tanstack/react-router"

import { allGuides } from "@/core/config/guides"
import { allPosts } from "@/core/config/news"
import { site } from "@/core/config/site"

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const base = site.url.replace(/\/+$/, "")
        const latest = allPosts()[0]?.date
        const guidesUpdated = allGuides()
          .map((guide) => guide.updated)
          .sort()
          .at(-1)
        const entries = [
          { path: "/", lastmod: latest },
          { path: "/electrical", lastmod: latest },
          { path: "/news", lastmod: latest },
          { path: "/guides", lastmod: guidesUpdated },
          { path: "/about" },
          { path: "/brand" },
          { path: "/contact" },
          { path: "/privacy" },
          ...allPosts().map((post) => ({
            path: `/news/${post.slug}`,
            lastmod: post.date,
          })),
          ...allGuides().map((guide) => ({
            path: `/guides/${guide.slug}`,
            lastmod: guide.updated,
          })),
        ]
        const body = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...entries.map(
            (e) =>
              `  <url><loc>${base}${e.path === "/" ? "" : e.path}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}</url>`
          ),
          `</urlset>`,
          "",
        ].join("\n")
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        })
      },
    },
  },
})
