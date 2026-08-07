import { createFileRoute } from "@tanstack/react-router"

import { legal, securityContactHref } from "@/core/config/legal"
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
 * RFC 9116 requires `Expires`, and requires it to be in the future — a
 * security.txt whose date has passed should be treated as stale.
 *
 * It is derived from the policy's own last-updated date rather than from the
 * current time. "Now plus a year" would never expire, which defeats the point:
 * the field exists to force a periodic review, and the thing that needs
 * reviewing is the policy.
 */
function expiresAt(effective: string): string {
  const date = new Date(`${effective}T00:00:00.000Z`)
  date.setUTCFullYear(date.getUTCFullYear() + 1)

  return date.toISOString()
}

export const Route = createFileRoute("/.well-known/security.txt")({
  server: {
    handlers: {
      GET: () => {
        const base = site.url.replace(/\/+$/, "")

        // `Encryption` is emitted only once a fingerprint is recorded, which
        // `legal.security` treats as the signal that the key file is actually
        // published. RFC 9116 readers fetch that URL; pointing them at a 404
        // is a worse signal than not offering encryption at all.
        const encryption = legal.security.pgpFingerprint
          ? [`Encryption: ${base}${legal.security.keyPath}`]
          : []

        const body = [
          `Contact: ${securityContactHref()}`,
          `Expires: ${expiresAt(legal.effective)}`,
          ...encryption,
          `Policy: ${base}${legal.security.policyPath}`,
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
