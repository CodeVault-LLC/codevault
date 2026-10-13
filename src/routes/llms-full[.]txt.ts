import { createFileRoute } from "@tanstack/react-router"

import { llmsFull } from "@/core/lib/llms"

// `/llms-full.txt`: everything on the site as one Markdown file, for AI
// assistants. Built from config; see `core/lib/llms.ts`.
export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(llmsFull(), {
          headers: {
            "content-type": "text/markdown; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
})
