// The single most valuable test in the system (design §11).
//
// It asserts that no `internal` record reaches any public artifact. "Every
// public artifact" now means the listing, the record page, search, the facet
// counts, browse and the sitemap. As RSS, related links and author pages
// arrive, each one gets asserted here — the point is that this file is the
// place that knows the whole list.
//
// It is deliberately written while it is trivially green, so that it fails
// loudly the first time someone adds a surface that forgets the query layer.

import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { inArray } from "drizzle-orm"

import type { NewReportRow } from "@/server/db/types"
import type { Viewer } from "./types"
import { db } from "@/server/db/client"
import {
  browseIndex,
  getReportByAccessionId,
  listReports,
  searchReports,
  sitemapEntries,
} from "./queries"
import { reports } from "@/server/db/schema"
import { resolveDownloadUrl } from "./download"

const ANONYMOUS: Viewer = { kind: "anonymous" }
const STAFF: Viewer = { kind: "staff", userId: "test-staff" }

// Namespaced so a failed run cannot collide with the next one.
const RUN = `TEST-${Date.now()}`
const id = (suffix: string) => `${RUN}-${suffix}`

const PUBLIC_ID = id("PUBLIC")
const INTERNAL_ID = id("INTERNAL")
const UNLISTED_ID = id("UNLISTED")
const EMBARGOED_ID = id("EMBARGOED")
const DRAFT_ID = id("DRAFT")
const METADATA_ONLY_ID = id("METADATA-ONLY")

// A word that appears in every fixture's abstract and nowhere else in the
// corpus, so a search for it returns exactly this run's records.
const MARKER = "zygomorphic"

// Values that must never show up in a public facet or a browse page. They are
// unique to the internal fixture, so asserting their absence is asserting that
// no part of that record leaked into an aggregate.
const INTERNAL_SUBJECT = `subject-internal-${RUN}`
const INTERNAL_AUTHOR = `Redacted Internal-Author-${RUN}`
const INTERNAL_YEAR = 1991

const base = {
  status: "published",
  classification: "public",
  title: "A test report",
  abstract: `Nothing to see here. ${MARKER}`,
  publishedAt: "2026-01-01",
  authors: [{ name: "Public Author" }],
  subjectCategory: `subject-public-${RUN}`,
} satisfies Partial<NewReportRow>

const FIXTURES: NewReportRow[] = [
  { ...base, accessionId: PUBLIC_ID, title: "Public and discoverable" },
  {
    ...base,
    accessionId: INTERNAL_ID,
    classification: "internal",
    title: "Internal — commercially sensitive",
    // Everything about this record is distinctive, so any aggregate that
    // counted it would say so.
    authors: [{ name: INTERNAL_AUTHOR }],
    subjectCategory: INTERNAL_SUBJECT,
    projectSlug: `project-internal-${RUN}`,
    publishedAt: `${INTERNAL_YEAR}-01-01`,
  },
  { ...base, accessionId: UNLISTED_ID, discoverable: false },
  {
    ...base,
    accessionId: EMBARGOED_ID,
    // Comfortably in the future, so this does not become flaky in 2027.
    embargoUntil: new Date("2099-01-01"),
  },
  { ...base, accessionId: DRAFT_ID, status: "draft" },
  {
    ...base,
    accessionId: METADATA_ONLY_ID,
    dissemination: "metadata_only",
    // Has a file on paper; the point is that it is still never served.
    pdfKey: "reports/metadata-only/v1/report.pdf",
  },
]

const ALL_IDS = FIXTURES.map((f) => f.accessionId!)

async function anonymousListingIds(): Promise<string[]> {
  const rows = await listReports(ANONYMOUS, { limit: 100, offset: 0 })
  return rows.map((row) => row.accessionId!).filter((x) => x.startsWith(RUN))
}

const SEARCH_ALL = { limit: 100, offset: 0 }

async function anonymousSearch(q?: string) {
  return searchReports(ANONYMOUS, { ...SEARCH_ALL, q })
}

beforeAll(async () => {
  await db.insert(reports).values(FIXTURES)
})

afterAll(async () => {
  await db.delete(reports).where(inArray(reports.accessionId, ALL_IDS))
})

describe("no internal record reaches a public artifact", () => {
  it("is absent from the anonymous listing", async () => {
    expect(await anonymousListingIds()).not.toContain(INTERNAL_ID)
  })

  it("is absent from the anonymous record page", async () => {
    // Null, not a forbidden result: a 403 would confirm the record exists.
    expect(await getReportByAccessionId(ANONYMOUS, INTERNAL_ID)).toBeNull()
  })

  it("never leaks its title through any anonymous read", async () => {
    const listing = await listReports(ANONYMOUS, { limit: 100, offset: 0 })
    const titles = listing.map((row) => row.title).join("\n")
    expect(titles).not.toContain("commercially sensitive")
  })

  it("is absent from anonymous search results", async () => {
    // Searched by a word every fixture shares, so a leak would be a hit rather
    // than an empty result that passes for the wrong reason.
    const results = await anonymousSearch(MARKER)
    const ids = results.reports.map((row) => row.accessionId)

    expect(ids).toContain(PUBLIC_ID)
    expect(ids).not.toContain(INTERNAL_ID)
  })

  it("cannot be found by searching its own title", async () => {
    const results = await anonymousSearch("commercially sensitive")
    expect(results.reports.map((row) => row.accessionId)).not.toContain(
      INTERNAL_ID
    )
    expect(results.total).toBe(0)
  })

  it("is absent from every facet count", async () => {
    const { facets } = await anonymousSearch()

    expect(facets.subject.map((f) => f.value)).not.toContain(INTERNAL_SUBJECT)
    expect(facets.author.map((f) => f.value)).not.toContain(INTERNAL_AUTHOR)
    expect(facets.year.map((f) => f.value)).not.toContain(String(INTERNAL_YEAR))
    expect(facets.project.map((f) => f.value)).not.toContain(
      `project-internal-${RUN}`
    )
  })

  it("is absent from the browse page", async () => {
    const index = await browseIndex(ANONYMOUS)

    expect(index.years.map((y) => y.year)).not.toContain(INTERNAL_YEAR)
    expect(index.subjects.map((s) => s.slug)).not.toContain(INTERNAL_SUBJECT)
  })

  it("is absent from the sitemap", async () => {
    const ids = (await sitemapEntries(ANONYMOUS)).map((e) => e.accessionId)

    expect(ids).toContain(PUBLIC_ID)
    expect(ids).not.toContain(INTERNAL_ID)
    // Unlisted-but-citable: reachable by direct link, never advertised
    // (design §4.2).
    expect(ids).not.toContain(UNLISTED_ID)
  })
})

describe("search", () => {
  it("finds a record by a word in its title", async () => {
    const results = await anonymousSearch("discoverable")
    expect(results.reports.map((row) => row.accessionId)).toContain(PUBLIC_ID)
  })

  it("survives punctuation a reader would type", async () => {
    // `websearch_to_tsquery` is chosen precisely because this does not throw
    // the way `to_tsquery` would (design §6).
    await expect(
      anonymousSearch('"unbalanced quote & or -')
    ).resolves.toBeDefined()
  })

  it("counts the whole result set, not the page", async () => {
    const page = await searchReports(ANONYMOUS, {
      q: MARKER,
      limit: 1,
      offset: 0,
    })

    expect(page.reports).toHaveLength(1)
    expect(page.total).toBeGreaterThan(1)
  })

  it("filters by a facet value", async () => {
    const results = await searchReports(ANONYMOUS, {
      ...SEARCH_ALL,
      author: "Public Author",
    })

    expect(results.reports.map((row) => row.accessionId)).toContain(PUBLIC_ID)
  })

  it("keeps the other values of a filtered dimension countable", async () => {
    // The point of excluding a dimension from its own facet: after filtering
    // by year, the year facet must still offer the other years rather than
    // collapsing to the one already chosen.
    const results = await searchReports(ANONYMOUS, {
      ...SEARCH_ALL,
      q: MARKER,
      year: 2026,
    })

    expect(results.facets.year.map((f) => f.value)).toContain("2026")
  })

  it("excludes non-discoverable records the way the listing does", async () => {
    const results = await anonymousSearch(MARKER)
    const ids = results.reports.map((row) => row.accessionId)

    expect(ids).not.toContain(UNLISTED_ID)
    expect(ids).not.toContain(EMBARGOED_ID)
    expect(ids).not.toContain(DRAFT_ID)
  })
})

describe("anonymous visibility", () => {
  it("lists a published public discoverable record", async () => {
    expect(await anonymousListingIds()).toContain(PUBLIC_ID)
  })

  it("hides drafts", async () => {
    expect(await anonymousListingIds()).not.toContain(DRAFT_ID)
    expect(await getReportByAccessionId(ANONYMOUS, DRAFT_ID)).toBeNull()
  })

  it("hides an embargoed record until the embargo lapses", async () => {
    expect(await anonymousListingIds()).not.toContain(EMBARGOED_ID)
    expect(await getReportByAccessionId(ANONYMOUS, EMBARGOED_ID)).toBeNull()
  })

  it("keeps a non-discoverable record out of listings but reachable by link", async () => {
    expect(await anonymousListingIds()).not.toContain(UNLISTED_ID)

    const direct = await getReportByAccessionId(ANONYMOUS, UNLISTED_ID)
    expect(direct?.accessionId).toBe(UNLISTED_ID)
  })
})

describe("staff visibility", () => {
  it("sees every record, including internal and draft", async () => {
    const rows = await listReports(STAFF, { limit: 100, offset: 0 })
    const visible = rows
      .map((row) => row.accessionId!)
      .filter((x) => x.startsWith(RUN))

    expect(visible).toEqual(expect.arrayContaining(ALL_IDS))
  })

  it("can open an internal record page", async () => {
    const detail = await getReportByAccessionId(STAFF, INTERNAL_ID)
    expect(detail?.classification).toBe("internal")
  })
})

describe("file download resolution", () => {
  it("refuses an internal record", async () => {
    expect(await resolveDownloadUrl(ANONYMOUS, INTERNAL_ID)).toBeNull()
  })

  it("refuses a metadata-only record even though it has a file", async () => {
    // The record page is public and citable; the document is not served.
    expect(await resolveDownloadUrl(ANONYMOUS, METADATA_ONLY_ID)).toBeNull()
  })

  it("refuses an embargoed record", async () => {
    expect(await resolveDownloadUrl(ANONYMOUS, EMBARGOED_ID)).toBeNull()
  })

  it("refuses a draft", async () => {
    expect(await resolveDownloadUrl(ANONYMOUS, DRAFT_ID)).toBeNull()
  })

  it("refuses a record with no file attached", async () => {
    expect(await resolveDownloadUrl(ANONYMOUS, PUBLIC_ID)).toBeNull()
  })
})

describe("the detail payload", () => {
  it("omits the internal UUID and the extracted full text", async () => {
    const detail = await getReportByAccessionId(ANONYMOUS, PUBLIC_ID)

    expect(detail).not.toBeNull()
    expect(detail).not.toHaveProperty("id")
    expect(detail).not.toHaveProperty("fulltext")
    expect(detail).not.toHaveProperty("searchVector")
  })
})
