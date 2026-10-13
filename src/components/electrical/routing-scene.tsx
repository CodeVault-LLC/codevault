import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import type { Device, FloorPlan, Pt, SolvedPlan } from "./floor-plan"
import { compactPlan, solve, widePlan } from "./floor-plan"

/**
 * The CodeVault Electrical scene, drawn on a canvas.
 *
 * A chalk floor plan lies on the card as if on a table: walls, doors and
 * windows, a column grid with its bubbles, and ductwork overhead, drawn
 * dashed. Room by room, a pointer picks the devices — four lights in a
 * chain, sockets in a tree, then one box to the distribution board, A to B —
 * and the route is searched for, drawn and checked. Where a route passes
 * through a wall, a sleeve marks it. When a room is done, its lights come on.
 *
 * Every route comes from the router in `floor-plan.ts`, so none of them cut
 * through a duct, a column or a door's swing. Decorative: the card around it
 * carries the real heading and link.
 *
 * Costs: the plan is drawn once into a cached layer after the intro; each
 * frame after that only draws the work in progress. The loop stops while the
 * canvas is offscreen or the tab is hidden, and with reduced motion the
 * finished plan is drawn once and never animated.
 */
export function RoutingScene({
  className,
  frame = "card",
}: {
  className?: string
  /**
   * `card` leaves room for the announcement's title above and its text
   * below; `panel` lets the plan fill the frame.
   */
  frame?: "card" | "panel"
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    return runScene(canvas, ctx, frame)
  }, [frame])

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 size-full overflow-hidden",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full font-mono"
      />
    </div>
  )
}

/** How much the plan is foreshortened, like a drawing lying on a table. */
const TILT = 0.74

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3)
const easeInOut = (t: number) => {
  const x = clamp(t, 0, 1)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
const smooth = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a), 0, 1)
  return x * x * (3 - 2 * x)
}
/** 0 → 1 over [a, b], with a small overshoot, for things that pop in. */
const pop = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a), 0, 1)
  const c = 1.70158
  return x === 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2)
}

/**
 * A color at zero opacity. Gradients toward plain "transparent" pass through
 * grey on the way, because canvas treats it as transparent black.
 */
function clear(color: string) {
  const hex = /^#([0-9a-f]{6})$/i.exec(color)?.[1]
  if (!hex) return "transparent"
  const n = parseInt(hex, 16)
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, 0)`
}

/** A polyline with its running length, for walking along it. */
type Track = { pts: Pt[]; at: number[]; length: number }

function track(pts: Pt[]): Track {
  const at = [0]
  for (let i = 1; i < pts.length; i++)
    at.push(
      at[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
    )
  return { pts, at, length: at[at.length - 1] }
}

function pointAlong(t: Track, distance: number): Pt {
  const d = clamp(distance, 0, t.length)
  let i = 1
  while (i < t.pts.length - 1 && t.at[i] < d) i++
  const a = t.pts[i - 1]
  const b = t.pts[i]
  const seg = t.at[i] - t.at[i - 1]
  const u = seg === 0 ? 0 : (d - t.at[i - 1]) / seg
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) }
}

/** Traces a track up to a distance. */
function traceTo(ctx: CanvasRenderingContext2D, t: Track, distance: number) {
  ctx.beginPath()
  ctx.moveTo(t.pts[0].x, t.pts[0].y)
  for (let i = 1; i < t.pts.length; i++) {
    if (t.at[i] <= distance) {
      ctx.lineTo(t.pts[i].x, t.pts[i].y)
      continue
    }
    const p = pointAlong(t, distance)
    ctx.lineTo(p.x, p.y)
    break
  }
}

/** Right-angle corners, rounded the way an elbow bends conduit. */
function rounded(corners: Pt[], radius: number): Pt[] {
  const out: Pt[] = [corners[0]]
  for (let i = 1; i < corners.length - 1; i++) {
    const a = corners[i - 1]
    const b = corners[i]
    const c = corners[i + 1]
    const inLen = Math.hypot(b.x - a.x, b.y - a.y)
    const outLen = Math.hypot(c.x - b.x, c.y - b.y)
    const r = Math.min(radius, inLen / 2, outLen / 2)
    const u = { x: (b.x - a.x) / inLen, y: (b.y - a.y) / inLen }
    const v = { x: (c.x - b.x) / outLen, y: (c.y - b.y) / outLen }
    const p0 = { x: b.x - u.x * r, y: b.y - u.y * r }
    const p1 = { x: b.x + v.x * r, y: b.y + v.y * r }
    // A quadratic through the corner is close enough to a quarter circle
    // at this size, and stays right on a foreshortened plan.
    for (let k = 0; k <= 8; k++) {
      const s = k / 8
      const m = 1 - s
      out.push({
        x: m * m * p0.x + 2 * m * s * b.x + s * s * p1.x,
        y: m * m * p0.y + 2 * m * s * b.y + s * s * p1.y,
      })
    }
  }
  out.push(corners[corners.length - 1])
  return out
}

/* -------------------------------------------------------------------------- */
/* Chalk strokes                                                              */
/* -------------------------------------------------------------------------- */

type Chalk = {
  /** Resampled points with a little perpendicular jitter baked in. */
  pts: Pt[]
  /** Per-segment bucket 0..3 — controls alpha and width. */
  bucket: Uint8Array
}

function chalk(points: Pt[], rand: () => number, jitter = 0.45): Chalk {
  const pts: Pt[] = []
  const step = 2.5
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    const n = Math.max(1, Math.round(len / step))
    const nx = -(b.y - a.y) / (len || 1)
    const ny = (b.x - a.x) / (len || 1)
    for (let k = i === 1 ? 0 : 1; k <= n; k++) {
      const t = k / n
      const j = (rand() - 0.5) * 2 * jitter
      pts.push({ x: lerp(a.x, b.x, t) + nx * j, y: lerp(a.y, b.y, t) + ny * j })
    }
  }
  const bucket = new Uint8Array(Math.max(0, pts.length - 1))
  for (let i = 0; i < bucket.length; i++) bucket[i] = Math.floor(rand() * 4)
  return { pts, bucket }
}

const BUCKET_ALPHA = [0.55, 0.72, 0.86, 1]
const BUCKET_WIDTH = [0.8, 0.95, 1.1, 1.3]

function drawChalk(
  ctx: CanvasRenderingContext2D,
  c: Chalk,
  progress: number,
  color: string,
  width: number,
  cap: CanvasLineCap = "round"
) {
  const last = Math.floor(clamp(progress, 0, 1) * c.bucket.length)
  if (last <= 0) return
  ctx.strokeStyle = color
  ctx.lineCap = cap
  for (let b = 0; b < 4; b++) {
    ctx.globalAlpha = BUCKET_ALPHA[b]
    ctx.lineWidth = width * BUCKET_WIDTH[b]
    ctx.beginPath()
    for (let i = 0; i < last; i++) {
      if (c.bucket[i] !== b) continue
      ctx.moveTo(c.pts[i].x, c.pts[i].y)
      ctx.lineTo(c.pts[i + 1].x, c.pts[i + 1].y)
    }
    ctx.stroke()
  }
  // A faint second pass, offset, for the grain of chalk on a board.
  ctx.globalAlpha = 0.18
  ctx.lineWidth = width * 0.7
  ctx.beginPath()
  for (let i = 0; i < last; i += 2) {
    ctx.moveTo(c.pts[i].x + 0.6, c.pts[i].y + 0.5)
    ctx.lineTo(c.pts[i + 1].x + 0.6, c.pts[i + 1].y + 0.5)
  }
  ctx.stroke()
  ctx.globalAlpha = 1
}

/* -------------------------------------------------------------------------- */
/* Timeline                                                                   */
/* -------------------------------------------------------------------------- */

const INTRO = {
  grid: [0, 1.2] as const,
  walls: [0.3, 1.9] as const,
  openings: [1.2, 2.1] as const,
  services: [1.4, 2.3] as const,
  devices: [1.8, 2.6] as const,
  /** When the work starts, relative to the scene. */
  work: 2.4,
}

type LinkTimes = { search: [number, number]; draw: [number, number] }

type JobTimes = {
  t0: number
  /** When each of the job's devices is picked, in `devices` order. */
  picks: number[]
  links: LinkTimes[]
  /** The check that walks each route once it's drawn. */
  check: [number, number]
  /** Devices show as connected; lights come on. */
  done: number
  t1: number
}

type Timeline = {
  jobs: JobTimes[]
  /** The work is cleared away from here; the loop restarts at `length`. */
  fade: number
  length: number
}

const PICK_GAP = 0.42

function jobTimes(solved: SolvedPlan, index: number, t0: number): JobTimes {
  const { links, devices } = solved.jobs[index]
  let t = t0 + 0.6
  const picks = devices.map((_, i) => t + i * PICK_GAP)
  t = picks[picks.length - 1] + 0.45
  const times: LinkTimes[] = links.map((link) => {
    const search: [number, number] = [
      t,
      t + clamp(0.22 + link.explored.length / 2600, 0.3, 0.85),
    ]
    const draw: [number, number] = [
      search[1],
      search[1] + clamp(0.18 + link.length * 0.035, 0.35, 1.25),
    ]
    t = draw[1] + 0.05
    return { search, draw }
  })
  const check: [number, number] = [t + 0.1, t + 0.85]
  const done = check[1]
  return { t0, picks, links: times, check, done, t1: done + 0.9 }
}

/** The rooms, one after another. */
function timeline(solved: SolvedPlan): Timeline {
  const jobs: JobTimes[] = []
  let t = 0
  solved.jobs.forEach((_, i) => {
    const times = jobTimes(solved, i, t)
    jobs.push(times)
    t = times.t1
  })
  const fade = t + 0.6
  return { jobs, fade, length: fade + 1.4 }
}

/* -------------------------------------------------------------------------- */
/* The pointer                                                                */
/* -------------------------------------------------------------------------- */

/** An arrow pointer, tip at the origin. */
const POINTER_PATH =
  "M0 0 L0 15.5 L4.1 11.8 L7 18 L9.7 16.8 L6.9 10.7 L12 10.7 Z"

type Stop = { t: number; at: Pt }

/**
 * Where the pointer is: it rests on each device as it's picked and glides to
 * the next just before. Long gaps (between rooms) get an unhurried move;
 * short ones a quick flick.
 */
function pointerAt(stops: Stop[], t: number): Pt {
  if (t <= stops[0].t) return stops[0].at
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1]
    const b = stops[i]
    if (t > b.t) continue
    const travel = Math.min(b.t - a.t, b.t - a.t > 1 ? 0.75 : 0.3)
    const u = easeInOut((t - (b.t - travel)) / travel)
    return { x: lerp(a.at.x, b.at.x, u), y: lerp(a.at.y, b.at.y, u) }
  }
  return stops[stops.length - 1].at
}

/* -------------------------------------------------------------------------- */
/* Runtime                                                                    */
/* -------------------------------------------------------------------------- */

type Colors = {
  ink: string
  accent: string
  faint: string
  bg: string
  font: string
}

function readColors(el: Element): Colors {
  const s = getComputedStyle(el)
  const v = (name: string, fallback: string) =>
    s.getPropertyValue(name).trim() || fallback
  return {
    ink: v("--foreground", "#141413"),
    accent: v("--persimmon", "#e85d3c"),
    faint: v("--faint", "#87867f"),
    bg: v("--surface", "#f0eee6"),
    font: s.fontFamily || "ui-monospace, monospace",
  }
}

/** A route as drawn: rounded, in px, with its sleeves placed along it. */
type DrawnLink = {
  track: Track
  sleeves: { at: number; pt: Pt; horizontal: boolean }[]
  explored: Pt[]
}

type Layout = {
  plan: FloorPlan
  solved: SolvedPlan
  /** Plan units to px. */
  s: number
  project: (p: Pt) => Pt
  links: DrawnLink[][]
  wallChalk: { chalk: Chalk; width: number }[]
  tl: Timeline
  /** Where the pointer rests: each device, as it's picked. */
  stops: Stop[]
}

function runScene(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  frame: "card" | "panel"
) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
  const dark = window.matchMedia("(prefers-color-scheme: dark)")

  let colors = readColors(canvas)
  let width = 0
  let height = 0
  let dpr = 1
  let L: Layout | undefined
  let cache: HTMLCanvasElement | null = null
  let pointer: Path2D | undefined

  let elapsed = 0
  let last = 0
  let frameId = 0
  let visible = false

  function layout() {
    const rect = canvas.getBoundingClientRect()
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)

    const narrow = width < 640
    const plan = narrow ? compactPlan : widePlan
    const solved = solve(plan)

    // The area the plan may use, leaving the card's title and text clear.
    // On wide frames the height decides the size, so the plan sits in the
    // middle with room around it instead of stretching edge to edge.
    const area =
      frame === "card"
        ? narrow
          ? { top: 0.2, bottom: 0.7, side: 0.05 }
          : { top: 0.29, bottom: 0.77, side: 0.12 }
        : { top: 0.08, bottom: 0.92, side: 0.08 }
    // The plan plus its grid bubbles, which sit outside the walls.
    const bounds = { x0: -1.9, y0: -1.9, x1: plan.w + 0.7, y1: plan.h + 0.7 }
    const bw = bounds.x1 - bounds.x0
    const bh = (bounds.y1 - bounds.y0) * TILT
    const availW = width * (1 - area.side * 2)
    const availH = height * (area.bottom - area.top)
    const s = Math.min(availW / bw, availH / bh)
    const ox = (width - bw * s) / 2 - bounds.x0 * s
    const oy = height * area.top + (availH - bh * s) / 2 - bounds.y0 * s * TILT
    const project = (pt: Pt): Pt => ({
      x: ox + pt.x * s,
      y: oy + pt.y * s * TILT,
    })

    const rand = mulberry32(7)
    const exterior = clamp(s * 0.16, 2.6, 5.2)
    const interior = clamp(s * 0.1, 1.8, 3.4)
    const wallChalk = plan.walls.map((w) => ({
      chalk: chalk([project(w.a), project(w.b)], rand, 0.35),
      width: w.exterior ? exterior : interior,
    }))

    const links = solved.jobs.map((job) =>
      job.links.map((link): DrawnLink => {
        const t = track(rounded(link.points.map(project), s * 0.42))
        const sleeves = link.crossings.map((c) => {
          const pt = project(c.at)
          let best = 0
          let bestD = Infinity
          t.pts.forEach((q, i) => {
            const d = Math.hypot(q.x - pt.x, q.y - pt.y)
            if (d < bestD) {
              bestD = d
              best = i
            }
          })
          return { at: t.at[best], pt, horizontal: c.horizontal }
        })
        return { track: t, sleeves, explored: link.explored.map(project) }
      })
    )

    const tl = timeline(solved)
    const stops = solved.jobs.flatMap((job, j) =>
      job.devices.map((id, i) => ({
        t: tl.jobs[j].picks[i],
        at: project(solved.devices.get(id)?.at ?? { x: 0, y: 0 }),
      }))
    )
    L = { plan, solved, s, project, links, wallChalk, tl, stops }
    cache = null
  }

  function introProgress(t: number, [a, b]: readonly [number, number]) {
    return easeInOut((t - a) / (b - a))
  }

  /* ----------------------------- Drawing the plan ------------------------- */

  function drawDevice(
    target: CanvasRenderingContext2D,
    d: Device,
    color: string,
    scale = 1
  ) {
    if (!L || scale <= 0) return
    const { x, y } = L.project(d.at)
    const u = Math.max(L.s, 16) * scale
    target.save()
    target.strokeStyle = color
    target.fillStyle = colors.bg
    target.lineWidth = 1.3
    target.lineCap = "round"
    target.lineJoin = "round"
    switch (d.kind) {
      case "lamp": {
        // A crossed circle, as on an electrical drawing.
        const r = u * 0.3
        target.beginPath()
        target.ellipse(x, y, r, r * TILT, 0, 0, Math.PI * 2)
        target.fill()
        target.stroke()
        const k = r * Math.SQRT1_2
        target.beginPath()
        target.moveTo(x - k, y - k * TILT)
        target.lineTo(x + k, y + k * TILT)
        target.moveTo(x + k, y - k * TILT)
        target.lineTo(x - k, y + k * TILT)
        target.stroke()
        break
      }
      case "socket": {
        // A half circle against the wall, open side to the room.
        const r = u * 0.26
        const dir = { n: -Math.PI / 2, s: Math.PI / 2, e: 0, w: Math.PI }[
          d.facing ?? "s"
        ]
        const back = {
          x: -Math.cos(dir) * r * 0.5,
          y: -Math.sin(dir) * r * 0.5 * TILT,
        }
        target.beginPath()
        target.ellipse(
          x + back.x,
          y + back.y,
          r,
          r * TILT,
          0,
          dir - Math.PI / 2,
          dir + Math.PI / 2
        )
        target.closePath()
        target.fill()
        target.stroke()
        break
      }
      case "switch": {
        const r = u * 0.09
        const dir = { n: -Math.PI / 2, s: Math.PI / 2, e: 0, w: Math.PI }[
          d.facing ?? "s"
        ]
        const a = dir - Math.PI / 4
        const tip = {
          x: x + Math.cos(a) * u * 0.42,
          y: y + Math.sin(a) * u * 0.42 * TILT,
        }
        target.beginPath()
        target.moveTo(x, y)
        target.lineTo(tip.x, tip.y)
        target.lineTo(
          tip.x + Math.cos(a + Math.PI / 2) * u * 0.12,
          tip.y + Math.sin(a + Math.PI / 2) * u * 0.12 * TILT
        )
        target.stroke()
        target.fillStyle = color
        target.beginPath()
        target.ellipse(x, y, r * 1.4, r * 1.4 * TILT, 0, 0, Math.PI * 2)
        target.fill()
        break
      }
      case "box": {
        const h = u * 0.2
        target.beginPath()
        target.rect(x - h, y - h * TILT, h * 2, h * 2 * TILT)
        target.fill()
        target.stroke()
        target.fillStyle = color
        target.beginPath()
        target.ellipse(x, y, h * 0.32, h * 0.32 * TILT, 0, 0, Math.PI * 2)
        target.fill()
        break
      }
      case "panel": {
        // A distribution board: a long box against the wall, half filled.
        const along = d.facing === "n" || d.facing === "s"
        const hw = along ? u * 0.55 : u * 0.2
        const hh = (along ? u * 0.2 : u * 0.55) * TILT
        target.beginPath()
        target.rect(x - hw, y - hh, hw * 2, hh * 2)
        target.fill()
        target.stroke()
        target.fillStyle = color
        target.beginPath()
        target.moveTo(x - hw, y - hh)
        target.lineTo(x + hw, y - hh)
        target.lineTo(x - hw, y + hh)
        target.closePath()
        target.fill()
        break
      }
    }
    target.restore()
  }

  /** Grid, walls, openings, services and devices. Static once drawn in. */
  function drawStatic(target: CanvasRenderingContext2D, t: number) {
    if (!L) return
    const { plan, project, s } = L

    // Dot grid, fading toward the edges like a viewport's ground plane.
    const gap = width < 640 ? 18 : 22
    const gridIn = clamp(t / 1.2, 0, 1)
    target.fillStyle = colors.ink
    const cx = width / 2
    const cy = height * 0.52
    const reach = Math.max(width, height) * 0.62
    for (let y = gap / 2; y < height; y += gap) {
      for (let x = gap / 2; x < width; x += gap) {
        const fall = 1 - Math.hypot(x - cx, (y - cy) * 1.4) / reach
        if (fall <= 0) continue
        target.globalAlpha = 0.07 * fall * gridIn
        target.fillRect(x - 0.6, y - 0.6, 1.2, 1.2)
      }
    }
    target.globalAlpha = 1

    // Column grid: dash-dot lines, each with a bubble and its label.
    const gp = introProgress(t, INTRO.grid)
    if (gp > 0) {
      const r = clamp(s * 0.36, 6.5, 12)
      target.save()
      target.strokeStyle = colors.faint
      target.fillStyle = colors.faint
      target.lineWidth = 0.9
      target.font = `500 ${Math.round(r * 1.05)}px ${colors.font}`
      target.textAlign = "center"
      target.textBaseline = "middle"
      const lines = [
        ...plan.grid.x.map((x, i) => ({
          a: project({ x, y: -1.3 }),
          b: project({ x, y: plan.h + 0.6 }),
          label: String(i + 1),
        })),
        ...plan.grid.y.map((y, i) => ({
          a: project({ x: -1.3, y }),
          b: project({ x: plan.w + 0.6, y }),
          label: String.fromCharCode(65 + i),
        })),
      ]
      for (const line of lines) {
        const dx = line.b.x - line.a.x
        const dy = line.b.y - line.a.y
        const len = Math.hypot(dx, dy)
        const ux = dx / len
        const uy = dy / len
        target.globalAlpha = 0.45 * gp
        target.setLineDash([10, 3, 1.5, 3])
        target.beginPath()
        target.moveTo(line.a.x + ux * r, line.a.y + uy * r)
        target.lineTo(line.a.x + dx * gp, line.a.y + dy * gp)
        target.stroke()
        target.setLineDash([])
        target.globalAlpha = 0.75 * gp
        target.beginPath()
        target.arc(line.a.x, line.a.y, r, 0, Math.PI * 2)
        target.stroke()
        target.fillText(line.label, line.a.x, line.a.y + 0.5)
      }
      target.restore()
    }

    // Walls, heavy, one after another.
    L.wallChalk.forEach((w, i) => {
      const n = L?.wallChalk.length ?? 1
      const begin = lerp(INTRO.walls[0], INTRO.walls[1] - 0.6, i / n)
      drawChalk(
        target,
        w.chalk,
        introProgress(t, [begin, begin + 0.6]),
        colors.ink,
        w.width,
        "square"
      )
    })

    const op = introProgress(t, INTRO.openings)
    if (op > 0) {
      target.save()
      target.globalAlpha = op
      target.strokeStyle = colors.ink
      target.lineCap = "round"
      // Windows: the glass line between two jambs.
      for (const [a, b] of plan.windows) {
        const pa = project(a)
        const pb = project(b)
        const off = clamp(s * 0.08, 1.5, 3)
        target.lineWidth = 0.9
        target.beginPath()
        for (const k of [-off, 0, off]) {
          target.moveTo(pa.x, pa.y + k * TILT)
          target.lineTo(pb.x, pb.y + k * TILT)
        }
        target.stroke()
      }
      // Doors: the leaf, open, and the arc it swings through.
      for (const door of plan.doors) {
        const w = Math.hypot(door.to.x - door.hinge.x, door.to.y - door.hinge.y)
        const dir = {
          n: { x: 0, y: -1 },
          s: { x: 0, y: 1 },
          e: { x: 1, y: 0 },
          w: { x: -1, y: 0 },
        }[door.side]
        const open = {
          x: door.hinge.x + dir.x * w,
          y: door.hinge.y + dir.y * w,
        }
        const h = project(door.hinge)
        const o = project(open)
        const c = project(door.to)
        target.lineWidth = 1.4
        target.beginPath()
        target.moveTo(h.x, h.y)
        target.lineTo(o.x, o.y)
        target.stroke()
        target.lineWidth = 0.8
        target.globalAlpha = 0.6 * op
        target.beginPath()
        const steps = 16
        for (let k = 0; k <= steps; k++) {
          const a = (k / steps) * (Math.PI / 2)
          const px =
            door.hinge.x +
            (open.x - door.hinge.x) * Math.cos(a) +
            (door.to.x - door.hinge.x) * Math.sin(a)
          const py =
            door.hinge.y +
            (open.y - door.hinge.y) * Math.cos(a) +
            (door.to.y - door.hinge.y) * Math.sin(a)
          const q = project({ x: px, y: py })
          if (k === 0) target.moveTo(q.x, q.y)
          else target.lineTo(q.x, q.y)
        }
        target.lineTo(c.x, c.y)
        target.stroke()
        target.globalAlpha = op
      }
      target.restore()
    }

    const sp = introProgress(t, INTRO.services)
    if (sp > 0) {
      target.save()
      // Columns, cut: solid.
      target.globalAlpha = 0.85 * sp
      target.fillStyle = colors.ink
      const half = 0.26
      for (const c of plan.columns) {
        const a = project({ x: c.x - half, y: c.y - half })
        const b = project({ x: c.x + half, y: c.y + half })
        target.fillRect(a.x, a.y, b.x - a.x, b.y - a.y)
      }
      // Ducts, overhead: dashed, as hidden lines. A diffuser is crossed.
      target.globalAlpha = 0.6 * sp
      target.strokeStyle = colors.faint
      target.lineWidth = 1.1
      target.setLineDash([5, 4])
      for (const r of plan.ducts) {
        const a = project({ x: r.x0, y: r.y0 })
        const b = project({ x: r.x1, y: r.y1 })
        target.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y)
        const square = Math.abs(r.x1 - r.x0 - (r.y1 - r.y0)) < 0.3
        if (square) {
          target.setLineDash([])
          target.beginPath()
          target.moveTo(a.x, a.y)
          target.lineTo(b.x, b.y)
          target.moveTo(b.x, a.y)
          target.lineTo(a.x, b.y)
          target.stroke()
          target.setLineDash([5, 4])
        }
      }
      target.restore()
    }

    // Devices pop in, one after another.
    plan.devices.forEach((d, i) => {
      const begin = lerp(
        INTRO.devices[0],
        INTRO.devices[1] - 0.35,
        i / plan.devices.length
      )
      drawDevice(target, d, colors.ink, pop(begin, begin + 0.35, t))
    })
  }

  function ensureCache() {
    if (cache) return cache
    cache = document.createElement("canvas")
    cache.width = canvas.width
    cache.height = canvas.height
    const c = cache.getContext("2d")
    if (!c) return null
    c.scale(dpr, dpr)
    drawStatic(c, 99)
    return cache
  }

  /* ------------------------------ Drawing the work ------------------------ */

  /** A sleeve where a route passes through a wall. */
  function drawSleeve(sl: DrawnLink["sleeves"][number], alpha: number) {
    if (!L || alpha <= 0) return
    const len = clamp(L.s * 0.6, 8, 18)
    const w = clamp(L.s * 0.26, 5, 9)
    const [hw, hh] = sl.horizontal
      ? [len / 2, (w / 2) * TILT * 1.4]
      : [w / 2, (len / 2) * TILT]
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 1.2
    ctx.beginPath()
    if (sl.horizontal) {
      ctx.moveTo(sl.pt.x - hw, sl.pt.y - hh)
      ctx.lineTo(sl.pt.x + hw, sl.pt.y - hh)
      ctx.moveTo(sl.pt.x - hw, sl.pt.y + hh)
      ctx.lineTo(sl.pt.x + hw, sl.pt.y + hh)
    } else {
      ctx.moveTo(sl.pt.x - hw, sl.pt.y - hh)
      ctx.lineTo(sl.pt.x - hw, sl.pt.y + hh)
      ctx.moveTo(sl.pt.x + hw, sl.pt.y - hh)
      ctx.lineTo(sl.pt.x + hw, sl.pt.y + hh)
    }
    ctx.stroke()
    ctx.restore()
  }

  function drawRoute(link: DrawnLink, drawn: number, alpha: number) {
    if (drawn <= 0 || alpha <= 0) return
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    // A halo first, so the route reads over the chalk it crosses.
    ctx.strokeStyle = colors.bg
    ctx.lineWidth = 5.5
    traceTo(ctx, link.track, drawn)
    ctx.stroke()
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 2.2
    ctx.stroke()
    ctx.restore()
  }

  /** The cells the search looked at, as a wave that passes and fades. */
  function drawSearch(link: DrawnLink, p: number, alpha: number) {
    if (p <= 0 || p >= 1.6 || alpha <= 0) return
    const n = link.explored.length
    const head = Math.min(n, Math.floor(p * n))
    // Only the recent front of the search, so it reads as a wave moving
    // out, not a field filling in.
    const tailLength = Math.max(24, n * 0.16)
    const size = clamp((L?.s ?? 20) * 0.13, 2, 4)
    ctx.save()
    ctx.fillStyle = colors.ink
    for (let i = Math.max(0, Math.floor(head - tailLength)); i < head; i++) {
      const age = (head - i) / tailLength
      const fadeAll = p > 1 ? 1 - (p - 1) / 0.6 : 1
      ctx.globalAlpha = alpha * 0.5 * (1 - age) * fadeAll
      const q = link.explored[i]
      ctx.fillRect(q.x - size / 2, q.y - (size / 2) * TILT, size, size * TILT)
    }
    ctx.restore()
  }

  function drawPick(d: Device, since: number, alpha: number, t: number) {
    if (!L || since <= 0 || alpha <= 0) return
    const { x, y } = L.project(d.at)
    const r = Math.max(L.s, 16) * 0.55 * pop(0, 0.35, since)
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 1.4
    ctx.setLineDash([3, 3])
    ctx.lineDashOffset = -t * 12
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * TILT, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  function drawTag(d: Device, label: string, alpha: number) {
    if (!L || alpha <= 0) return
    const { x, y } = L.project(d.at)
    const off = Math.max(L.s, 16) * 0.75
    const size = clamp(L.s * 0.42, 10, 14)
    const tx = x + off * 0.9
    const ty = y - off * TILT
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.font = `600 ${Math.round(size)}px ${colors.font}`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    const w = size * 1.35
    ctx.fillStyle = colors.accent
    ctx.beginPath()
    ctx.roundRect(tx - w / 2, ty - w / 2, w, w, 3)
    ctx.fill()
    ctx.fillStyle = colors.bg
    ctx.fillText(label, tx, ty + 0.5)
    ctx.restore()
  }

  function drawGlow(d: Device, since: number, alpha: number) {
    if (!L || since <= 0 || alpha <= 0) return
    const { x, y } = L.project(d.at)
    const r = Math.max(L.s, 16) * 1.5
    const breathe = 0.85 + 0.15 * Math.sin(since * 2.4)
    const on = easeOut(since / 0.5)
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(1, TILT)
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    glow.addColorStop(0, colors.accent)
    glow.addColorStop(1, clear(colors.accent))
    ctx.globalAlpha = alpha * on * 0.3 * breathe
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  /** One job's work at time `t` (relative to the loop), faded by `alpha`. */
  function drawJob(index: number, times: JobTimes, t: number, alpha: number) {
    if (!L || t < times.t0) return
    const job = L.solved.jobs[index]
    const links = L.links[index]
    const done = t - times.done

    if (done > 0)
      job.devices.forEach((id) => {
        const d = L?.solved.devices.get(id)
        if (d?.kind === "lamp") drawGlow(d, done, alpha)
      })

    links.forEach((link, i) => {
      const lt = times.links[i]
      drawSearch(
        link,
        (t - lt.search[0]) / (lt.search[1] - lt.search[0]),
        alpha
      )
      const drawn =
        link.track.length *
        easeInOut((t - lt.draw[0]) / (lt.draw[1] - lt.draw[0]))
      drawRoute(link, drawn, alpha)
    })

    // The check walks every route at once; each sleeve appears as it passes.
    const check = (t - times.check[0]) / (times.check[1] - times.check[0])
    if (check > 0) {
      links.forEach((link) => {
        const at = link.track.length * easeInOut(check)
        for (const sl of link.sleeves)
          drawSleeve(sl, alpha * clamp((at - sl.at) / 10, 0, 1))
        if (check < 1) {
          const p = pointAlong(link.track, at)
          ctx.save()
          ctx.globalAlpha = alpha * Math.sin(Math.PI * clamp(check, 0, 1))
          ctx.fillStyle = colors.bg
          ctx.strokeStyle = colors.accent
          ctx.lineWidth = 1.6
          ctx.beginPath()
          ctx.arc(p.x, p.y, 3.6, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          ctx.restore()
        }
      })
    }

    job.devices.forEach((id, i) => {
      const d = L?.solved.devices.get(id)
      if (!d) return
      const since = t - times.picks[i]
      // Picked: a selection ring until the check is done; then connected.
      drawPick(d, since, alpha * (1 - smooth(0, 0.4, done)), t)
      if (since > 0) {
        ctx.save()
        ctx.globalAlpha = alpha
        drawDevice(ctx, d, colors.accent)
        ctx.restore()
      }
      if (job.job.kind === "ab")
        drawTag(d, i === 0 ? "A" : "B", alpha * smooth(0, 0.25, since))
    })
  }

  /** The finished plan: every route drawn, checked and connected. */
  function drawFinished() {
    if (!L) return
    L.links.forEach((links, j) => {
      const job = L?.solved.jobs[j]
      if (!job) return
      for (const link of links) {
        drawRoute(link, link.track.length, 1)
        for (const sl of link.sleeves) drawSleeve(sl, 1)
      }
      for (const id of job.devices) {
        const d = L?.solved.devices.get(id)
        if (!d) continue
        if (d.kind === "lamp") drawGlow(d, 0.6, 1)
        drawDevice(ctx, d, colors.accent)
      }
    })
  }

  /* -------------------------------- The pointer --------------------------- */

  function drawPointer(t: number, alpha: number) {
    if (!L) return
    const { stops } = L
    const first = stops[0].t
    const appear = smooth(first - 0.9, first - 0.5, t)
    if (appear * alpha <= 0) return
    const at = pointerAt(stops, t)
    // Fades in a little way off its first device, and glides in.
    const off = (1 - appear) * 24
    // A press on each pick: down, and back.
    let press = 0
    for (const pick of stops) {
      const u = (t - pick.t + 0.06) / 0.22
      if (u >= 0 && u < 1) press = Math.sin(Math.PI * u)
    }
    const k = clamp(L.s / 30, 0.9, 1.25) * (1 - press * 0.14)
    ctx.save()
    ctx.globalAlpha = appear * alpha
    ctx.translate(at.x + off + 1, at.y + off * 0.6 + 1)
    ctx.scale(k, k)
    ctx.lineJoin = "round"
    ctx.lineWidth = 1.6
    ctx.strokeStyle = colors.bg
    ctx.fillStyle = colors.ink
    // Made here, not at module load: Path2D only exists in the browser.
    pointer ??= new Path2D(POINTER_PATH)
    ctx.stroke(pointer)
    ctx.fill(pointer)
    ctx.restore()
  }

  /* -------------------------------- The loop ------------------------------ */

  function render(total: number, still: boolean) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (!L) return

    const introDone = still || total > INTRO.devices[1] + 0.2
    if (introDone) {
      const layer = ensureCache()
      if (layer) {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.drawImage(layer, 0, 0)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
    } else {
      drawStatic(ctx, total)
    }

    if (still) {
      drawFinished()
      return
    }

    const loopT = total - INTRO.work
    if (loopT < 0) return
    const { tl } = L
    const t = loopT % tl.length
    const alpha = 1 - smooth(tl.fade, tl.fade + 1, t)
    tl.jobs.forEach((times, i) => drawJob(i, times, t, alpha))
    drawPointer(t, alpha)
  }

  function tick(now: number) {
    const delta = last ? Math.min(0.05, (now - last) / 1000) : 0
    last = now
    elapsed += delta
    render(elapsed, false)
    frameId = requestAnimationFrame(tick)
  }

  function start() {
    if (frameId || reduce.matches) return
    last = 0
    frameId = requestAnimationFrame(tick)
  }

  function stop() {
    cancelAnimationFrame(frameId)
    frameId = 0
  }

  function sync() {
    if (reduce.matches) {
      stop()
      render(99, true)
      return
    }
    if (visible && !document.hidden) start()
    else stop()
  }

  function onResize() {
    layout()
    // Resizing clears the canvas; redraw now rather than leave a blank frame
    // until the next tick.
    render(reduce.matches ? 99 : elapsed, reduce.matches)
  }

  function onTheme() {
    colors = readColors(canvas)
    cache = null
    if (!frameId) render(reduce.matches ? 99 : elapsed, reduce.matches)
  }

  layout()
  const resizer = new ResizeObserver(onResize)
  resizer.observe(canvas)
  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting)
    sync()
  })
  observer.observe(canvas)
  document.addEventListener("visibilitychange", sync)
  reduce.addEventListener("change", sync)
  dark.addEventListener("change", onTheme)
  sync()

  return () => {
    stop()
    resizer.disconnect()
    observer.disconnect()
    document.removeEventListener("visibilitychange", sync)
    reduce.removeEventListener("change", sync)
    dark.removeEventListener("change", onTheme)
  }
}
