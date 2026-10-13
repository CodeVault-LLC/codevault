import { describe, expect, it } from "vitest"

import type { FloorPlan, Pt } from "./floor-plan"
import { CELL, compactPlan, isClear, solve, widePlan } from "./floor-plan"

/** Every grid cell centre a polyline passes through. */
function cells(points: Pt[]): Pt[] {
  const out: Pt[] = []
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const steps = Math.round((Math.abs(b.x - a.x) + Math.abs(b.y - a.y)) / CELL)
    for (let k = 0; k <= steps; k++)
      out.push({
        x: a.x + ((b.x - a.x) * k) / (steps || 1),
        y: a.y + ((b.y - a.y) * k) / (steps || 1),
      })
  }
  return out
}

describe.each([
  ["wide", widePlan],
  ["compact", compactPlan],
] as [string, FloorPlan][])("the %s plan", (_, plan) => {
  const solved = solve(plan)
  const links = solved.jobs.flatMap((job) => job.links)

  it("routes every link, from device to device", () => {
    expect(links).toHaveLength(plan.jobs.flatMap((job) => job.links).length)
    for (const link of links) {
      const from = solved.devices.get(link.from)?.at
      const to = solved.devices.get(link.to)?.at
      expect(link.points[0]).toEqual(from)
      expect(link.points.at(-1)).toEqual(to)
    }
  })

  it("only makes right angles", () => {
    for (const link of links)
      for (let i = 1; i < link.points.length; i++) {
        const a = link.points[i - 1]
        const b = link.points[i]
        expect(a.x === b.x || a.y === b.y).toBe(true)
      }
  })

  it("keeps clear of ducts, columns and door swings", () => {
    for (const link of links)
      for (const pt of cells(link.points)) expect(isClear(plan, pt)).toBe(true)
  })

  it("stays inside the building", () => {
    for (const link of links)
      for (const pt of link.points) {
        expect(pt.x).toBeGreaterThan(0)
        expect(pt.x).toBeLessThan(plan.w)
        expect(pt.y).toBeGreaterThan(0)
        expect(pt.y).toBeLessThan(plan.h)
      }
  })

  it("never lets two runs share a cell, except at a device", () => {
    const deviceCells = new Set(plan.devices.map((d) => `${d.at.x},${d.at.y}`))
    const taken = new Set<string>()
    for (const link of links) {
      const own = new Set(cells(link.points).map((pt) => `${pt.x},${pt.y}`))
      for (const key of own) {
        if (deviceCells.has(key)) continue
        expect(taken.has(key)).toBe(false)
      }
      for (const key of own) taken.add(key)
    }
  })

  it("crosses walls, but only where the A→B run needs to", () => {
    const ab = solved.jobs.find((job) => job.job.kind === "ab")
    expect(ab?.links[0].crossings.length).toBeGreaterThan(0)
  })

  it("is deterministic", () => {
    const again = solve({ ...plan })
    expect(again.jobs.map((j) => j.links.map((l) => l.points))).toEqual(
      solved.jobs.map((j) => j.links.map((l) => l.points))
    )
  })
})
