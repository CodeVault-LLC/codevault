import { useEffect, useRef, useState } from "react"
import { feature } from "topojson-client"
import type { FeatureCollection, Geometry, MultiLineString } from "geojson"
import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo"

type Topology = { objects: { countries: Geometry } }

type City = { name: string; lon: number; lat: number }

const CITIES: City[] = [
  { name: "Reykjavík", lon: -21.94, lat: 64.15 },
  { name: "Berlin", lon: 13.4, lat: 52.52 },
  { name: "Lagos", lon: 3.4, lat: 6.45 },
  { name: "Bangalore", lon: 77.59, lat: 12.97 },
  { name: "Tokyo", lon: 139.69, lat: 35.69 },
  { name: "Sydney", lon: 151.21, lat: -33.87 },
  { name: "São Paulo", lon: -46.63, lat: -23.55 },
  { name: "San Francisco", lon: -122.42, lat: 37.77 },
]

// Returns a CSS color-mix string blending from a neutral slate to the
// "healthy" olive. `amount` is 0..1.
const healthy = (amount: number) => {
  const a = Math.max(0, Math.min(1, amount))
  return `color-mix(in oklch, rgba(20,20,19,0.10) ${(1 - a) * 100}%, var(--olive) ${a * 100}%)`
}

type GlobeState = {
  // User-controlled rotation offset, in radians
  userLon: number
  userLat: number
  // Idle drift velocity (rad / frame)
  vLon: number
  vLat: number
  // Scroll-driven values
  scrollProgress: number
  scrollTarget: number
  // Visual
  size: number
  r: number
  r2: number
  maxGrow: number
  // Cosmetic
  pulse: number
  dragging: boolean
  lastPointer: { x: number; y: number }
}

export function WorldGlobe({ className }: { className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const diskRef = useRef<SVGCircleElement>(null)
  const landGroupRef = useRef<SVGGElement>(null)
  const graticuleRef = useRef<SVGPathElement>(null)
  const citiesGroupRef = useRef<SVGGElement>(null)
  const haloRef = useRef<SVGCircleElement>(null)

  // Per-feature tint seed (computed once after data load)
  const seedsRef = useRef<number[]>([])

  // Everything that animates lives in a ref. Nothing here causes a React
  // re-render — every frame writes directly to the DOM.
  const stateRef = useRef<GlobeState>({
    userLon: 0,
    userLat: 0,
    vLon: 0.0006,
    vLat: 0,
    scrollProgress: 0,
    scrollTarget: 0,
    size: 640,
    r: 320,
    r2: 260,
    maxGrow: 1.12,
    pulse: 0,
    dragging: false,
    lastPointer: { x: 0, y: 0 },
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
        const seeds = collection.features.map(
          (_, i) => ((i * 9301 + 49297) % 233280) / 233280
        )
        seedsRef.current = seeds
        setLand({ collection, graticule: geoGraticule10() })
      })
    return () => {
      cancelled = true
    }
  }, [])

  // ---- Resize
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const updateSize = (w: number) => {
      // Cap the SVG so it doesn't blow up on huge screens. The rendered
      // globe keeps enough internal padding for the scroll growth and halo,
      // which prevents the hero from clipping the sphere.
      const size = Math.min(Math.max(w, 320), 900)
      stateRef.current.size = size
      stateRef.current.r = size / 2
      stateRef.current.r2 = (size / 2) * 0.82
      if (svgRef.current) {
        svgRef.current.setAttribute("viewBox", `0 0 ${size} ${size}`)
      }
    }

    updateSize(wrapper.getBoundingClientRect().width || 640)
    const ro = new ResizeObserver((entries) => {
      updateSize(entries[0]?.contentRect.width ?? 640)
    })
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [land])

  // ---- Scroll: drive `scrollTarget` from the wrapper's position in the
  // viewport. Tint reaches 1 only when the wrapper top has scrolled well
  // past the top of the screen, so the user gets a long, gentle green
  // transition as they move down.
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const onScroll = () => {
      const rect = wrapper.getBoundingClientRect()
      const vh = window.innerHeight
      // Range: from "wrapper top hits viewport top" to "wrapper top is
      // 1.6 viewports above the viewport top". 1.6vh is enough scroll for
      // the transition to feel slow and smooth.
      const start = vh * 0.6
      const range = vh * 1.6
      const scrolled = start - rect.top
      const raw = scrolled / range
      stateRef.current.scrollTarget = Math.max(0, Math.min(1, raw))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // ---- Pointer drag (left click + touch). We listen on the wrapper so
  // the user can grab anywhere inside the visible area, not just on the
  // thin SVG geometry.
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const s = stateRef.current

    // Only respond to primary button on mouse
    const isPrimary = (e: PointerEvent) =>
      e.pointerType === "mouse" ? e.button === 0 : true

    const onPointerDown = (e: PointerEvent) => {
      if (!isPrimary(e)) return
      const target = e.target as Element
      target.setPointerCapture(e.pointerId)
      s.dragging = true
      s.lastPointer.x = e.clientX
      s.lastPointer.y = e.clientY
      s.vLon = 0
      s.vLat = 0
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!s.dragging) return
      const dx = e.clientX - s.lastPointer.x
      const dy = e.clientY - s.lastPointer.y
      s.lastPointer.x = e.clientX
      s.lastPointer.y = e.clientY
      // Sensitivity is tied to the current radius so dragging feels 1:1
      const sensitivity = 2.2 / Math.max(120, s.r2)
      s.userLon += dx * sensitivity
      s.userLat = Math.max(-1.2, Math.min(1.2, s.userLat - dy * sensitivity))
    }
    const onPointerUp = (e: PointerEvent) => {
      if (!s.dragging) return
      s.dragging = false
      const target = e.target as Element
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId)
      }
    }

    wrapper.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    window.addEventListener("pointercancel", onPointerUp)
    return () => {
      wrapper.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      window.removeEventListener("pointercancel", onPointerUp)
    }
  }, [])

  // ---- rAF loop. One source of truth: eases scroll targets, applies
  // user drag, computes the projection, writes SVG attributes directly.
  useEffect(() => {
    if (!land) return
    let raf = 0
    let lastT = performance.now()
    const s = stateRef.current

    const tick = () => {
      const now = performance.now()
      const dt = Math.min(48, now - lastT)
      lastT = now

      // Critically damped easing toward scroll target
      const ease = 1 - Math.pow(0.0015, dt / 1000)
      s.scrollProgress += (s.scrollTarget - s.scrollProgress) * ease

      // Idle auto-rotation (only when not dragging)
      if (!s.dragging) {
        s.userLon += s.vLon
        s.userLat += s.vLat
        s.vLon *= Math.pow(0.985, dt / 16)
        s.vLat *= Math.pow(0.985, dt / 16)
        // Gentle pull back toward lat=0 so it doesn't drift to a pole
        s.vLat += (0 - s.userLat) * 0.00008
        if (Math.abs(s.vLon) < 0.00005) s.vLon = 0.0006
      }

      // Base rotation interpolates with scroll, then we layer the user's
      // drag offset on top.
      const baseLon = -100 * s.scrollProgress
      const baseLat = -20 + 40 * s.scrollProgress
      const lon = baseLon + s.userLon
      const lat = Math.max(-85, Math.min(85, baseLat + s.userLat))

      s.pulse = now / 1000

      // ---- Build the projection for this frame. The globe subtly grows
      // with scroll while staying inside the SVG's reserved visual area.
      const grow = 1 + (s.maxGrow - 1) * s.scrollProgress
      const r2 = s.r2 * grow
      const r = s.r
      const projection = geoOrthographic()
        .scale(r2)
        .translate([r, r])
        .rotate([-lon, -lat])
        .clipAngle(90)
      const path = geoPath(projection)

      // Graticule
      if (graticuleRef.current) {
        const d = path(land.graticule) ?? ""
        if (d) graticuleRef.current.setAttribute("d", d)
        graticuleRef.current.setAttribute("stroke-width", String(0.4 / grow))
      }

      // Disk (no longer fades — it's already faded in)
      if (diskRef.current) {
        diskRef.current.setAttribute("cx", String(r))
        diskRef.current.setAttribute("cy", String(r))
        diskRef.current.setAttribute("r", String(r2))
      }

      // Outer breathing halo
      if (haloRef.current) {
        const breath = 1 + Math.sin(now / 2400) * 0.025
        haloRef.current.setAttribute("cx", String(r))
        haloRef.current.setAttribute("cy", String(r))
        haloRef.current.setAttribute("r", String(r2 * 1.06 * breath))
        // Halo color saturates a touch as the world gets "healthier"
        const hueShift = 0.4 + 0.6 * s.scrollProgress
        haloRef.current.style.opacity = String(0.18 + 0.2 * hueShift)
      }

      // Country paths
      if (landGroupRef.current) {
        const children = landGroupRef.current.children
        const features = land.collection.features
        const seeds = seedsRef.current
        for (let i = 0; i < features.length; i++) {
          const node = children[i] as SVGPathElement | undefined
          if (!node) continue
          const f = features[i]
          const d =
            path({
              type: "Feature",
              geometry: f.geometry,
              properties: {},
            }) ?? ""
          if (d) node.setAttribute("d", d)
          else node.setAttribute("d", "")

          // Per-country tint, with deterministic stagger so the green
          // spreads across the world instead of all snapping at once.
          const seed = seeds[i] ?? 0
          const stagger = seed * 0.3
          const localTint = Math.max(
            0,
            Math.min(1, (s.scrollProgress - stagger) * 1.8)
          )
          const eased = localTint * localTint * (3 - 2 * localTint)
          node.setAttribute("fill", healthy(eased))
          node.setAttribute("stroke-width", String(0.5 / grow))
        }
      }

      // City dots
      if (citiesGroupRef.current) {
        const children = citiesGroupRef.current.children
        for (let i = 0; i < CITIES.length; i++) {
          const c = CITIES[i]
          const grp = children[i] as SVGGElement | undefined
          if (!grp) continue
          const coords = projection([c.lon, c.lat])
          if (!coords) {
            grp.style.opacity = "0"
            continue
          }
          const [cx, cy] = coords
          const inside = Math.hypot(cx - r, cy - r) < r2 - 2
          if (!inside) {
            grp.style.opacity = "0"
            continue
          }
          grp.style.opacity = String(0.5 + 0.5 * s.scrollProgress)
          const ring = grp.children[0] as SVGCircleElement
          const dot = grp.children[1] as SVGCircleElement
          const breath = 0.6 + 0.4 * Math.sin(s.pulse + c.lon)
          ring.setAttribute("cx", String(cx))
          ring.setAttribute("cy", String(cy))
          ring.setAttribute("r", String(7 * (0.6 + 0.4 * s.scrollProgress)))
          ring.setAttribute("opacity", String(0.25 + 0.5 * breath))
          dot.setAttribute("cx", String(cx))
          dot.setAttribute("cy", String(cy))
          dot.setAttribute("r", String(2.6 + 1.2 * s.scrollProgress))
        }
      }

      // Rim: scale with the disk
      const rim1 = svgRef.current?.querySelector(
        "[data-rim='1']"
      ) as SVGCircleElement | null
      const rim2 = svgRef.current?.querySelector(
        "[data-rim='2']"
      ) as SVGCircleElement | null
      if (rim1) {
        rim1.setAttribute("cx", String(r))
        rim1.setAttribute("cy", String(r))
        rim1.setAttribute("r", String(r2))
      }
      if (rim2) {
        rim2.setAttribute("cx", String(r))
        rim2.setAttribute("cy", String(r))
        rim2.setAttribute("r", String(r2 + 4))
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [land])

  if (!land) {
    return (
      <div
        ref={wrapperRef}
        className={className}
        aria-hidden
        style={{
          minHeight: 220,
          aspectRatio: "1 / 1",
          touchAction: "none",
        }}
      />
    )
  }

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        width: "100%",
        maxWidth: 860,
        margin: "0 auto",
        // The wrapper is the visible, draggable area. It's a large square
        // (so the planet has room to grow without clipping).
        aspectRatio: "1 / 1",
        touchAction: "none",
        cursor: "grab",
        userSelect: "none",
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 640 640"
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
        aria-label="An animated globe showing where CodeVault users are building"
        role="img"
        onDragStart={(e) => e.preventDefault()}
      >
        <defs>
          <radialGradient id="globe-shade" cx="38%" cy="32%" r="70%">
            <stop
              offset="0%"
              stopColor="color-mix(in oklch, var(--ivory-dark), white 35%)"
            />
            <stop offset="100%" stopColor="var(--ivory-dark)" />
          </radialGradient>
          <radialGradient id="globe-halo" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="var(--olive)" stopOpacity="0" />
            <stop offset="80%" stopColor="var(--olive)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--olive)" stopOpacity="0" />
          </radialGradient>
          <filter id="globe-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Outer breathing halo */}
        <circle
          ref={haloRef}
          cx={320}
          cy={320}
          r={276}
          fill="url(#globe-halo)"
          style={{
            opacity: 0.2,
            transition: "opacity 600ms ease",
          }}
        />

        {/* Disk */}
        <circle
          ref={diskRef}
          cx={320}
          cy={320}
          r={260}
          fill="url(#globe-shade)"
        />

        {/* Rim */}
        <circle
          data-rim="1"
          cx={320}
          cy={320}
          r={260}
          fill="none"
          stroke="rgba(20,20,19,0.32)"
          strokeWidth={0.75}
        />
        <circle
          data-rim="2"
          cx={320}
          cy={320}
          r={264}
          fill="none"
          stroke="rgba(20,20,19,0.12)"
          strokeWidth={0.4}
        />

        {/* Graticule */}
        <g fill="none" stroke="rgba(20,20,19,0.06)" strokeWidth={0.4}>
          <path ref={graticuleRef} d="" />
        </g>

        {/* Countries */}
        <g ref={landGroupRef}>
          {land.collection.features.map((_, i) => (
            <path
              key={i}
              d=""
              fill="rgba(20,20,19,0.10)"
              stroke="rgba(20,20,19,0.32)"
              strokeWidth={0.5}
              style={{ transition: "fill 700ms ease" }}
            />
          ))}
        </g>

        {/* City dots */}
        <g ref={citiesGroupRef}>
          {CITIES.map((c) => (
            <g key={c.name} style={{ transition: "opacity 600ms ease" }}>
              <circle
                cx={0}
                cy={0}
                r={6}
                fill="rgba(120,140,93,0.3)"
                filter="url(#globe-glow)"
              />
              <circle cx={0} cy={0} r={2.6} fill="var(--olive)" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
