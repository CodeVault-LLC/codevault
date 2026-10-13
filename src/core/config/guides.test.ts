import { describe, expect, it } from "vitest"

import { allGuides, findGuide } from "./guides"
import { allPosts, findPost } from "./news"

describe("guides", () => {
  const guides = allGuides()

  it("has unique slugs", () => {
    const slugs = guides.map((guide) => guide.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("uses real dates", () => {
    for (const guide of guides) {
      expect(guide.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(new Date(guide.updated).getTime())).toBe(false)
    }
  })

  it("gives every section heading a unique anchor", () => {
    for (const guide of guides) {
      const ids = guide.body.flatMap((b) => (b.type === "h2" ? [b.id] : []))
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it("keeps titles and descriptions short enough to show in full", () => {
    for (const guide of guides) {
      expect(guide.seoTitle.length).toBeLessThanOrEqual(60)
      expect(guide.description.length).toBeLessThanOrEqual(155)
    }
  })

  it("only links to guides and posts that exist", () => {
    for (const guide of guides) {
      for (const slug of guide.related.guides ?? []) {
        expect(findGuide(slug)).toBeDefined()
        expect(slug).not.toBe(guide.slug)
      }
      for (const slug of guide.related.news ?? [])
        expect(findPost(slug)).toBeDefined()
    }
    for (const post of allPosts())
      for (const slug of post.guides ?? [])
        expect(findGuide(slug)).toBeDefined()
  })

  it("never promises more than the product does", () => {
    const text = JSON.stringify(guides).toLowerCase()
    expect(text).not.toContain("clash-free")
    expect(text).not.toContain("clearrun")
  })
})
