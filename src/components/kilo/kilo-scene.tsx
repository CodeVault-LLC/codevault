import { useEffect, useRef } from "react"

import { gsap } from "@/core/lib/motion"
import { cn } from "@/lib/utils"
import { Orbit, orbitFoot } from "@/components/brand/orbit"

/**
 * The Kilo announcement scene, drawn on a canvas.
 *
 * A chalk arc carries three building modules drawn the way a CAD viewport
 * draws them: isometric, with hidden edges dashed. Orbit flies in and lands
 * on each roof in turn, and that module wires itself up — the cable
 * draws in, current pulses along it, the ceiling lamp comes on.
 *
 * Decorative: the card around it carries the real heading and link.
 *
 * Orbit is the SVG drawing laid over the canvas, held still and moved by the
 * scene: one transform per frame, plus its eyes for blinks and glances.
 *
 * Costs: the arc, grid and modules are drawn once into a cached layer after
 * the intro; each frame after that only draws cables, glows and the shadow.
 * The loop stops while the canvas is offscreen or the tab is hidden, and with
 * reduced motion the finished scene is drawn once and never animated.
 */
export function KiloScene({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const mascot = mascotRef.current
    if (!canvas || !mascot) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    return runScene(canvas, ctx, mascot)
  }, [])

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 size-full overflow-hidden",
        className
      )}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div
        ref={mascotRef}
        className="absolute top-0 left-0 origin-top-left opacity-0 will-change-transform"
        style={{ width: ORBIT_BOX, height: ORBIT_BOX }}
      >
        <Orbit pose="stand" still className="size-full" />
      </div>
    </div>
  )
}

// Orbit's viewBox is 136 units from (-8, -12); the overlay draws it at one
// pixel per unit, so the feet sit at this point in the box.
const ORBIT_BOX = 136
const ORBIT_FEET = { x: orbitFoot.x + 8, y: orbitFoot.y + 12 }
// Where the eyes are centered, for blinking in place.
const ORBIT_EYE_Y = 46

/* -------------------------------------------------------------------------- */
/* Geometry                                                                   */
/* -------------------------------------------------------------------------- */

type Pt = { x: number; y: number }
type P3 = [number, number, number]

const COS30 = Math.cos(Math.PI / 6)
const SIN30 = 0.5

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

/** A circular arc through both ends and a peak, like a horizon. */
class Arc {
  cx: number
  cy: number
  r: number
  x0: number
  x1: number

  constructor(x0: number, x1: number, endY: number, peakY: number) {
    const half = (x1 - x0) / 2
    const sag = endY - peakY
    this.r = (half * half + sag * sag) / (2 * sag)
    this.cx = (x0 + x1) / 2
    this.cy = peakY + this.r
    this.x0 = x0
    this.x1 = x1
  }

  y(x: number) {
    const dx = x - this.cx
    return this.cy - Math.sqrt(Math.max(0, this.r * this.r - dx * dx))
  }

  /** x for a fraction 0..1 across the arc. */
  at(u: number) {
    const x = lerp(this.x0, this.x1, u)
    return { x, y: this.y(x) }
  }

  angle(x: number) {
    const dx = x - this.cx
    return Math.atan2(dx, Math.sqrt(Math.max(1, this.r * this.r - dx * dx)))
  }

  points(step = 6): Pt[] {
    const out: Pt[] = []
    for (let x = this.x0; x <= this.x1; x += step) out.push({ x, y: this.y(x) })
    out.push({ x: this.x1, y: this.y(this.x1) })
    return out
  }
}

type Module = {
  project: (p: P3) => Pt
  visible: [P3, P3][]
  hidden: [P3, P3][]
  details: [P3, P3][]
  cable: Pt[]
  cableLength: number
  /** Distances along the cable where each fitting sits. */
  fittings: { at: number; kind: "lamp" | "socket" | "switch"; pt: Pt }[]
  roof: Pt
  size: number
}

function buildModule(base: Pt, s: number, w: number, d: number): Module {
  const W = s * w
  const D = s * d
  const H = s
  const raw = (p: P3): Pt => ({
    x: (p[0] - p[1]) * COS30,
    y: -p[2] + (p[0] + p[1]) * SIN30,
  })
  // Anchor the front-bottom corner on the arc so the module stands on it.
  const corner = raw([W, D, 0])
  const centre = raw([W / 2, D / 2, 0])
  const ox = base.x - centre.x
  const oy = base.y - corner.y
  const project = (p: P3): Pt => {
    const r = raw(p)
    return { x: r.x + ox, y: r.y + oy }
  }

  const v = (x: number, y: number, z: number): P3 => [x, y, z]
  const visible: [P3, P3][] = [
    // top face
    [v(0, 0, H), v(W, 0, H)],
    [v(W, 0, H), v(W, D, H)],
    [v(W, D, H), v(0, D, H)],
    [v(0, D, H), v(0, 0, H)],
    // front edges
    [v(0, D, 0), v(W, D, 0)],
    [v(W, D, 0), v(W, 0, 0)],
    [v(0, D, 0), v(0, D, H)],
    [v(W, D, 0), v(W, D, H)],
    [v(W, 0, 0), v(W, 0, H)],
  ]
  const hidden: [P3, P3][] = [
    [v(0, 0, 0), v(W, 0, 0)],
    [v(0, 0, 0), v(0, D, 0)],
    [v(0, 0, 0), v(0, 0, H)],
  ]
  // A window on the long face, a door on the short one.
  const wz0 = H * 0.42
  const wz1 = H * 0.74
  const wx0 = W * 0.52
  const wx1 = W * 0.82
  const dy0 = D * 0.55
  const dy1 = D * 0.85
  const details: [P3, P3][] = [
    [v(wx0, D, wz0), v(wx1, D, wz0)],
    [v(wx1, D, wz0), v(wx1, D, wz1)],
    [v(wx1, D, wz1), v(wx0, D, wz1)],
    [v(wx0, D, wz1), v(wx0, D, wz0)],
    [v(W, dy0, 0), v(W, dy0, H * 0.72)],
    [v(W, dy0, H * 0.72), v(W, dy1, H * 0.72)],
    [v(W, dy1, H * 0.72), v(W, dy1, 0)],
  ]

  // Cable: socket on the long face, up to the ceiling lamp, across to the
  // switch beside the door. Routed along the surfaces, as a cable would be.
  const route: P3[] = [
    v(W * 0.18, D, H * 0.2),
    v(W * 0.18, D, H * 0.92),
    v(W * 0.34, D * 0.5, H),
    v(W * 0.34, D * 0.5, H),
    v(W, D * 0.32, H * 0.92),
    v(W, D * 0.32, H * 0.5),
  ]
  const cable = route.map(project)
  const lengths = [0]
  for (let i = 1; i < cable.length; i++) {
    lengths.push(
      lengths[i - 1] +
        Math.hypot(cable[i].x - cable[i - 1].x, cable[i].y - cable[i - 1].y)
    )
  }
  const cableLength = lengths[lengths.length - 1]

  return {
    project,
    visible,
    hidden,
    details,
    cable,
    cableLength,
    fittings: [
      { at: 0, kind: "socket", pt: cable[0] },
      { at: lengths[2], kind: "lamp", pt: cable[2] },
      { at: cableLength, kind: "switch", pt: cable[cable.length - 1] },
    ],
    roof: project([W * 0.62, D * 0.5, H]),
    size: s,
  }
}

function pointAlong(points: Pt[], distance: number): Pt {
  let left = distance
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const seg = Math.hypot(b.x - a.x, b.y - a.y)
    if (left <= seg || i === points.length - 1) {
      const t = seg === 0 ? 0 : clamp(left / seg, 0, 1)
      return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }
    }
    left -= seg
  }
  return points[points.length - 1]
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
  width: number
) {
  const last = Math.floor(clamp(progress, 0, 1) * c.bucket.length)
  if (last <= 0) return
  ctx.strokeStyle = color
  ctx.lineCap = "round"
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
/* Choreography                                                               */
/* -------------------------------------------------------------------------- */

const INTRO = {
  arc: [0.1, 1.7] as const,
  modules: [0.7, 2.6] as const,
  mascotIn: 2.2,
}

type Bezier = [Pt, Pt, Pt, Pt]
type Ease = (p: number) => number

/** One leg of the flight. Ends at rest, so legs join without a jolt. */
type Flight = { t0: number; t1: number; path: Bezier; ease: Ease; roll: number }
/** Time on a roof, feet down. */
type Rest = { t0: number; t1: number; at: Pt; module: number }

type Plan = {
  flights: Flight[]
  rests: Rest[]
  /** When each module is switched on, relative to the loop start. */
  litAt: number[]
  /** Orbit is out of frame by this time; the scene resets at `length`. */
  exit: number
  length: number
  blinks: number[]
}

/** Where Orbit is at one moment, all of it a pure function of time. */
type Moment = {
  pt: Pt
  /** 1 on a roof, easing to 0 just after lift-off and back before landing. */
  landed: number
  /** The rest it is on, leaving or arriving at. */
  rest: Rest | undefined
  /** Squash (> 0) or stretch (< 0) about the feet. */
  squash: number
  roll: number
  cheer: number
  blink: number
}

const REST = 2.2
const CROUCH = 0.28

/** Smootherstep: speed and acceleration both start and end at zero. */
const glide = (p: number) => {
  const x = clamp(p, 0, 1)
  return x * x * x * (x * (x * 6 - 15) + 10)
}

const smooth = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a), 0, 1)
  return x * x * (3 - 2 * x)
}

function bezier([a, b, c, d]: Bezier, s: number): Pt {
  const u = 1 - s
  const A = u * u * u
  const B = 3 * u * u * s
  const C = 3 * u * s * s
  const D = s * s * s
  return {
    x: A * a.x + B * b.x + C * c.x + D * d.x,
    y: A * a.y + B * b.y + C * c.y + D * d.y,
  }
}

/**
 * Orbit flies: in from the left on a long glide, down onto each roof in turn,
 * across to the next on a high arc (rolling over once on the way) and off to
 * the top right. Every leg starts and ends at rest, so speed — and with it
 * the bank, the trailing hands and the glance — is continuous throughout.
 */
function plan(arc: Arc, modules: Module[], width: number, size: number) {
  const rand = mulberry32(11)
  const ease = {
    in: gsap.parseEase("power2.in"),
    out: gsap.parseEase("power3.out"),
  }
  const roofs = modules.map((m) => m.roof)
  const flights: Flight[] = []
  const rests: Rest[] = []
  const litAt: number[] = []
  let t = 0
  const fly = (
    duration: number,
    path: Bezier,
    { ease: e = glide, roll = 0 }: { ease?: Ease; roll?: number } = {}
  ) => {
    flights.push({ t0: t, t1: t + duration, path, ease: e, roll })
    t += duration
  }
  // Just above a roof: where Orbit lifts to before a swoop and brakes at
  // after one. Kept low, so it never reaches the title above the scene.
  const above = (roof: Pt) => ({ x: roof.x, y: roof.y - size * 0.35 })
  // Swoops dip to skim the arc between the modules.
  const skim = (x: number) => arc.y(x) - size * 0.5
  const dip = (from: Pt, to: Pt) =>
    (skim((from.x + to.x) / 2) - 0.125 * (from.y + to.y)) / 0.75

  // In from the left, low over the arc, up to the first roof.
  const first = above(roofs[0])
  fly(
    2.2,
    [
      { x: -size * 1.6, y: skim(arc.x0) - size * 0.4 },
      { x: width * 0.08, y: skim(width * 0.08) },
      { x: first.x - size * 1.6, y: first.y },
      first,
    ],
    { ease: ease.out }
  )
  fly(0.6, [first, first, roofs[0], roofs[0]])

  roofs.forEach((roof, i) => {
    rests.push({ t0: t, t1: t + REST, at: roof, module: i })
    litAt[i] = t + 0.35
    t += REST
    const from = above(roof)
    fly(0.5, [roof, roof, from, from])

    const next = roofs.at(i + 1)
    if (!next) {
      // Off the far side, down low, and away to the right.
      fly(
        1.7,
        [
          from,
          { x: from.x + (width - from.x) * 0.4, y: skim(from.x) },
          { x: width * 0.98, y: skim(width * 0.98) - size * 0.4 },
          { x: width + size * 2, y: skim(arc.x1) - size * 1.2 },
        ],
        { ease: ease.in }
      )
      return
    }
    const to = above(next)
    const dist = Math.abs(to.x - from.x)
    const low = dip(from, to)
    fly(
      1.3 + (dist / width) * 1.1,
      [
        from,
        { x: from.x + dist * 0.3, y: low },
        { x: to.x - dist * 0.3, y: low },
        to,
      ],
      // Rolls over once, in the second swoop.
      { roll: i === 1 ? Math.PI * 2 : 0 }
    )
    fly(0.6, [to, to, next, next])
  })
  const exit = t
  const length = exit + 1.6

  // Blinks at uneven intervals, sometimes twice.
  const blinks: number[] = []
  for (let b = 1.6 + rand() * 1.5; b < exit; b += 2.4 + rand() * 2.8) {
    blinks.push(b)
    if (rand() < 0.2) blinks.push(b + 0.22)
  }

  return { flights, rests, litAt, exit, length, blinks } satisfies Plan
}

function position(p: Plan, t: number): Pt {
  for (const r of p.rests) if (t >= r.t0 && t < r.t1) return r.at
  for (const f of p.flights) {
    if (t >= f.t0 && t < f.t1)
      return bezier(f.path, f.ease((t - f.t0) / (f.t1 - f.t0)))
  }
  return t < 0 ? p.flights[0].path[0] : p.flights[p.flights.length - 1].path[3]
}

function moment(p: Plan, t: number): Moment {
  let landed = 0
  let rest: Rest | undefined
  let squash = 0
  for (const r of p.rests) {
    const w =
      t < r.t0
        ? smooth(r.t0 - 0.45, r.t0, t)
        : t < r.t1
          ? 1
          : 1 - smooth(r.t1, r.t1 + 0.45, t)
    if (w > landed) {
      landed = w
      rest = r
    }
    // A soft give on touchdown, a small dip before lift-off, and a stretch
    // as it lets go.
    const land = (t - r.t0) / 0.55
    if (land >= 0 && land < 1)
      squash += 0.08 * Math.sin(Math.PI * land) ** 2 * (1 - land)
    squash += 0.05 * smooth(r.t1 - CROUCH, r.t1, t) * (t < r.t1 ? 1 : 0)
    const go = (t - r.t1) / 0.45
    if (go >= 0 && go < 1)
      squash += 0.05 * Math.cos(Math.PI * go) * (1 - go) ** 2
  }

  let roll = 0
  for (const f of p.flights) {
    if (!f.roll || t < f.t0 || t >= f.t1) continue
    const u = (t - f.t0) / (f.t1 - f.t0)
    roll = f.roll * glide((u - 0.15) / 0.7)
  }

  // Hands up for a moment when the lamp below comes on.
  let cheer = 0
  for (const at of p.litAt) {
    const u = (t - at - 0.3) / 0.8
    if (u >= 0 && u < 1) cheer = Math.sin(Math.PI * u) ** 2
  }

  let blink = 0
  for (const b of p.blinks) {
    const u = t - b
    if (u < 0 || u > 0.18) continue
    blink = u < 0.07 ? (u / 0.07) ** 2 : 1 - smooth(0.07, 0.18, u)
  }

  return { pt: position(p, t), landed, rest, squash, roll, cheer, blink }
}

/* -------------------------------------------------------------------------- */
/* Runtime                                                                    */
/* -------------------------------------------------------------------------- */

type Colors = { ink: string; accent: string; faint: string; bg: string }

function readColors(el: Element): Colors {
  const s = getComputedStyle(el)
  const v = (name: string, fallback: string) =>
    s.getPropertyValue(name).trim() || fallback
  return {
    ink: v("--foreground", "#141413"),
    accent: v("--persimmon", "#e85d3c"),
    faint: v("--faint", "#87867f"),
    bg: v("--surface", "#f0eee6"),
  }
}

function runScene(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  mascot: HTMLDivElement
) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
  const dark = window.matchMedia("(prefers-color-scheme: dark)")
  const face = mascot.querySelector("[data-part=face]")
  const eyes = mascot.querySelector("[data-part=eyes]")
  const hands = [...mascot.querySelectorAll("[data-part=hand]")]
  const feet = mascot.querySelector("[data-part=feet]")

  let colors = readColors(canvas)
  let width = 0
  let height = 0
  let dpr = 1
  let arc: Arc
  let arcChalk: Chalk
  let modules: Module[] = []
  let moduleChalk: { visible: Chalk[]; details: Chalk[] }[] = []
  let choreography: Plan | undefined
  let mascotSize = 40
  let cache: HTMLCanvasElement | null = null

  let elapsed = 0
  let last = 0
  let frame = 0
  let visible = false
  // Eyes follow the pointer with a little lag, not locked to it.
  const gaze = { x: 0 }
  const gazeTo = gsap.quickTo(gaze, "x", { duration: 0.6, ease: "power3.out" })
  // Followed, not set: the glance eases toward where it's going, and the
  // hands and feet hang back on a spring and swing on when Orbit stops.
  const look = { x: 0, y: 0 }
  const trail = { x: 0, y: 0, vx: 0, vy: 0 }

  function layout() {
    const rect = canvas.getBoundingClientRect()
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)

    const narrow = width < 640
    arc = new Arc(
      width * 0.03,
      width * 0.97,
      height * (narrow ? 0.7 : 0.77),
      height * (narrow ? 0.55 : 0.6)
    )
    const rand = mulberry32(7)
    arcChalk = chalk(arc.points(5), rand, 0.6)

    const s = clamp(width * 0.072, 34, 86)
    const placements = narrow
      ? [
          { u: 0.24, w: 1.15, d: 0.75 },
          { u: 0.5, w: 1.3, d: 0.8 },
          { u: 0.76, w: 1.15, d: 0.75 },
        ]
      : [
          { u: 0.25, w: 1.5, d: 0.85 },
          { u: 0.5, w: 1.7, d: 0.9 },
          { u: 0.75, w: 1.5, d: 0.85 },
        ]
    modules = placements.map((p) =>
      buildModule(arc.at(p.u), s * (p.u === 0.5 ? 1.08 : 1), p.w, p.d)
    )
    moduleChalk = modules.map((m) => ({
      visible: m.visible.map(([a, b]) =>
        chalk([m.project(a), m.project(b)], rand, 0.35)
      ),
      details: m.details.map(([a, b]) =>
        chalk([m.project(a), m.project(b)], rand, 0.3)
      ),
    }))
    mascotSize = s * 0.85
    choreography = plan(arc, modules, width, mascotSize)
    cache = null
  }

  function introProgress(t: number, [a, b]: readonly [number, number]) {
    return easeInOut((t - a) / (b - a))
  }

  /** Grid, arc and module outlines. Static once the intro is over. */
  function drawStatic(target: CanvasRenderingContext2D, t: number) {
    // Dot grid, fading toward the edges like a viewport's ground plane.
    const gap = width < 640 ? 18 : 22
    target.fillStyle = colors.ink
    const cx = width / 2
    const cy = height * 0.55
    const reach = Math.max(width, height) * 0.62
    const gridIn = clamp(t / 1.2, 0, 1)
    for (let y = gap / 2; y < height; y += gap) {
      for (let x = gap / 2; x < width; x += gap) {
        const fall = 1 - Math.hypot(x - cx, (y - cy) * 1.4) / reach
        if (fall <= 0) continue
        target.globalAlpha = 0.085 * fall * gridIn
        target.fillRect(x - 0.6, y - 0.6, 1.2, 1.2)
      }
    }
    target.globalAlpha = 1

    drawChalk(target, arcChalk, introProgress(t, INTRO.arc), colors.ink, 1.6)

    modules.forEach((m, i) => {
      const begin = INTRO.modules[0] + i * 0.25
      const p = introProgress(t, [begin, begin + 1.2])
      if (p <= 0) return
      // Hidden edges, dashed — the way a viewport shows what's behind.
      target.save()
      target.globalAlpha = 0.35 * p
      target.strokeStyle = colors.faint
      target.lineWidth = 1
      target.setLineDash([3, 4])
      target.beginPath()
      for (const [a, b] of m.hidden) {
        const pa = m.project(a)
        const pb = m.project(b)
        target.moveTo(pa.x, pa.y)
        target.lineTo(lerp(pa.x, pb.x, p), lerp(pa.y, pb.y, p))
      }
      target.stroke()
      target.restore()
      for (const c of moduleChalk[i].visible)
        drawChalk(target, c, p, colors.ink, 1.25)
      const dp = introProgress(t, [begin + 0.6, begin + 1.5])
      for (const c of moduleChalk[i].details)
        drawChalk(target, c, dp, colors.faint, 1)
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

  function drawCircuit(m: Module, since: number, fade: number) {
    if (since <= 0 || fade <= 0) return
    const drawn = m.cableLength * easeOut(since / 0.9)

    ctx.save()
    ctx.globalAlpha = fade
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 1.6
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.beginPath()
    ctx.moveTo(m.cable[0].x, m.cable[0].y)
    let left = drawn
    for (let i = 1; i < m.cable.length && left > 0; i++) {
      const a = m.cable[i - 1]
      const b = m.cable[i]
      const seg = Math.hypot(b.x - a.x, b.y - a.y)
      const tt = seg === 0 ? 1 : Math.min(1, left / seg)
      ctx.lineTo(lerp(a.x, b.x, tt), lerp(a.y, b.y, tt))
      left -= seg
    }
    ctx.stroke()

    const r = m.size * 0.055
    for (const f of m.fittings) {
      const on = clamp((drawn - f.at) / 12 + 1, 0, 1)
      if (on <= 0) continue
      const { x, y } = f.pt
      if (f.kind === "lamp") {
        const breathe = 0.85 + 0.15 * Math.sin((since - 0.6) * 2.4)
        const glow = ctx.createRadialGradient(x, y, 0, x, y, m.size * 0.55)
        glow.addColorStop(0, colors.accent)
        glow.addColorStop(1, "transparent")
        ctx.globalAlpha = fade * on * 0.32 * breathe
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, m.size * 0.55, 0, Math.PI * 2)
        ctx.fill()
        // The lamp symbol from an electrical drawing: a crossed circle.
        ctx.globalAlpha = fade * on
        ctx.fillStyle = colors.bg
        ctx.beginPath()
        ctx.arc(x, y, r * 1.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        const k = r * 1.6 * Math.SQRT1_2
        ctx.beginPath()
        ctx.moveTo(x - k, y - k)
        ctx.lineTo(x + k, y + k)
        ctx.moveTo(x + k, y - k)
        ctx.lineTo(x - k, y + k)
        ctx.stroke()
      } else if (f.kind === "socket") {
        ctx.globalAlpha = fade * on
        ctx.fillStyle = colors.accent
        ctx.beginPath()
        ctx.arc(x, y, r * 1.2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.globalAlpha = fade * on
        ctx.fillStyle = colors.accent
        ctx.fillRect(x - r, y - r * 1.4, r * 2, r * 2.8)
      }
    }

    // Current, once the run is complete.
    if (drawn >= m.cableLength) {
      const period = 1.5
      for (const offset of [0, 0.5]) {
        const phase = ((since - 0.9) / period + offset) % 1
        const p = pointAlong(m.cable, phase * m.cableLength)
        ctx.globalAlpha = fade * Math.sin(phase * Math.PI)
        ctx.fillStyle = colors.accent
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.restore()
  }

  /** The dashed line a flight leaves behind it, fading once it's flown. */
  function drawTrail(p: Plan, t: number) {
    const lift = (mascotSize / 80) * 48
    ctx.save()
    ctx.strokeStyle = colors.faint
    ctx.lineWidth = 1.2
    ctx.lineCap = "round"
    ctx.setLineDash([1.5, 6])
    for (const f of p.flights) {
      const fade = 1 - (t - f.t1) / 1.1
      if (t < f.t0 || fade <= 0) continue
      const reach = f.ease(clamp((t - f.t0) / (f.t1 - f.t0), 0, 1))
      ctx.globalAlpha = 0.7 * Math.min(1, fade)
      ctx.beginPath()
      for (let i = 0; i <= 48; i++) {
        const { x, y } = bezier(f.path, (reach * i) / 48)
        if (i === 0) ctx.moveTo(x, y - lift)
        else ctx.lineTo(x, y - lift)
      }
      ctx.stroke()
    }
    ctx.restore()
  }

  function drawMascot(p: Plan | undefined, t: number, dt: number) {
    const now = p ? moment(p, t) : undefined
    const at = now?.pt ?? modules[1].roof
    const landed = now?.landed ?? 1
    const alpha = p && (t < 0 || t >= p.exit) ? 0 : 1
    mascot.style.opacity = String(alpha)
    if (!alpha) return

    // Velocity, from the path itself rather than from frame to frame.
    const h = 1 / 240
    const before = p ? position(p, t - h) : at
    const vx = (at.x - before.x) / h
    const vy = (at.y - before.y) / h
    const speed = mascotSize * 5
    const k = mascotSize / 80

    // Shadow on whatever is underneath — a roof, else the arc — fading as
    // Orbit rises, so it never slides up a wall.
    const roof = modules.find(
      (m) => Math.abs(m.roof.x - at.x) < mascotSize && at.y <= m.roof.y + 1
    )
    const ground = roof ? roof.roof.y : arc.y(at.x)
    const air = clamp((ground - at.y) / (mascotSize * 0.6), 0, 1)
    if (air < 1) {
      ctx.save()
      ctx.globalAlpha = 0.12 * (1 - air)
      ctx.fillStyle = colors.ink
      ctx.beginPath()
      ctx.ellipse(
        at.x,
        ground + 2 * k,
        24 * k * (1 - air * 0.45),
        3.2 * k,
        0,
        0,
        Math.PI * 2
      )
      ctx.fill()
      ctx.restore()
    }

    // Banks into the direction of travel; the roll rides on top.
    const angle = 0.3 * Math.tanh(vx / speed) + (now?.roll ?? 0)
    const squash = now?.squash ?? 0
    const sx = k * (1 + squash * 0.6)
    const sy = k * (1 - squash)
    // Scaled about the feet, turned about the middle of the body, 54 units up.
    mascot.style.transform =
      `translate3d(${at.x}px, ${at.y}px, 0) scale(${sx}, ${sy}) ` +
      `translate(0, -54px) rotate(${angle}rad) translate(0, 54px) ` +
      `translate(${-ORBIT_FEET.x}px, ${-ORBIT_FEET.y}px)`

    // In the air it looks where it's going; on a roof, down at the lamp
    // until it's lit, then on to the next roof (or at the pointer).
    const rest = now?.rest
    let restX = gaze.x
    let restY = 0
    if (rest) {
      const lamp = modules[rest.module].fittings[1].pt
      const next = modules.at(rest.module + 1)?.roof
      const watching = t - rest.t0 < 1.4
      restX = watching
        ? clamp((lamp.x - at.x) / (mascotSize * 0.3), -1.6, 1.6)
        : next
          ? 1.2
          : gaze.x
      restY = watching ? 1.3 : 0
    }
    const goal = {
      x: lerp(1.7 * Math.tanh(vx / speed), restX, landed),
      y: lerp(1.2 * Math.tanh(vy / speed), restY, landed),
    }
    const follow = dt ? 1 - Math.exp(-dt * 9) : 1
    look.x += (goal.x - look.x) * follow
    look.y += (goal.y - look.y) * follow
    face?.setAttribute(
      "transform",
      `translate(${look.x * 1.6} ${look.y * 1.6})`
    )
    const lid = 1 - (now?.blink ?? 0) * 0.88
    eyes?.setAttribute(
      "transform",
      `translate(0 ${ORBIT_EYE_Y * (1 - lid)}) scale(1 ${lid})`
    )

    // Hands and feet float free, so they lag in flight and swing past on
    // the stop: a slightly underdamped spring, stepped at a fixed rate.
    const pull = {
      x: -5 * Math.tanh(vx / speed),
      y: -4 * Math.tanh(vy / speed),
    }
    for (let left = dt; left > 0; left -= 1 / 240) {
      const step = Math.min(left, 1 / 240)
      trail.vx += (110 * (pull.x - trail.x) - 12 * trail.vx) * step
      trail.vy += (110 * (pull.y - trail.y) - 12 * trail.vy) * step
      trail.x += trail.vx * step
      trail.y += trail.vy * step
    }
    const cheer = now?.cheer ?? 0
    hands.forEach((hand, i) => {
      const side = i ? 1 : -1
      const drift = Math.sin(t * 1.9 + i * 1.7) * 0.9 * landed
      hand.setAttribute(
        "transform",
        `translate(${trail.x + side * 2 * cheer} ${trail.y + drift - 7 * cheer})`
      )
    })
    feet?.setAttribute(
      "transform",
      `translate(${trail.x * 0.6 * (1 - landed)} ${trail.y * 0.6 * (1 - landed)})`
    )
  }

  function render(total: number, still: boolean, dt = 0) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const introDone = still || total > INTRO.modules[1] + 1
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

    if (still || !choreography) {
      modules.forEach((m) => drawCircuit(m, 3, 1))
      drawMascot(undefined, 0, 0)
      return
    }

    const loopT = total - INTRO.mascotIn
    if (loopT < 0) {
      mascot.style.opacity = "0"
      return
    }
    const { litAt, exit, length } = choreography
    const t = loopT % length
    const fadeOut = t > exit + 0.2 ? clamp(1 - (t - exit - 0.2) / 0.9, 0, 1) : 1
    modules.forEach((m, i) => drawCircuit(m, t - litAt[i], fadeOut))
    drawTrail(choreography, t)
    drawMascot(choreography, t, dt)
  }

  function tick(now: number) {
    const delta = last ? Math.min(0.05, (now - last) / 1000) : 0
    last = now
    elapsed += delta
    render(elapsed, false, delta)
    frame = requestAnimationFrame(tick)
  }

  function start() {
    if (frame || reduce.matches) return
    last = 0
    frame = requestAnimationFrame(tick)
  }

  function stop() {
    cancelAnimationFrame(frame)
    frame = 0
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
    if (reduce.matches || !frame)
      render(reduce.matches ? 99 : elapsed, reduce.matches)
  }

  function onTheme() {
    colors = readColors(canvas)
    cache = null
    if (!frame) render(reduce.matches ? 99 : elapsed, reduce.matches)
  }

  function onPointer(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    const inside = event.clientY >= rect.top && event.clientY <= rect.bottom
    const x = (event.clientX - rect.left) / rect.width
    gazeTo(inside ? clamp((x - 0.5) * 4, -1.6, 1.6) : 0)
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
  window.addEventListener("pointermove", onPointer, { passive: true })
  sync()

  return () => {
    stop()
    gsap.killTweensOf(gaze)
    resizer.disconnect()
    observer.disconnect()
    document.removeEventListener("visibilitychange", sync)
    reduce.removeEventListener("change", sync)
    dark.removeEventListener("change", onTheme)
    window.removeEventListener("pointermove", onPointer)
  }
}
