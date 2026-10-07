import { createFileRoute } from "@tanstack/react-router"

import { site } from "@/core/config/site"

// `/.well-known/security.txt` per RFC 9116.
//
// Generated rather than dropped in `public/` for the same reason `sitemap.xml`
// is: the file has to name an absolute origin, and hardcoding one leaves two
// copies of the domain to keep in sync. This reads `site.url`, so it follows
// the config.
//
// `[.]` escapes the dots — `[.]well-known` is one literal segment, and
// `security[.]txt` is one file rather than a `.txt` child of `security`.

/**
 * RFC 9116 requires `Expires`, in the future. A fixed date rather than "now
 * plus a year", so the file goes stale if nobody reviews it.
 */
const EXPIRES = "2027-10-07T00:00:00.000Z"

export const Route = createFileRoute("/.well-known/security.txt")({
  server: {
    handlers: {
      GET: () => {
        const base = site.url.replace(/\/+$/, "")

        const body = [
          `Contact: mailto:${site.securityEmail}`,
          `Expires: ${EXPIRES}`,
          `Canonical: ${base}/.well-known/security.txt`,
          "Preferred-Languages: en, no",
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
