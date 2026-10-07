import { createFileRoute } from "@tanstack/react-router"

import { allPosts } from "@/core/config/news"
import { site } from "@/core/config/site"

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const base = site.url.replace(/\/+$/, "")
        const latest = allPosts()[0]?.date
        const entries = [
          { path: "/", lastmod: latest },
          { path: "/kilo", lastmod: latest },
          { path: "/news", lastmod: latest },
          ...allPosts().map((post) => ({
            path: `/news/${post.slug}`,
            lastmod: post.date,
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
