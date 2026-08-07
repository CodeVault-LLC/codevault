import { createFileRoute } from "@tanstack/react-router"

import { site } from "@/core/config/site"

// `robots.txt`, generated for the same reason `sitemap.xml` and
// `security.txt` are: the `Sitemap:` directive has to be an absolute URL, and
// a hardcoded one is a second copy of the domain to keep in sync with
// `site.url`.
//
// `[.]` escapes the dot so this is one route at /robots.txt rather than a
// `.txt` child of a `robots` route.

/**
 * Paths kept out of the index.
 *
 * None of this is a security control — `robots.txt` is a request, and the only
 * thing standing in front of /admin is `requireStaff` at the data boundary
 * (design §7.6). It is here so the crawlable surface matches the public one:
 * a login form and an enrolment flow are not pages anyone should arrive at
 * from a search result, and listing them publicly is free reconnaissance.
 *
 * Note these are prefixes. `Disallow: /admin` also covers /admin/users.
 */
const DISALLOW = ["/admin", "/api", "/login", "/enroll"]

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const base = site.url.replace(/\/+$/, "")

        const body = [
          "User-agent: *",
          ...DISALLOW.map((path) => `Disallow: ${path}`),
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
