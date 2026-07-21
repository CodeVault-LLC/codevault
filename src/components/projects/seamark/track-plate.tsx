import { motion, useReducedMotion } from "framer-motion"

import { viewportOnce } from "@/core/lib/motion"
import { workedCase } from "@/core/config/seamark"

// One case, drawn the way the chart would draw it. The geometry is hand-placed
// in viewBox units rather than projected from coordinates — this is an
// illustration of a track, not a plot of one, and pretending otherwise by
// running it through a projection would be a lie with extra steps.
const PLATE = { w: 900, h: 380 }

// The corridor runs top-to-bottom across the sheet; the track crosses it and
// stops transmitting inside it. Both edges are straight lines between these
// points, which is what makes the "inside the corridor" reading legible.
const CORRIDOR = "M430 0 L610 380 L720 380 L540 0 Z"

// Approach: steady transit, then the slow-down at 12:07.
const APPROACH = "M60 92 C 190 118, 300 138, 400 168 S 510 196, 560 205"
// The 41 minutes we heard nothing. Drawn, because the absence is the finding.
const GAP = "M560 205 L620 265"
// Reacquired on a reciprocal heading, still inside the corridor.
const RETURN = "M620 265 C 662 292, 650 328, 585 328"

type Mark = {
  x: number
  y: number
  time: string
  label: string
  /** Which side of the mark the label sits on, so nothing runs off the sheet. */
  anchor?: "start" | "end"
  alert?: boolean
}

const MARKS: Mark[] = [
  { x: 60, y: 92, time: "11:52", label: "11.4 kn · 214°" },
  { x: 400, y: 168, time: "12:07", label: "slows to 3.1 kn" },
  { x: 560, y: 205, time: "12:19", label: "last report", alert: true },
  {
    x: 585,
    y: 328,
    time: "13:00",
    label: "reacquired · 2.8 kn",
    anchor: "end",
  },
]

/**
 * The page's one loud object: the worked case as a chart plate.
 *
 * The drawing order is the argument. The approach draws first and calmly, the
 * gap draws next as a dashed span with the duration held against it, and the
 * return arrives last. Under reduced motion the whole plate is simply present —
 * the sequence is emphasis, and emphasis is not information.
 */
export function TrackPlate() {
  const reduceMotion = useReducedMotion() ?? false

  // Shared shape for the two solid spans; `delay` staggers the sequence.
  const draw = (delay: number, duration: number) =>
    reduceMotion
      ? {}
      : {
          initial: { pathLength: 0 },
          whileInView: { pathLength: 1 },
          viewport: viewportOnce,
          transition: { duration, delay, ease: [0.22, 1, 0.36, 1] as const },
        }

  // Fade a group in. Used for everything that isn't a stroked span, and for
  // the gap — whose dashes a `pathLength` animation would overwrite, because
  // that is how Motion draws a line. Under reduced motion these start visible
  // rather than animating from nothing.
  const appear = (delay: number) => ({
    initial: { opacity: reduceMotion ? 1 : 0 },
    whileInView: { opacity: 1 },
    viewport: viewportOnce,
    transition: { duration: 0.45, delay: reduceMotion ? 0 : delay },
  })

  return (
    <figure>
      {/* The plate holds its scale rather than shrinking below legibility, so
          on a narrow viewport it scrolls sideways like a real chart sheet. */}
      <div className="border-faded overflow-x-auto rounded-2xl border bg-ivory-medium">
        <svg
          viewBox={`0 0 ${PLATE.w} ${PLATE.h}`}
          className="w-full min-w-[48rem]"
          role="img"
          aria-labelledby="track-plate-title track-plate-desc"
        >
          <title id="track-plate-title">
            Chart plate of case {workedCase.id}
          </title>
          <desc id="track-plate-desc">
            A vessel track crossing a seabed cable corridor from the north-west.
            It slows at 12:07, stops transmitting at 12:19 inside the corridor,
            and is reacquired 41 minutes later 1.9 nautical miles away on a
            reciprocal heading.
          </desc>

          <defs>
            <pattern
              id="chart-grid"
              width="45"
              height="45"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M45 0 L0 0 0 45"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-foreground/10"
              />
            </pattern>
            <pattern
              id="corridor-hatch"
              width="9"
              height="9"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="9"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-foreground/15"
              />
            </pattern>
          </defs>

          <rect width={PLATE.w} height={PLATE.h} fill="url(#chart-grid)" />

          {/* The cable corridor: the reason any of this behaviour is scored. */}
          <path d={CORRIDOR} fill="url(#corridor-hatch)" />
          <path
            d={CORRIDOR}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-foreground/25"
          />
          <text
            x="646"
            y="44"
            className="fill-current font-mono text-detail-xs text-foreground/50 uppercase"
          >
            Cable corridor SK-2
          </text>

          {/* Graticule labels — the sheet's edge furniture. */}
          <text
            x="18"
            y="366"
            className="fill-current font-mono text-detail-xs text-foreground/40 tabular-nums"
          >
            58°04′N
          </text>
          <text
            x="820"
            y="366"
            className="fill-current font-mono text-detail-xs text-foreground/40 tabular-nums"
          >
            09°31′E
          </text>

          <g fill="none" strokeLinecap="round" strokeWidth="2.5">
            <motion.path
              d={APPROACH}
              stroke="currentColor"
              className="text-foreground/70"
              {...draw(0, 1.1)}
            />
            {/* A plain path inside an animated group: Motion normalises
                `stroke-dasharray` on every `motion.path` it renders, dashes
                and all, so the dashed span has to stay out of its hands. */}
            <motion.g {...appear(1.05)}>
              <path
                d={GAP}
                stroke="currentColor"
                strokeDasharray="7 9"
                strokeWidth="2"
                className="text-clay"
              />
            </motion.g>
            <motion.path
              d={RETURN}
              stroke="currentColor"
              className="text-foreground/70"
              {...draw(1.5, 0.8)}
            />
          </g>

          {/* The gap, named. The only number on the plate that is a duration. */}
          <motion.g {...appear(1.35)}>
            <text
              x="638"
              y="228"
              className="fill-current font-mono text-detail-xs text-clay tabular-nums"
            >
              41 min · no reception
            </text>
          </motion.g>

          {MARKS.map((mark, i) => (
            <motion.g key={mark.time} {...appear(0.5 + i * 0.45)}>
              <circle
                cx={mark.x}
                cy={mark.y}
                r={mark.alert ? 5 : 3.5}
                className={mark.alert ? "fill-clay" : "fill-foreground/70"}
              />
              {mark.alert && (
                <circle
                  cx={mark.x}
                  cy={mark.y}
                  r="12"
                  fill="none"
                  strokeWidth="1"
                  className="stroke-clay/50"
                />
              )}
              <text
                x={mark.anchor === "end" ? mark.x - 14 : mark.x + 14}
                y={mark.y - 12}
                textAnchor={mark.anchor === "end" ? "end" : "start"}
                className="fill-current font-mono text-detail-xs tabular-nums"
              >
                {mark.time}
              </text>
              <text
                x={mark.anchor === "end" ? mark.x - 14 : mark.x + 14}
                y={mark.y + 4}
                textAnchor={mark.anchor === "end" ? "end" : "start"}
                className="fill-current font-mono text-detail-xs text-foreground/55"
              >
                {mark.label}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>

      <figcaption className="text-faded mt-4 font-mono text-detail-xs uppercase">
        {workedCase.id} · {workedCase.area} · score{" "}
        {workedCase.score.toFixed(2)}
        {/* The plate keeps its scale on a narrow screen, so say that it moves
            rather than leaving the reader to discover it. */}
        <span className="block sm:hidden">Scroll the plate sideways</span>
      </figcaption>
    </figure>
  )
}
