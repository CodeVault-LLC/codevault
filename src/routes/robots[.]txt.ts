import { createFileRoute } from "@tanstack/react-router"

import { site } from "@/core/config/site"

// Generated so the `Sitemap:` line follows `site.url`.
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const base = site.url.replace(/\/+$/, "")
        const body = [
          "User-agent: *",
          "Allow: /",
          "",
          `Sitemap: ${base}/sitemap.xml`,
          "",
        ].join("\n")
        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=86400",
          },
        })
      },
    },
  },
})
