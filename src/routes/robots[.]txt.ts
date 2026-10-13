import { createFileRoute } from "@tanstack/react-router"

import { site } from "@/core/config/site"

// Generated so the `Sitemap:` line follows `site.url`.
//
// Everything is open to everyone. Search and AI crawlers are also named one by
// one, so a crawler that only reads its own group still finds an explicit
// welcome, and nobody has to guess whether it is allowed to read the site.

/** Search engines and AI assistants, each welcomed by name. */
const crawlers = [
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "Applebot",
  "Applebot-Extended",
  "Google-Extended",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Amazonbot",
  "meta-externalagent",
  "MistralAI-User",
  "cohere-ai",
  "CCBot",
]

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const base = site.url.replace(/\/+$/, "")
        const body = [
          `# ${site.name}. A plain-text summary for AI assistants is at`,
          `# ${base}/llms.txt, and the whole site at ${base}/llms-full.txt.`,
          "",
          "User-agent: *",
          "Allow: /",
          "",
          ...crawlers.flatMap((agent) => [
            `User-agent: ${agent}`,
            "Allow: /",
            "",
          ]),
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
