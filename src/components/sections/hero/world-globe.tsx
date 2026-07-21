import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useReducedMotion } from "framer-motion"
import { feature } from "topojson-client"
import type { FeatureCollection, Geometry, MultiLineString } from "geojson"
import {
  geoDistance,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
} from "d3-geo"

import { cn } from "@/lib/utils"
import { home, projectPath, reachingProjects } from "@/core/config/projects"

type Topology = { objects: { countries: Geometry } }

// A point we render on the globe. `home` is where the work is made; the rest
// are projects that have left here. See `Reach` in the projects config.
type Node = {
  id: string
  name: string
  detail: string
  lon: number
  lat: number
  // Kept as the router's literal path union so `Link` stays type-safe.
  href?: ReturnType<typeof projectPath>
  isHome: boolean
}

// Great-circle samples between two points, as a GeoJSON LineString. The
// projection's `clipAngle(90)` takes care of hiding the far half for us.
const ARC_SAMPLES = 48
function arcLine(a: [number, number], b: [number, number]) {
  const interpolate = geoInterpolate(a, b)
  const coordinates: [number, number][] = []
  for (let i = 0; i <= ARC_SAMPLES; i++) {
    coordinates.push(interpolate(i / ARC_SAMPLES))
  }
  return { type: "LineString" as const, coordinates }
}

// Everything that animates lives in a ref — no frame of this causes a React
// render. The rAF loop writes straight to the DOM.
type GlobeState = {
  // Rotation, in DEGREES (what d3's `.rotate()` actually wants).
  lon: number
  lat: number
  // Drag momentum, degrees per second.
  vLon: number
  vLat: number
  size: number
  radius: number
  dragging: boolean
  pointerId: number | null
  lastX: number
  lastY: number
  // How far this gesture has travelled, so a drag doesn't fire a link click.
  travel: number
  running: boolean
}

// Idle spin, degrees per second. Slow enough to read as drift, fast enough
// that you can see it move.
const IDLE_SPIN = 3.2

export function WorldGlobe({ className }: { className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const diskRef = useRef<SVGCircleElement>(null)
  const rimRef = useRef<SVGCircleElement>(null)
  const landRef = useRef<SVGPathElement>(null)
  const graticuleRef = useRef<SVGPathElement>(null)
  const arcsRef = useRef<SVGGElement>(null)
  const markersRef = useRef<HTMLDivElement>(null)

  const reduceMotion = useReducedMotion()
  const reduceMotionRef = useRef(false)
  reduceMotionRef.current = !!reduceMotion

  const nodes = useMemo<Node[]>(() => {
    const projects = reachingProjects()
    return [
      {
        id: "home",
        name: home.place,
        detail: home.label,
        lon: home.lon,
        lat: home.lat,
        isHome: true,
      },
      ...projects.map((p) => ({
        id: p.slug,
        name: p.name,
        detail: p.reach.label,
        lon: p.reach.lon,
        lat: p.reach.lat,
        href: projectPath(p.slug),
        isHome: false,
      })),
    ]
  }, [])

  // Great-circle geometry from home out to each project. Fixed input, so it's
  // built once and only re-projected per frame.
  const arcs = useMemo(
    () =>
      nodes
        .filter((n) => !n.isHome)
        .map((n) => arcLine([home.lon, home.lat], [n.lon, n.lat])),
    [nodes]
  )

  const stateRef = useRef<GlobeState>({
    lon: -10,
    lat: 22,
    vLon: 0,
    vLat: 0,
    size: 640,
    radius: 262,
    dragging: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    travel: 0,
    running: true,
  })

  const [land, setLand] = useState<{
    collection: FeatureCollection<Geometry, { name: string }>
    graticule: MultiLineString
  } | null>(null)

  // ---- Data load
  useEffect(() => {
    let cancelled = false
    fetch("/data/countries-110m.json")
      .then((r) => r.json())
      .then((topo: Topology) => {
        if (cancelled) return
        const collection = feature(
          topo as never,
          topo.objects.countries as never
        ) as unknown as FeatureCollection<Geometry, { name: string }>
        setLand({ collection, graticule: geoGraticule10() })
      })
      .catch(() => {
        // A globe is decoration. If the topology can't be fetched the hero
        // keeps its spacing and simply has nothing in it.
      })
    return () => {
      cancelled = true
    }
  }, [])

  // ---- Size. The viewBox tracks the wrapper's width 1:1, so projected
  // coordinates are CSS pixels and the marker layer can use them as-is.
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const updateSize = (w: number) => {
      const size = Math.max(280, w)
      const s = stateRef.current
      s.size = size
      // Leave room for the halo and the marker labels.
      s.radius = (size / 2) * 0.82
      svgRef.current?.setAttribute("viewBox", `0 0 ${size} ${size}`)
    }

    updateSize(wrapper.getBoundingClientRect().width || 640)
    const ro = new ResizeObserver((entries) => {
      updateSize(entries[0]?.contentRect.width ?? 640)
    })
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [land])

  // ---- Drag. Capture on the wrapper (not on whatever child the pointer
  // happened to land on) so the gesture survives crossing element boundaries.
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const s = stateRef.current

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return
      s.dragging = true
      s.pointerId = e.pointerId
      s.lastX = e.clientX
      s.lastY = e.clientY
      s.travel = 0
      s.vLon = 0
      s.vLat = 0
      wrapper.setPointerCapture(e.pointerId)
      wrapper.style.cursor = "grabbing"
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!s.dragging || e.pointerId !== s.pointerId) return
      const dx = e.clientX - s.lastX
      const dy = e.clientY - s.lastY
      s.lastX = e.clientX
      s.lastY = e.clientY
      s.travel += Math.abs(dx) + Math.abs(dy)

      // Degrees per pixel: dragging the full diameter turns the globe ~180°,
      // so the point under the cursor stays roughly under the cursor.
      const perPixel = 180 / (s.radius * 2)
      s.lon += dx * perPixel
      s.lat = Math.max(-72, Math.min(72, s.lat - dy * perPixel))

      // Momentum for the release, in degrees per second.
      s.vLon = dx * perPixel * 60
      s.vLat = -dy * perPixel * 60
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!s.dragging || e.pointerId !== s.pointerId) return
      s.dragging = false
      s.pointerId = null
      if (wrapper.hasPointerCapture(e.pointerId)) {
        wrapper.releasePointerCapture(e.pointerId)
      }
      wrapper.style.cursor = "grab"
    }

    // A drag that ends on a marker must not navigate.
    const onClickCapture = (e: MouseEvent) => {
      if (s.travel > 6) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    wrapper.addEventListener("pointerdown", onPointerDown)
    wrapper.addEventListener("pointermove", onPointerMove)
    wrapper.addEventListener("pointerup", onPointerUp)
    wrapper.addEventListener("pointercancel", onPointerUp)
    wrapper.addEventListener("click", onClickCapture, true)
    return () => {
      wrapper.removeEventListener("pointerdown", onPointerDown)
      wrapper.removeEventListener("pointermove", onPointerMove)
      wrapper.removeEventListener("pointerup", onPointerUp)
      wrapper.removeEventListener("pointercancel", onPointerUp)
      wrapper.removeEventListener("click", onClickCapture, true)
    }
  }, [land])

  // ---- The frame loop. One source of truth: integrate rotation, project
  // once, write attributes.
  useEffect(() => {
    if (!land) return
    const wrapper = wrapperRef.current
    if (!wrapper) return
    let raf = 0
    let lastT = performance.now()
    let sinceVisibilityCheck = 0
    const s = stateRef.current
    const markerEls = () =>
      Array.from(markersRef.current?.children ?? []) as HTMLElement[]
    const arcEls = () =>
      Array.from(arcsRef.current?.children ?? []) as SVGGElement[]

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const now = performance.now()
      const dt = Math.min(0.05, (now - lastT) / 1000)
      lastT = now

      // A hero animation shouldn't run while nobody is looking at it. This is
      // derived every few frames rather than cached from an IntersectionObserver
      // — an observer that misses a delivery leaves the globe frozen for good,
      // and one rect read every ~15 frames is cheaper than that bug.
      if (--sinceVisibilityCheck <= 0) {
        sinceVisibilityCheck = 15
        const rect = wrapper.getBoundingClientRect()
        s.running =
          !document.hidden &&
          rect.bottom > 0 &&
          rect.top < (window.innerHeight || 0)
      }
      if (!s.running) return

      const still = reduceMotionRef.current

      if (!s.dragging) {
        // Momentum from the last drag, decaying into the idle drift.
        const decay = Math.pow(0.12, dt)
        s.vLon *= decay
        s.vLat *= decay
        const idle = still ? 0 : IDLE_SPIN
        s.lon += (s.vLon + idle) * dt
        s.lat += s.vLat * dt
        // Ease the tilt back to its resting angle rather than letting a flick
        // strand the globe on a pole.
        s.lat += (22 - s.lat) * Math.min(1, dt * 0.6)
      }
      s.lon = ((s.lon + 180) % 360) - 180

      const size = s.size
      const c = size / 2
      const r = s.radius
      const projection = geoOrthographic()
        .scale(r)
        .translate([c, c])
        .rotate([-s.lon, -s.lat])
        .clipAngle(90)
      const path = geoPath(projection)
      const center: [number, number] = [s.lon, s.lat]

      // Land is one path, not one per country: a single `d` write per frame
      // instead of ~180, and nothing to restart a CSS transition on.
      landRef.current?.setAttribute("d", path(land.collection) ?? "")
      graticuleRef.current?.setAttribute("d", path(land.graticule) ?? "")

      for (const el of [diskRef.current, rimRef.current]) {
        el?.setAttribute("cx", String(c))
        el?.setAttribute("cy", String(c))
        el?.setAttribute("r", String(r))
      }

      // Arcs, plus one travelling dot each — the work leaving here.
      const groups = arcEls()
      for (let i = 0; i < Math.min(arcs.length, groups.length); i++) {
        const group = groups[i]
        const line = group.children[0] as SVGPathElement
        const dot = group.children[1] as SVGCircleElement
        line.setAttribute("d", path(arcs[i]) ?? "")

        if (still) {
          dot.style.opacity = "0"
          continue
        }
        // Stagger the pulses so they don't leave in lockstep.
        const t = (((now / 5200 + i * 0.34) % 1) + 1) % 1
        const point = arcs[i].coordinates[Math.round(t * ARC_SAMPLES)]
        const xy = projection(point)
        if (!xy || geoDistance(point, center) > Math.PI / 2) {
          dot.style.opacity = "0"
        } else {
          dot.setAttribute("cx", String(xy[0]))
          dot.setAttribute("cy", String(xy[1]))
          // Fade in and out at the ends so the loop doesn't snap.
          dot.style.opacity = String(Math.sin(t * Math.PI) * 0.9)
        }
      }

      // Markers are real HTML links laid over the sphere, so hover, focus and
      // click are the browser's job rather than hit-testing ours.
      const els = markerEls()
      for (let i = 0; i < Math.min(nodes.length, els.length); i++) {
        const el = els[i]
        const n = nodes[i]
        const point: [number, number] = [n.lon, n.lat]
        const xy = projection(point)
        const facing = geoDistance(point, center) < Math.PI / 2
        if (!xy || !facing) {
          el.style.opacity = "0"
          el.style.pointerEvents = "none"
          continue
        }
        // Fade out near the limb so nodes dissolve at the horizon instead of
        // popping off it.
        const edge = Math.hypot(xy[0] - c, xy[1] - c) / r
        el.style.opacity = String(Math.max(0, Math.min(1, (0.97 - edge) * 6)))
        el.style.pointerEvents = edge < 0.94 ? "auto" : "none"
        el.style.transform = `translate3d(${xy[0]}px, ${xy[1]}px, 0)`
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [land, arcs, nodes])

  const wrapperClass = cn("relative mx-auto w-full max-w-[860px]", className)

  if (!land) {
    return (
      <div
        ref={wrapperRef}
        className={wrapperClass}
        style={{ aspectRatio: "1 / 1" }}
        aria-hidden
      />
    )
  }

  return (
    <div
      ref={wrapperRef}
      className={wrapperClass}
      // `pan-y`, not `none`: on a phone the globe fills most of the hero, and
      // taking vertical swipes away from the page to spin a decoration is the
      // wrong trade. Horizontal drags still reach us.
      style={{ aspectRatio: "1 / 1", touchAction: "pan-y", cursor: "grab" }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 640 640"
        width="100%"
        height="100%"
        className="block overflow-visible select-none"
        role="img"
        aria-label={`A globe showing ${home.place}, where CodeVault works, with lines out to where each project ended up.`}
        onDragStart={(e) => e.preventDefault()}
      >
        <defs>
          <radialGradient id="globe-face" cx="36%" cy="30%" r="72%">
            <stop
              offset="0%"
              stopColor="color-mix(in oklch, var(--muted), var(--background) 70%)"
            />
            <stop offset="100%" stopColor="var(--muted)" />
          </radialGradient>
        </defs>

        {/* Sphere */}
        <circle
          ref={diskRef}
          cx={320}
          cy={320}
          r={262}
          fill="url(#globe-face)"
        />
        <circle
          ref={rimRef}
          cx={320}
          cy={320}
          r={262}
          fill="none"
          stroke="color-mix(in oklch, var(--foreground) 14%, transparent)"
          strokeWidth={0.75}
        />

        <path
          ref={graticuleRef}
          d=""
          fill="none"
          stroke="color-mix(in oklch, var(--foreground) 6%, transparent)"
          strokeWidth={0.4}
        />

        {/* Every country in one path — nothing here is per-country, so there's
            no reason to pay for ~180 nodes. */}
        <path
          ref={landRef}
          d=""
          fill="color-mix(in oklch, var(--foreground) 8%, transparent)"
          stroke="color-mix(in oklch, var(--foreground) 24%, transparent)"
          strokeWidth={0.5}
        />

        {/* Reach: home → each project */}
        <g ref={arcsRef} aria-hidden>
          {arcs.map((_, i) => (
            <g key={i}>
              <path
                d=""
                fill="none"
                stroke="color-mix(in oklch, var(--olive) 55%, transparent)"
                strokeWidth={1}
                strokeLinecap="round"
                strokeDasharray="2 5"
              />
              <circle cx={0} cy={0} r={2.4} fill="var(--olive)" opacity={0} />
            </g>
          ))}
        </g>
      </svg>

      {/* Marker layer. Absolutely positioned HTML so each node is a genuine
          focusable link with a hover label. */}
      <div ref={markersRef} className="absolute inset-0" aria-hidden={false}>
        {nodes.map((n) =>
          n.href ? (
            <Link
              key={n.id}
              to={n.href}
              className="group absolute top-0 left-0 -mt-[7px] -ml-[7px] rounded-full opacity-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={`${n.name} — ${n.detail}`}
            >
              <NodeDot />
              <NodeLabel name={n.name} detail={n.detail} />
            </Link>
          ) : (
            <div
              key={n.id}
              className="group absolute top-0 left-0 -mt-[7px] -ml-[7px] opacity-0"
            >
              <NodeDot home />
              <NodeLabel name={n.name} detail={n.detail} />
            </div>
          )
        )}
      </div>
    </div>
  )
}

function NodeDot({ home: isHome = false }: { home?: boolean }) {
  return (
    <span className="relative block size-[14px]">
      <span
        className={cn(
          "absolute inset-0 rounded-full bg-olive/25 transition-transform duration-500 group-hover:scale-150 group-focus-visible:scale-150",
          isHome && "motion-safe:animate-ping"
        )}
      />
      <span
        className={cn(
          "absolute inset-[4px] rounded-full",
          isHome ? "bg-olive" : "bg-olive/70"
        )}
      />
    </span>
  )
}

function NodeLabel({ name, detail }: { name: string; detail: string }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-center whitespace-nowrap opacity-0 shadow-sm transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
      <span className="block text-detail-xs font-medium text-popover-foreground">
        {name}
      </span>
      <span className="block text-detail-xs text-muted-foreground">
        {detail}
      </span>
    </span>
  )
}
