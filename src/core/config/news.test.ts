import { describe, expect, it } from "vitest"

import { allPosts, categories, findPost, formatDate } from "./news"

describe("news", () => {
  const posts = allPosts()

  it("has unique slugs", () => {
    const slugs = posts.map((post) => post.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("lists newest first", () => {
    const dates = posts.map((post) => post.date)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it("uses real dates and known categories", () => {
    for (const post of posts) {
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(new Date(post.date).getTime())).toBe(false)
      expect(categories).toContain(post.category)
    }
  })

  it("gives every section heading a unique anchor", () => {
    for (const post of posts) {
      const ids = post.body.flatMap((b) => (b.type === "h2" ? [b.id] : []))
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it("finds posts by slug", () => {
    expect(findPost("introducing-kilo")?.title).toBe("Introducing Kilo")
    expect(findPost("missing")).toBeUndefined()
  })

  it("formats dates in UTC so they never shift a day", () => {
    expect(formatDate("2026-10-05")).toBe("October 5, 2026")
    expect(formatDate("2026-10-05", "short")).toBe("Oct 5, 2026")
  })
})
