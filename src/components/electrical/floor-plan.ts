// The floor plans the routing scene draws, and the router that wires them.
//
// Plans are in plan units (roughly metres), y pointing down the page like a
// drawing. The router is a small version of the real idea: right-angle A* on a
// grid, with a bend penalty, things to keep clear of, and walls that may be
// crossed but never followed. Every route the scene draws comes from here, so
// it never runs a conduit through a duct or a door.
//
// Pure and deterministic: no DOM, no randomness. `solve()` caches per plan.

export type Pt = { x: number; y: number }
export type Rect = { x0: number; y0: number; x1: number; y1: number }

export type DeviceKind = "lamp" | "socket" | "switch" | "box" | "panel"

/** `facing` is the way into the room, for symbols drawn against a wall. */
export type Device = {
  id: string
  kind: DeviceKind
  at: Pt
  facing?: "n" | "s" | "e" | "w"
}

export type Wall = { a: Pt; b: Pt; exterior?: boolean }

/**
 * A door in a gap between two wall segments. It hinges at `hinge`, closes
 * along the wall towards `to`, and swings to `side` (the room it opens into).
 */
export type Door = { hinge: Pt; to: Pt; side: "n" | "s" | "e" | "w" }

/** One run of work: the devices picked, then routed. */
export type Job = {
  kind: "chain" | "tree" | "ab"
  /** Links in the order they are routed. */
  links: [string, string][]
}

export type FloorPlan = {
  w: number
  h: number
  walls: Wall[]
  doors: Door[]
  /** Window openings in exterior walls. */
  windows: [Pt, Pt][]
  /** Structural columns, centred on grid intersections. */
  columns: Pt[]
  /** Ductwork overhead: drawn dashed, and kept clear of. */
  ducts: Rect[]
  /** Grid lines with their bubbles, as on a Revit plan. */
  grid: { x: number[]; y: number[] }
  devices: Device[]
  jobs: Job[]
}

/* -------------------------------------------------------------------------- */
/* Plans                                                                      */
/* -------------------------------------------------------------------------- */

const p = (x: number, y: number): Pt => ({ x, y })

/** Three rooms over a corridor, for wide screens. */
export const widePlan: FloorPlan = {
  w: 24,
  h: 11,
  walls: [
    // Exterior, with window gaps along the north side and a door to the south.
    { a: p(0, 0), b: p(2, 0), exterior: true },
    { a: p(5, 0), b: p(10.5, 0), exterior: true },
    { a: p(13.5, 0), b: p(18.5, 0), exterior: true },
    { a: p(21.5, 0), b: p(24, 0), exterior: true },
    { a: p(24, 0), b: p(24, 11), exterior: true },
    { a: p(24, 11), b: p(12.2, 11), exterior: true },
    { a: p(11, 11), b: p(0, 11), exterior: true },
    { a: p(0, 11), b: p(0, 0), exterior: true },
    // Rooms and corridor.
    { a: p(0, 8), b: p(5.6, 8) },
    { a: p(6.8, 8), b: p(9, 8) },
    { a: p(10.2, 8), b: p(20.6, 8) },
    { a: p(21.8, 8), b: p(24, 8) },
    { a: p(8, 0), b: p(8, 8) },
    { a: p(16, 0), b: p(16, 8) },
  ],
  doors: [
    { hinge: p(6.8, 8), to: p(5.6, 8), side: "n" },
    { hinge: p(9, 8), to: p(10.2, 8), side: "n" },
    { hinge: p(21.8, 8), to: p(20.6, 8), side: "n" },
    { hinge: p(11, 11), to: p(12.2, 11), side: "n" },
  ],
  windows: [
    [p(2, 0), p(5, 0)],
    [p(10.5, 0), p(13.5, 0)],
    [p(18.5, 0), p(21.5, 0)],
  ],
  columns: [0, 8, 16, 24].flatMap((x) => [0, 8, 11].map((y) => p(x, y))),
  ducts: [
    { x0: 3, y0: 8.3, x1: 20, y1: 8.9 },
    { x0: 11.6, y0: 0.25, x1: 12.4, y1: 4.2 },
    { x0: 11.4, y0: 4.2, x1: 12.6, y1: 5.4 },
  ],
  grid: { x: [0, 8, 16, 24], y: [0, 8, 11] },
  devices: [
    { id: "s1", kind: "switch", at: p(7.625, 6.875), facing: "w" },
    { id: "l1", kind: "lamp", at: p(2.375, 2.375) },
    { id: "l2", kind: "lamp", at: p(5.625, 2.375) },
    { id: "l3", kind: "lamp", at: p(2.375, 5.375) },
    { id: "l4", kind: "lamp", at: p(5.625, 5.375) },
    { id: "b1", kind: "box", at: p(10.625, 7.375) },
    { id: "o1", kind: "socket", at: p(8.375, 3.125), facing: "e" },
    { id: "o2", kind: "socket", at: p(14.375, 0.375), facing: "s" },
    { id: "o3", kind: "socket", at: p(15.625, 5.625), facing: "w" },
    { id: "l5", kind: "lamp", at: p(18.875, 3.625) },
    { id: "l6", kind: "lamp", at: p(21.125, 3.625) },
    { id: "b2", kind: "box", at: p(22.875, 1.875) },
    { id: "db", kind: "panel", at: p(0.375, 9.625), facing: "e" },
  ],
  jobs: [
    {
      kind: "chain",
      links: [
        ["s1", "l4"],
        ["l4", "l2"],
        ["l2", "l1"],
        ["l1", "l3"],
      ],
    },
    {
      kind: "tree",
      links: [
        ["b1", "o1"],
        ["b1", "o2"],
        ["o2", "o3"],
      ],
    },
    { kind: "ab", links: [["b2", "db"]] },
  ],
}

/** Two rooms over a corridor and one below it, for narrow screens. */
export const compactPlan: FloorPlan = {
  w: 14,
  h: 14,
  walls: [
    { a: p(0, 0), b: p(2, 0), exterior: true },
    { a: p(5, 0), b: p(9, 0), exterior: true },
    { a: p(12, 0), b: p(14, 0), exterior: true },
    { a: p(14, 0), b: p(14, 14), exterior: true },
    { a: p(14, 14), b: p(5, 14), exterior: true },
    { a: p(2, 14), b: p(0, 14), exterior: true },
    { a: p(0, 14), b: p(0, 0), exterior: true },
    { a: p(0, 6), b: p(4.6, 6) },
    { a: p(5.8, 6), b: p(8.2, 6) },
    { a: p(9.4, 6), b: p(14, 6) },
    { a: p(7, 0), b: p(7, 6) },
    { a: p(0, 8.5), b: p(11, 8.5) },
    { a: p(12.2, 8.5), b: p(14, 8.5) },
  ],
  doors: [
    { hinge: p(5.8, 6), to: p(4.6, 6), side: "n" },
    { hinge: p(8.2, 6), to: p(9.4, 6), side: "n" },
    { hinge: p(12.2, 8.5), to: p(11, 8.5), side: "s" },
  ],
  windows: [
    [p(2, 0), p(5, 0)],
    [p(9, 0), p(12, 0)],
    [p(2, 14), p(5, 14)],
  ],
  columns: [0, 7, 14].flatMap((x) => [0, 6, 14].map((y) => p(x, y))),
  ducts: [
    { x0: 2.5, y0: 6.3, x1: 12.5, y1: 6.85 },
    { x0: 10.5, y0: 11.05, x1: 13.75, y1: 11.6 },
    { x0: 9.4, y0: 10.75, x1: 10.5, y1: 11.9 },
  ],
  grid: { x: [0, 7, 14], y: [0, 6, 14] },
  devices: [
    { id: "s1", kind: "switch", at: p(6.625, 4.875), facing: "w" },
    { id: "l1", kind: "lamp", at: p(1.875, 1.875) },
    { id: "l2", kind: "lamp", at: p(5.125, 1.875) },
    { id: "l3", kind: "lamp", at: p(1.875, 4.125) },
    { id: "l4", kind: "lamp", at: p(5.125, 4.125) },
    { id: "b1", kind: "box", at: p(9.875, 5.375) },
    { id: "o1", kind: "socket", at: p(7.375, 1.625), facing: "e" },
    { id: "o2", kind: "socket", at: p(10.625, 0.375), facing: "s" },
    { id: "o3", kind: "socket", at: p(13.625, 3.875), facing: "w" },
    { id: "l5", kind: "lamp", at: p(2.875, 10.875) },
    { id: "l6", kind: "lamp", at: p(5.875, 10.875) },
    { id: "b2", kind: "box", at: p(12.625, 12.875) },
    { id: "db", kind: "panel", at: p(13.625, 7.625), facing: "w" },
  ],
  jobs: [
    {
      kind: "chain",
      links: [
        ["s1", "l4"],
        ["l4", "l2"],
        ["l2", "l1"],
        ["l1", "l3"],
      ],
    },
    {
      kind: "tree",
      links: [
        ["b1", "o1"],
        ["b1", "o2"],
        ["o2", "o3"],
      ],
    },
    { kind: "ab", links: [["b2", "db"]] },
  ],
}

/* -------------------------------------------------------------------------- */
/* Router                                                                     */
/* -------------------------------------------------------------------------- */

/** Grid cell size, in plan units. */
export const CELL = 0.25

const CLEARANCE = 0.2
/** Extra cost for each cell inside a wall: cross it, don't run along it. */
const WALL_COST = 6
const BEND_COST = 4
/** Half the band around a wall line that counts as inside it. */
const WALL_HALF = 0.13

const FREE = 0
const WALL = 1
const BLOCKED = 2

/** Directions: east, south, west, north. */
const DX = [1, 0, -1, 0]
const DY = [0, 1, 0, -1]

export type Crossing = { at: Pt; horizontal: boolean }

export type RoutedLink = {
  from: string
  to: string
  /** Corner points, device to device. */
  points: Pt[]
  length: number
  /** Where the route passes through a wall: permitted, and listed. */
  crossings: Crossing[]
  /** Cells the search looked at, in the order it looked. */
  explored: Pt[]
}

export type SolvedPlan = {
  plan: FloorPlan
  devices: Map<string, Device>
  jobs: { job: Job; links: RoutedLink[]; devices: string[] }[]
}

type Grid = {
  nx: number
  ny: number
  cells: Uint8Array
}

const cellOf = (v: number) => Math.floor(v / CELL)
const centre = (i: number) => (i + 0.5) * CELL

function inRect(x: number, y: number, r: Rect, pad: number) {
  return x > r.x0 - pad && x < r.x1 + pad && y > r.y0 - pad && y < r.y1 + pad
}

function nearSegment(x: number, y: number, a: Pt, b: Pt, d: number) {
  const vx = b.x - a.x
  const vy = b.y - a.y
  const len2 = vx * vx + vy * vy || 1
  const t = Math.max(0, Math.min(1, ((x - a.x) * vx + (y - a.y) * vy) / len2))
  return Math.hypot(x - (a.x + vx * t), y - (a.y + vy * t)) <= d
}

/** The square a door sweeps through, which a route must keep out of. */
export function doorSwing(door: Door): Rect {
  const { hinge, to, side } = door
  const width = Math.hypot(to.x - hinge.x, to.y - hinge.y)
  const x0 = Math.min(hinge.x, to.x)
  const y0 = Math.min(hinge.y, to.y)
  const x1 = Math.max(hinge.x, to.x)
  const y1 = Math.max(hinge.y, to.y)
  switch (side) {
    case "n":
      return { x0, y0: y0 - width, x1, y1 }
    case "s":
      return { x0, y0, x1, y1: y1 + width }
    case "w":
      return { x0: x0 - width, y0, x1, y1 }
    case "e":
      return { x0, y0, x1: x1 + width, y1 }
  }
}

function buildGrid(plan: FloorPlan): Grid {
  const nx = Math.round(plan.w / CELL)
  const ny = Math.round(plan.h / CELL)
  const cells = new Uint8Array(nx * ny)
  const swings = plan.doors.map(doorSwing)
  const col = 0.25 + CLEARANCE
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x = centre(i)
      const y = centre(j)
      let kind = FREE
      for (const w of plan.walls) {
        if (!nearSegment(x, y, w.a, w.b, WALL_HALF + (w.exterior ? 0.1 : 0)))
          continue
        kind = w.exterior ? BLOCKED : Math.max(kind, WALL)
      }
      if (
        kind !== BLOCKED &&
        (plan.columns.some(
          (c) => Math.abs(x - c.x) < col && Math.abs(y - c.y) < col
        ) ||
          plan.ducts.some((r) => inRect(x, y, r, CLEARANCE)) ||
          swings.some((r) => inRect(x, y, r, 0.05)))
      )
        kind = BLOCKED
      cells[j * nx + i] = kind
    }
  }
  return { nx, ny, cells }
}

/** A binary min-heap of state indices, keyed by a parallel cost array. */
class Heap {
  items: number[] = []
  constructor(private key: Float64Array) {}
  get size() {
    return this.items.length
  }
  push(v: number) {
    const a = this.items
    a.push(v)
    let i = a.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.key[a[parent]] <= this.key[a[i]]) break
      ;[a[parent], a[i]] = [a[i], a[parent]]
      i = parent
    }
  }
  pop() {
    const a = this.items
    const top = a[0]
    const last = a.pop() as number
    if (a.length) {
      a[0] = last
      let i = 0
      for (;;) {
        const l = i * 2 + 1
        const r = l + 1
        let m = i
        if (l < a.length && this.key[a[l]] < this.key[a[m]]) m = l
        if (r < a.length && this.key[a[r]] < this.key[a[m]]) m = r
        if (m === i) break
        ;[a[m], a[i]] = [a[i], a[m]]
        i = m
      }
    }
    return top
  }
}

/**
 * Right-angle A* from one cell to another. The state is (cell, heading), so
 * bends are counted exactly. `blocked` overlays the grid with what earlier
 * runs and other devices occupy.
 */
function search(
  grid: Grid,
  blocked: Uint8Array,
  from: number,
  to: number
): { path: number[]; explored: number[] } | null {
  const { nx, ny, cells } = grid
  const n = nx * ny * 4
  const g = new Float64Array(n).fill(Infinity)
  const f = new Float64Array(n).fill(Infinity)
  const parent = new Int32Array(n).fill(-1)
  const closed = new Uint8Array(n)
  const seen = new Uint8Array(nx * ny)
  const explored: number[] = []
  const heap = new Heap(f)
  const tx = to % nx
  const ty = Math.floor(to / nx)
  const h = (c: number) =>
    Math.abs((c % nx) - tx) + Math.abs(Math.floor(c / nx) - ty)

  for (let d = 0; d < 4; d++) {
    const s = from * 4 + d
    g[s] = 0
    // A tiny per-heading bias keeps ties, and so the routes, deterministic.
    f[s] = h(from) + d * 1e-6
    heap.push(s)
  }

  while (heap.size) {
    const s = heap.pop()
    if (closed[s]) continue
    closed[s] = 1
    const c = s >> 2
    const d = s & 3
    if (!seen[c]) {
      seen[c] = 1
      explored.push(c)
    }
    if (c === to) {
      const path: number[] = []
      for (let k = s; k !== -1; k = parent[k]) path.push(k >> 2)
      return { path: path.reverse(), explored }
    }
    const x = c % nx
    const y = Math.floor(c / nx)
    for (let nd = 0; nd < 4; nd++) {
      if (nd === (d + 2) % 4) continue
      const x2 = x + DX[nd]
      const y2 = y + DY[nd]
      if (x2 < 0 || y2 < 0 || x2 >= nx || y2 >= ny) continue
      const c2 = y2 * nx + x2
      const kind = cells[c2]
      if (c2 !== to && (kind === BLOCKED || blocked[c2])) continue
      const cost =
        1 +
        (kind === WALL ? WALL_COST : 0) +
        (nd !== d && c !== from ? BEND_COST : 0)
      const s2 = c2 * 4 + nd
      const g2 = g[s] + cost
      if (g2 >= g[s2]) continue
      g[s2] = g2
      f[s2] = g2 + h(c2) + nd * 1e-6
      parent[s2] = s
      heap.push(s2)
    }
  }
  return null
}

function toPoint(grid: Grid, c: number): Pt {
  return { x: centre(c % grid.nx), y: centre(Math.floor(c / grid.nx)) }
}

/** Keeps only the cells where the route turns, plus both ends. */
function corners(grid: Grid, path: number[]): Pt[] {
  const pts = path.map((c) => toPoint(grid, c))
  const out: Pt[] = [pts[0]]
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const c = pts[i + 1]
    const straight =
      (a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y)
    if (!straight) out.push(b)
  }
  out.push(pts[pts.length - 1])
  return out
}

function crossings(grid: Grid, path: number[]): Crossing[] {
  const out: Crossing[] = []
  let start = -1
  for (let i = 0; i <= path.length; i++) {
    const inWall = i < path.length && grid.cells[path[i]] === WALL
    if (inWall && start < 0) start = i
    if (!inWall && start >= 0) {
      const mid = path[Math.floor((start + i - 1) / 2)]
      const prev = path[Math.max(0, start - 1)]
      const next = path[Math.min(path.length - 1, i)]
      out.push({
        at: toPoint(grid, mid),
        horizontal: prev % grid.nx !== next % grid.nx,
      })
      start = -1
    }
  }
  return out
}

function polylineLength(pts: Pt[]) {
  let total = 0
  for (let i = 1; i < pts.length; i++)
    total +=
      Math.abs(pts[i].x - pts[i - 1].x) + Math.abs(pts[i].y - pts[i - 1].y)
  return total
}

/** Marks a run, and a cell of clearance around it, as taken. */
function occupy(grid: Grid, blocked: Uint8Array, path: number[]) {
  for (const c of path) {
    const x = c % grid.nx
    const y = Math.floor(c / grid.nx)
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const x2 = x + dx
        const y2 = y + dy
        if (x2 >= 0 && y2 >= 0 && x2 < grid.nx && y2 < grid.ny)
          blocked[y2 * grid.nx + x2] = 1
      }
  }
}

/** Every device is solid, except the two a link joins, which it may leave. */
function deviceMask(grid: Grid, plan: FloorPlan, except: string[]) {
  const mask = new Uint8Array(grid.nx * grid.ny)
  for (const d of plan.devices) {
    if (except.includes(d.id)) continue
    const x = cellOf(d.at.x)
    const y = cellOf(d.at.y)
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const x2 = x + dx
        const y2 = y + dy
        if (x2 >= 0 && y2 >= 0 && x2 < grid.nx && y2 < grid.ny)
          mask[y2 * grid.nx + x2] = 1
      }
  }
  return mask
}

const cache = new WeakMap<FloorPlan, SolvedPlan>()

/**
 * Routes every job's links in order. Each finished run becomes an obstacle
 * for the next, except where it meets a device the next run starts from.
 */
export function solve(plan: FloorPlan): SolvedPlan {
  const hit = cache.get(plan)
  if (hit) return hit
  const grid = buildGrid(plan)
  const devices = new Map(plan.devices.map((d) => [d.id, d]))
  const runs = new Uint8Array(grid.nx * grid.ny)

  const jobs = plan.jobs.map((job) => {
    const links: RoutedLink[] = job.links.map(([from, to]) => {
      const a = devices.get(from)
      const b = devices.get(to)
      if (!a || !b) throw new Error(`Unknown device in link ${from}→${to}`)
      const start = cellOf(a.at.y) * grid.nx + cellOf(a.at.x)
      const end = cellOf(b.at.y) * grid.nx + cellOf(b.at.x)
      const blocked = deviceMask(grid, plan, [from, to])
      for (let i = 0; i < blocked.length; i++) blocked[i] |= runs[i]
      // A device may be left in any direction, even past an earlier run.
      for (const c of [start, end]) {
        const x = c % grid.nx
        const y = Math.floor(c / grid.nx)
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++)
            if (dx === 0 || dy === 0) {
              const x2 = x + dx
              const y2 = y + dy
              if (x2 >= 0 && y2 >= 0 && x2 < grid.nx && y2 < grid.ny)
                blocked[y2 * grid.nx + x2] = 0
            }
      }
      const found = search(grid, blocked, start, end)
      if (!found) throw new Error(`No route for ${from}→${to}`)
      occupy(grid, runs, found.path)
      const points = corners(grid, found.path)
      return {
        from,
        to,
        points,
        length: polylineLength(points),
        crossings: crossings(grid, found.path),
        explored: found.explored.map((c) => toPoint(grid, c)),
      }
    })
    const ids = [...new Set(job.links.flat())]
    return { job, links, devices: ids }
  })

  const solved = { plan, devices, jobs }
  cache.set(plan, solved)
  return solved
}

/** Whether a point lies inside anything a route must keep clear of. */
export function isClear(plan: FloorPlan, pt: Pt) {
  const swings = plan.doors.map(doorSwing)
  return !(
    plan.ducts.some((r) => inRect(pt.x, pt.y, r, 0)) ||
    swings.some((r) => inRect(pt.x, pt.y, r, -0.01)) ||
    plan.columns.some(
      (c) => Math.abs(pt.x - c.x) < 0.25 && Math.abs(pt.y - c.y) < 0.25
    )
  )
}
