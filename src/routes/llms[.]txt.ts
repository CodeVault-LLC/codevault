import { createFileRoute } from "@tanstack/react-router"

import { llmsIndex } from "@/core/lib/llms"

// `/llms.txt` (llmstxt.org): a short Markdown index of the site for AI
// assistants. Built from config; see `core/lib/llms.ts`.
export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(llmsIndex(), {
          headers: {
            "content-type": "text/markdown; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
})
