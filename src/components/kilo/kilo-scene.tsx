import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import {
  kiloBodyPath,
  kiloEyeHeight,
  kiloEyeWidth,
  kiloEyeY,
  kiloEyes,
  kiloFoot,
} from "./artwork"

/**
 * The Kilo announcement scene, drawn on a canvas.
 *
 * A chalk arc carries three building modules drawn the way a CAD viewport
 * draws them: isometric, with hidden edges dashed. Kilo's mascot hops along
 * the arc and onto each roof, and that module wires itself up — the cable
 * draws in, current pulses along it, the ceiling lamp comes on.
 *
 * Decorative: the card around it carries the real heading and link.
 *
 * Costs: the arc, grid and modules are drawn once into a cached layer after
 * the intro; each frame after that only draws cables, glows and the mascot.
 * The loop stops while the canvas is offscreen or the tab is hidden, and with
 * reduced motion the finished scene is drawn once and never animated.
 */
export function KiloScene({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    return runScene(canvas, ctx)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 size-full",
        className
      )}
    />
  )
}

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
  mascotIn: 2.4,
}

type Stop = { pt: Pt; module?: number; angle: number }
type Hop = {
  from: Stop
  to: Stop
  start: number
  end: number
  height: number
}

type Plan = {
  hops: Hop[]
  /** When each module is switched on, relative to the loop start. */
  litAt: number[]
  /** Mascot leaves at this time, the scene resets at `length`. */
  exit: number
  length: number
}

function plan(arc: Arc, modules: Module[], scale: number): Plan {
  const ground = (u: number): Stop => {
    const p = arc.at(u)
    return { pt: p, angle: arc.angle(p.x) }
  }
  const stops: Stop[] = [ground(0.05)]
  modules.forEach((m, i) => {
    if (i === 0) stops.push(ground(0.11), ground(0.17))
    stops.push({ pt: m.roof, module: i, angle: 0 })
    // Two hops on the ground after each roof, then on to the next module.
    const u = (m.roof.x - arc.x0) / (arc.x1 - arc.x0)
    const gap = [u + 0.085, u + 0.15]
    for (const g of gap) stops.push(ground(Math.min(g, 0.95)))
  })

  const hops: Hop[] = []
  const litAt: number[] = []
  let t = 0
  for (let i = 1; i < stops.length; i++) {
    const from = stops[i - 1]
    const to = stops[i]
    const dist = Math.hypot(to.pt.x - from.pt.x, to.pt.y - from.pt.y)
    const rise = Math.max(0, from.pt.y - to.pt.y)
    const duration = 0.36 + dist / (900 * scale) + rise / (700 * scale)
    const height = 10 * scale + rise * 0.55 + dist * 0.12
    hops.push({ from, to, start: t, end: t + duration, height })
    t += duration
    if (to.module !== undefined) {
      litAt[to.module] = t
      t += 1.25 // stays a moment to watch the lights come on
    } else {
      t += 0.1
    }
  }
  const exit = t + 0.15
  return { hops, litAt, exit, length: exit + 1.9 }
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
    accent: v("--clay", "#d97757"),
    faint: v("--faint", "#87867f"),
    bg: v("--surface", "#f0eee6"),
  }
}

function runScene(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
  const dark = window.matchMedia("(prefers-color-scheme: dark)")
  const body = new Path2D(kiloBodyPath)

  let colors = readColors(canvas)
  let width = 0
  let height = 0
  let dpr = 1
  let arc: Arc
  let arcChalk: Chalk
  let modules: Module[] = []
  let moduleChalk: { visible: Chalk[]; details: Chalk[] }[] = []
  let choreography: Plan
  let mascotSize = 40
  let cache: HTMLCanvasElement | null = null

  let elapsed = 0
  let last = 0
  let frame = 0
  let visible = false
  const pointer = { x: 0.5, active: false }

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
    choreography = plan(arc, modules, clamp(width / 1200, 0.45, 1.2))
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

  function drawMascot(
    foot: Pt,
    angle: number,
    sx: number,
    sy: number,
    alpha: number,
    blink: number
  ) {
    if (alpha <= 0) return
    const k = mascotSize / 64
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(foot.x, foot.y)
    ctx.rotate(angle)
    ctx.scale(k * sx, k * sy)
    ctx.translate(-kiloFoot.x, -kiloFoot.y)
    // Soft shadow under the feet.
    ctx.save()
    ctx.globalAlpha = alpha * 0.12
    ctx.fillStyle = colors.ink
    ctx.beginPath()
    ctx.ellipse(32, 56, 20, 2.6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    ctx.fillStyle = colors.accent
    ctx.fill(body)
    // Eyes glance toward the pointer.
    const look = pointer.active ? clamp((pointer.x - 0.5) * 4, -1.6, 1.6) : 0
    ctx.fillStyle = "#141413"
    const eh = kiloEyeHeight * (1 - blink * 0.85)
    for (const ex of kiloEyes) {
      ctx.beginPath()
      ctx.roundRect(
        ex + look,
        kiloEyeY + (kiloEyeHeight - eh) / 2,
        kiloEyeWidth,
        eh,
        kiloEyeWidth / 2
      )
      ctx.fill()
    }
    ctx.restore()
  }

  function mascotAt(t: number) {
    const { hops, exit } = choreography
    const first = hops[0]
    // Fade in at the start, out at the exit.
    const alpha =
      t < exit ? clamp(t / 0.35, 0, 1) : clamp(1 - (t - exit) / 0.35, 0, 1)

    let pose = {
      foot: first.from.pt,
      angle: first.from.angle,
      sx: 1,
      sy: 1,
    }
    for (const h of hops) {
      if (t < h.start) {
        // Resting at `h.from`; a crouch just before take-off.
        const crouch = clamp(1 - (h.start - t) / 0.09, 0, 1)
        pose = {
          foot: h.from.pt,
          angle: h.from.angle,
          sx: 1 + 0.08 * crouch,
          sy: 1 - 0.1 * crouch,
        }
        break
      }
      if (t <= h.end) {
        const p = (t - h.start) / (h.end - h.start)
        const e = easeInOut(p)
        pose = {
          foot: {
            x: lerp(h.from.pt.x, h.to.pt.x, e),
            y: lerp(h.from.pt.y, h.to.pt.y, e) - h.height * 4 * p * (1 - p),
          },
          angle:
            lerp(h.from.angle, h.to.angle, e) + Math.sin(p * Math.PI) * 0.12,
          sx: 1 - 0.05 * Math.sin(p * Math.PI),
          sy: 1 + 0.07 * Math.sin(p * Math.PI),
        }
        break
      }
      // Landed: a short squash, then settle.
      const since = t - h.end
      const squash = since < 0.22 ? Math.sin((since / 0.22) * Math.PI) : 0
      pose = {
        foot: h.to.pt,
        angle: h.to.angle,
        sx: 1 + 0.12 * squash,
        sy: 1 - 0.14 * squash,
      }
    }
    const blinkPhase = t % 3.1
    const blink =
      blinkPhase > 2.95 ? Math.sin(((blinkPhase - 2.95) / 0.15) * Math.PI) : 0
    return { ...pose, alpha, blink }
  }

  function render(total: number, still: boolean) {
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

    if (still) {
      modules.forEach((m) => drawCircuit(m, 3, 1))
      const centre = modules[1]
      drawMascot(centre.roof, 0, 1, 1, 1, 0)
      return
    }

    const loopT = total - INTRO.mascotIn
    if (loopT < 0) return
    const t = loopT % choreography.length
    const fadeOut =
      t > choreography.exit + 0.6
        ? clamp(1 - (t - choreography.exit - 0.6) / 0.9, 0, 1)
        : 1
    modules.forEach((m, i) =>
      drawCircuit(m, t - choreography.litAt[i], fadeOut)
    )
    const pose = mascotAt(t)
    drawMascot(pose.foot, pose.angle, pose.sx, pose.sy, pose.alpha, pose.blink)
  }

  function tick(now: number) {
    const delta = last ? Math.min(0.05, (now - last) / 1000) : 0
    last = now
    elapsed += delta
    render(elapsed, false)
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
    pointer.x = (event.clientX - rect.left) / rect.width
    pointer.active = event.clientY >= rect.top && event.clientY <= rect.bottom
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
    resizer.disconnect()
    observer.disconnect()
    document.removeEventListener("visibilitychange", sync)
    reduce.removeEventListener("change", sync)
    dark.removeEventListener("change", onTheme)
    window.removeEventListener("pointermove", onPointer)
  }
}
