import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { electrical } from "@/core/config/electrical"
import { allPosts } from "@/core/config/news"
import { site } from "@/core/config/site"
import { llmsFull, llmsIndex, rss } from "./llms"
import { BASE, absolute } from "./seo"
import {
  article,
  breadcrumbs,
  faq,
  organization,
  software,
  website,
} from "./structured-data"

const PUBLIC = join(import.meta.dirname, "..", "..", "..", "public")
const publicFile = (path: string) => existsSync(join(PUBLIC, path))

describe("structured data", () => {
  const all = [
    organization(),
    website(),
    software(),
    faq(electrical.faq.items),
    breadcrumbs([{ name: "Home", path: "/" }]),
    ...allPosts().map((post) => article(post, `/og/news/${post.slug}.png`)),
  ]

  it("is schema.org with a type, every time", () => {
    for (const data of all) {
      expect(data["@context"]).toBe("https://schema.org")
      expect(data["@type"]).toBeTruthy()
    }
  })

  it("only uses absolute URLs on this site", () => {
    const urls = JSON.stringify(all).match(/https?:\/\/[^"]+/g) ?? []
    const allowed = [BASE, site.github, "https://schema.org"]
    for (const url of urls)
      expect(allowed.some((start) => url.startsWith(start))).toBe(true)
  })

  it("lists only working features for the product", () => {
    const working = electrical.status.rows.filter(
      (row) => row.status === "Working"
    )
    expect(software().featureList).toEqual(working.map((row) => row.label))
  })
})

describe("social cards", () => {
  it("exist for the site, the product and every post", () => {
    // Run `bun run og:images` after adding a post.
    expect(publicFile(site.ogImage)).toBe(true)
    expect(publicFile(electrical.ogImage)).toBe(true)
    for (const post of allPosts())
      expect(publicFile(`/og/news/${post.slug}.png`)).toBe(true)
  })
})

describe("text for readers that don't render", () => {
  it("indexes every post in llms.txt and the feed", () => {
    const index = llmsIndex()
    const feed = rss()
    for (const post of allPosts()) {
      const url = absolute(`/news/${post.slug}`)
      expect(index).toContain(url)
      expect(feed).toContain(`<guid isPermaLink="true">${url}</guid>`)
    }
  })

  it("puts every post's full text in llms-full.txt", () => {
    const full = llmsFull()
    for (const post of allPosts()) expect(full).toContain(post.lead)
  })

  it("keeps the feed well formed", () => {
    const feed = rss()
    expect(feed.match(/<item>/g)?.length).toBe(allPosts().length)
    expect(feed.match(/<\/item>/g)?.length).toBe(allPosts().length)
    expect(feed).not.toMatch(/&(?!amp;|lt;|gt;|quot;)/)
  })
})
