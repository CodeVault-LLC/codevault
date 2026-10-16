import { useRef } from "react"

import { gsap, motionQuery, useGSAP } from "@/core/lib/motion"
import type { Diagram } from "@/core/config/electrical"
import { cn } from "@/lib/utils"

type Box = [x: number, y: number, width: number, height: number]

/**
 * What each tool does, drawn the way the product's own icons are: square
 * terminals, a stepped route with rounded elbows, and something in the way.
 * A tray is an open channel along the top; a moved obstacle arrives after the
 * route is drawn, the way a duct is moved into a route that was already there.
 */
const DIAGRAMS: Record<
  Diagram,
  {
    routes: string[]
    terminals: [number, number][]
    obstacles?: Box[]
    tray?: string
    moved?: Box
  }
> = {
  ab: {
    obstacles: [[128, 44, 68, 74]],
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
  tray: {
    tray: "M40 26 V42 H290 V26",
    obstacles: [[62, 70, 60, 52]],
    routes: ["M102 150 H170 Q186 150 186 134 V46"],
    terminals: [[90, 150]],
  },
  batch: {
    tray: "M30 26 V42 H290 V26",
    obstacles: [[108, 54, 44, 34]],
    routes: [
      "M60 138 V46",
      "M130 138 V118 Q130 102 146 102 H164 Q180 102 180 86 V46",
      "M210 138 V46",
      "M270 138 V46",
    ],
    terminals: [
      [60, 150],
      [130, 150],
      [210, 150],
      [270, 150],
    ],
  },
  watch: {
    routes: ["M52 140 H218 Q234 140 234 124 V66 Q234 50 250 50 H268"],
    terminals: [
      [40, 140],
      [280, 50],
    ],
    moved: [136, 116, 56, 48],
  },
}

function Obstacle({ box, className }: { box: Box; className?: string }) {
  const [x, y, w, h] = box
  return (
    <g className={className} strokeWidth={1.5} strokeDasharray="5 4">
      <rect x={x} y={y} width={w} height={h} />
      <path d={`M${x} ${y} L${x + w} ${y + h} M${x + w} ${y} L${x} ${y + h}`} />
    </g>
  )
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
  const { routes, terminals, obstacles = [], tray, moved } = DIAGRAMS[diagram]

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
        const trays = gsap.utils.toArray<SVGPathElement>("[data-tray]", svg)
        if (trays.length) tl.from(trays, { opacity: 0, duration: 0.4 })
        tl.from(
          ends,
          {
            scale: 0,
            transformOrigin: "50% 50%",
            duration: 0.4,
            ease: "back.out(2)",
            stagger: 0.12,
          },
          "<"
        )
        paths.forEach((path, i) => {
          const length = path.getTotalLength()
          tl.fromTo(
            path,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" },
            i === 0 ? ">-0.1" : "<0.35"
          )
        })
        const arrivals = gsap.utils.toArray<SVGGElement>("[data-moved]", svg)
        if (arrivals.length) {
          tl.from(arrivals, {
            y: -48,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
          })
          tl.from(
            "[data-clash]",
            {
              scale: 0,
              transformOrigin: "50% 50%",
              duration: 0.4,
              ease: "back.out(2)",
            },
            ">-0.1"
          )
        }
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
      {obstacles.map((box) => (
        <Obstacle key={box.join()} box={box} className="stroke-faint" />
      ))}
      {tray && (
        <path
          data-tray=""
          d={tray}
          className="stroke-foreground"
          strokeWidth={2.5}
        />
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
      {moved && (
        <g>
          <g data-moved="">
            <Obstacle box={moved} className="stroke-foreground" />
          </g>
          <circle
            data-clash=""
            cx={moved[0] + moved[2] / 2}
            cy={140} // where it crosses the route
            r={6}
            className="fill-foreground"
          />
        </g>
      )}
    </svg>
  )
}
