// The single most valuable test in the system (design §11).
//
// It asserts that no `internal` record reaches any public artifact. Right now
// "every public artifact" means the listing and the record page, because that
// is all Phase 1 ships. As search, browse, the sitemap, RSS, related links and
// author pages arrive, each one gets asserted here — the point is that this
// file is the place that knows the whole list.
//
// It is deliberately written while it is trivially green, so that it fails
// loudly the first time someone adds a surface that forgets the query layer.

import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { inArray } from "drizzle-orm"

import type { NewReportRow } from "@/server/db/types"
import type { Viewer } from "./types"
import { db } from "@/server/db/client"
import { getReportByAccessionId, listReports } from "./queries"
import { reports } from "@/server/db/schema"

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

const base = {
  status: "published",
  classification: "public",
  title: "A test report",
  abstract: "Nothing to see here.",
  publishedAt: "2026-01-01",
} satisfies Partial<NewReportRow>

const FIXTURES: NewReportRow[] = [
  { ...base, accessionId: PUBLIC_ID, title: "Public and discoverable" },
  {
    ...base,
    accessionId: INTERNAL_ID,
    classification: "internal",
    title: "Internal — commercially sensitive",
  },
  { ...base, accessionId: UNLISTED_ID, discoverable: false },
  {
    ...base,
    accessionId: EMBARGOED_ID,
    // Comfortably in the future, so this does not become flaky in 2027.
    embargoUntil: new Date("2099-01-01"),
  },
  { ...base, accessionId: DRAFT_ID, status: "draft" },
]

const ALL_IDS = FIXTURES.map((f) => f.accessionId!)

async function anonymousListingIds(): Promise<string[]> {
  const rows = await listReports(ANONYMOUS, { limit: 100, offset: 0 })
  return rows.map((row) => row.accessionId!).filter((x) => x.startsWith(RUN))
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

describe("the detail payload", () => {
  it("omits the internal UUID and the extracted full text", async () => {
    const detail = await getReportByAccessionId(ANONYMOUS, PUBLIC_ID)

    expect(detail).not.toBeNull()
    expect(detail).not.toHaveProperty("id")
    expect(detail).not.toHaveProperty("fulltext")
    expect(detail).not.toHaveProperty("searchVector")
  })
})
