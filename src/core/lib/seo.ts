import { site } from "@/core/config/site"

// One place that turns a page's title, description and path into the full set
// of head tags a link to it needs.
//
// Before this, every route hand-wrote a `title` and a `description` and
// nothing else, so a link pasted into Slack or LinkedIn unfurled as a bare
// URL. The tags below are the minimum that fixes that, plus the canonical —
// and they are generated together because the failure mode of writing them by
// hand is a page whose og:title and <title> have drifted apart.

/**
 * What a page tells a crawler or an unfurler about itself.
 *
 * `path` is site-relative and always starts with a slash. It is required
 * rather than derived from the router because `head()` runs during SSR for a
 * match, not a location, and a canonical that guesses is worse than none.
 */
export type SeoInput = {
  title: string
  description: string
  path: string
  /**
   * Site-relative path to the social card. Defaults to the site-wide one;
   * override for a page with its own artwork.
   */
  image?: string
  /**
   * Open Graph type. `article` for a dated, authored page — a project log or
   * a report record — and `website` for everything else.
   */
  type?: "website" | "article"
}

const BASE = site.url.replace(/\/+$/, "")

/** Absolute URL for a site-relative path, with no double slash at the join. */
function absolute(path: string): string {
  return path === "/"
    ? BASE
    : `${BASE}${path.startsWith("/") ? path : `/${path}`}`
}

/**
 * The head tags for a public page: title, description, canonical, Open Graph
 * and the Twitter card.
 *
 * Spread the result into a route's `head()`:
 *
 * ```ts
 * head: () => seo({
 *   title: "Who we are — CodeVault",
 *   description: whoWeAre.description,
 *   path: "/about/who-we-are",
 * })
 * ```
 *
 * `twitter:*` is still worth emitting despite the name: X reads it, and a few
 * other unfurlers prefer it over `og:*` when both are present. The rest fall
 * back to Open Graph, which is why both carry the same values.
 */
export function seo(input: SeoInput) {
  const { title, description, path, type = "website" } = input
  const url = absolute(path)
  const image = absolute(input.image ?? site.ogImage)

  return {
    meta: [
      { title },
      { name: "description", content: description },

      { property: "og:type", content: type },
      { property: "og:site_name", content: site.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      // Consumers that reserve layout before the image loads need the
      // dimensions; without them the card can render as a thumbnail.
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "en" },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  }
}
