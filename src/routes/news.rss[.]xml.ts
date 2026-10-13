import { createFileRoute } from "@tanstack/react-router"

import { rss } from "@/core/lib/llms"

// `/news/rss.xml`: the news as an RSS feed. Every page links to it.
export const Route = createFileRoute("/news/rss.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(rss(), {
          headers: {
            "content-type": "application/rss+xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
})
