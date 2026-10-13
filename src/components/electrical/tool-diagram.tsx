import { useRef } from "react"

import { gsap, motionQuery, useGSAP } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

export type Diagram = "ab" | "network"

/**
 * What each tool does, drawn the way the product's own icons are: square
 * terminals, a stepped route with rounded elbows, and something in the way.
 */
const DIAGRAMS: Record<
  Diagram,
  { routes: string[]; terminals: [number, number][]; obstacle?: string }
> = {
  ab: {
    obstacle: "M128 44 H196 V118 H128 Z",
    routes: ["M52 140 H218 Q234 140 234 124 V66 Q234 50 250 50 H268"],
    terminals: [
      [40, 140],
      [280, 50],
    ],
  },
  network: {
    routes: [
      "M52 90 H112 Q128 90 128 74 V56 Q128 40 144 40 H268",
      "M128 90 V124 Q128 140 144 140 H268",
      "M176 40 V78 Q176 94 192 94 H268",
    ],
    terminals: [
      [40, 90],
      [280, 40],
      [280, 94],
      [280, 140],
    ],
  },
}

/**
 * A tool's diagram. The routes draw in when scrolled into view, and again
 * whenever the card it sits in is hovered.
 */
export function ToolDiagram({
  diagram,
  className,
}: {
  diagram: Diagram
  className?: string
}) {
  const ref = useRef<SVGSVGElement>(null)
  const { routes, terminals, obstacle } = DIAGRAMS[diagram]

  useGSAP(
    () => {
      const svg = ref.current
      if (!svg) return
      const mm = gsap.matchMedia()
      mm.add(motionQuery.ok, () => {
        const paths = gsap.utils.toArray<SVGPathElement>("[data-route]", svg)
        const ends = gsap.utils.toArray<SVGRectElement>("[data-end]", svg)
        const tl = gsap.timeline({
          scrollTrigger: { trigger: svg, start: "top 80%", once: true },
        })
        const card = svg.parentElement
        const replay = () => {
          if (!tl.isActive() && tl.progress() === 1) tl.restart()
        }
        card?.addEventListener("pointerenter", replay)
        tl.from(ends, {
          scale: 0,
          transformOrigin: "50% 50%",
          duration: 0.4,
          ease: "back.out(2)",
          stagger: 0.12,
        })
        paths.forEach((path, i) => {
          const length = path.getTotalLength()
          tl.fromTo(
            path,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" },
            i === 0 ? ">-0.1" : "<0.35"
          )
        })
        return () => card?.removeEventListener("pointerenter", replay)
      })
    },
    { scope: ref }
  )

  return (
    <svg
      ref={ref}
      viewBox="0 0 320 180"
      aria-hidden
      className={cn("h-auto w-full overflow-visible", className)}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {obstacle && (
        <g className="stroke-faint" strokeWidth={1.5} strokeDasharray="5 4">
          <path d={obstacle} />
          <path d="M128 44 L196 118 M196 44 L128 118" />
        </g>
      )}
      {/* Every halo before any route, so a branch never notches the run it
          leaves from. */}
      {routes.map((d) => (
        <path key={d} d={d} className="stroke-surface" strokeWidth={9} />
      ))}
      {routes.map((d) => (
        <path
          key={d}
          data-route=""
          d={d}
          className="stroke-persimmon-strong dark:stroke-persimmon"
          strokeWidth={3.5}
        />
      ))}
      {terminals.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          data-end=""
          x={x - 10}
          y={y - 10}
          width={20}
          height={20}
          className="fill-foreground"
        />
      ))}
    </svg>
  )
}
