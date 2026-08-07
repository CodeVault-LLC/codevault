import { describe, expect, it } from "vitest"

import { seo } from "./seo"
import { site } from "@/core/config/site"

// The failure this file exists to catch is the one NTRS shipped and
// `citation.test.ts` already guards on the citation side: a URL assembled by
// template string that comes out subtly wrong — a doubled slash, a missing
// origin, a canonical that disagrees with the og:url next to it. Nothing here
// is interesting to read; it is interesting when it breaks.

const BASE = site.url.replace(/\/+$/, "")

function metaByKey(
  tags: ReturnType<typeof seo>["meta"],
  key: string
): string | undefined {
  const hit = tags.find(
    (tag) =>
      ("property" in tag && tag.property === key) ||
      ("name" in tag && tag.name === key)
  )

  return hit && "content" in hit ? hit.content : undefined
}

const PAGE = {
  title: "Who we are — CodeVault",
  description: "How we think about work.",
  path: "/about/who-we-are",
}

describe("URL assembly", () => {
  it("builds an absolute canonical from a site-relative path", () => {
    const { links } = seo(PAGE)

    expect(links).toEqual([
      { rel: "canonical", href: `${BASE}/about/who-we-are` },
    ])
  })

  it("does not leave a doubled slash on the root path", () => {
    const { links } = seo({ ...PAGE, path: "/" })

    expect(links[0].href).toBe(BASE)
    expect(links[0].href).not.toMatch(/\/\/$/)
  })

  it("tolerates a path given without its leading slash", () => {
    expect(seo({ ...PAGE, path: "about" }).links[0].href).toBe(`${BASE}/about`)
  })

  it("points og:url at the same address as the canonical", () => {
    const { meta, links } = seo(PAGE)

    expect(metaByKey(meta, "og:url")).toBe(links[0].href)
  })

  it("makes the social card absolute — a relative og:image is ignored", () => {
    expect(metaByKey(seo(PAGE).meta, "og:image")).toBe(`${BASE}${site.ogImage}`)
  })

  it("lets a page bring its own card", () => {
    const withCard = seo({ ...PAGE, image: "/og/seamark.png" })

    expect(metaByKey(withCard.meta, "og:image")).toBe(`${BASE}/og/seamark.png`)
  })
})

describe("tag coverage", () => {
  it("keeps the title consistent across all three places it appears", () => {
    const { meta } = seo(PAGE)
    const title = meta.find((tag) => "title" in tag)

    expect(title).toEqual({ title: PAGE.title })
    expect(metaByKey(meta, "og:title")).toBe(PAGE.title)
    expect(metaByKey(meta, "twitter:title")).toBe(PAGE.title)
  })

  it("keeps the description consistent too", () => {
    const { meta } = seo(PAGE)

    for (const key of ["description", "og:description", "twitter:description"])
      expect(metaByKey(meta, key)).toBe(PAGE.description)
  })

  it("defaults to a website and takes article when asked", () => {
    expect(metaByKey(seo(PAGE).meta, "og:type")).toBe("website")
    expect(metaByKey(seo({ ...PAGE, type: "article" }).meta, "og:type")).toBe(
      "article"
    )
  })

  it("declares a large card, which is what the dimensions are for", () => {
    const { meta } = seo(PAGE)

    expect(metaByKey(meta, "twitter:card")).toBe("summary_large_image")
    expect(metaByKey(meta, "og:image:width")).toBe("1200")
    expect(metaByKey(meta, "og:image:height")).toBe("630")
  })

  it("uses `property` for og and `name` for twitter", () => {
    // Not pedantry: an og tag emitted as `name` is the bug this replaced on
    // /reports/browse, and most unfurlers simply do not see it.
    const { meta } = seo(PAGE)

    for (const tag of meta) {
      if ("property" in tag) expect(tag.property).toMatch(/^og:/)
      if ("name" in tag && tag.name?.startsWith("twitter:"))
        expect("property" in tag).toBe(false)
    }
  })
})
