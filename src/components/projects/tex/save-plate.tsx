import { motion, useReducedMotion } from "framer-motion"

import { build, buildTotalMs } from "@/core/config/tex"
import { viewportOnce } from "@/core/lib/motion"

const PLATE = { w: 900, h: 300 }
// Left and right margins of the two time tracks.
const X0 = 40
const TRACK = 820

// The engine pass is the longest step by construction — it is the one thing
// here that is not ours. Everything on the plate is measured against it rather
// than named, so the drawing follows the data if the data changes.
const engine = build.steps.reduce((a, b) => (b.ms > a.ms ? b : a))
const engineIndex = build.steps.indexOf(engine)
const before = build.steps.slice(0, engineIndex)
const after = build.steps.slice(engineIndex + 1)
const rest = [...before, ...after]
const beforeMs = before.reduce((sum, s) => sum + s.ms, 0)
const afterMs = after.reduce((sum, s) => sum + s.ms, 0)
const restMs = beforeMs + afterMs

// Where the engine pass sits inside the expanded track: everything before it
// is on one side of that mark, everything after it on the other.
const splitX = X0 + (beforeMs / restMs) * TRACK

/** Cumulative x/width for a list of steps against a total. */
function lay(steps: typeof build.steps, total: number) {
  let at = 0
  return steps.map((step) => {
    const x = X0 + (at / total) * TRACK
    at += step.ms
    return { step, x, w: (step.ms / total) * TRACK }
  })
}

// The upper track reads as three parts, not seven: bookkeeping, the engine,
// and the preview catching up. Each label is anchored so it stays inside the
// plate rather than centring itself off the end of a sliver.
const laneA = [
  {
    label: `before · ${beforeMs} ms`,
    at: 0,
    ms: beforeMs,
    anchor: "start",
  },
  {
    label: `${engine.name} · ${engine.ms} ms`,
    at: beforeMs,
    ms: engine.ms,
    anchor: "middle",
  },
  {
    label: `after · ${afterMs} ms`,
    at: beforeMs + engine.ms,
    ms: afterMs,
    anchor: "end",
  },
] as const

/** x for a label, given where its part starts, how long it is, and its anchor. */
function labelX(
  at: number,
  ms: number,
  anchor: (typeof laneA)[number]["anchor"]
) {
  const start = X0 + (at / buildTotalMs) * TRACK
  const width = (ms / buildTotalMs) * TRACK
  if (anchor === "start") return start
  if (anchor === "end") return start + width
  return start + width / 2
}

const fillFor = (step: (typeof build.steps)[number]) =>
  step.cached
    ? "fill-olive/60"
    : step === engine
      ? "fill-foreground/75"
      : "fill-foreground/40"

/**
 * The page's one loud object: a single save, drawn to scale twice.
 *
 * The upper track is the honest one — 912 milliseconds, linear, in which the
 * engine pass is three quarters of everything and the six steps this project
 * actually wrote are slivers. That is the finding, so it is drawn first and
 * without help.
 *
 * The lower track expands the 208 milliseconds that are not the engine, which
 * is the only way to label them. It is the same data at a different scale and
 * says so — a second track rather than a distorted first one, because a bar
 * that is not to scale next to bars that are is a lie about the shape of the
 * problem.
 */
export function SavePlate() {
  const reduceMotion = useReducedMotion() ?? false

  // Bars grow from their own leading edge, left to right, in time order.
  const grow = (delay: number, w: number) =>
    reduceMotion
      ? { width: w }
      : {
          initial: { width: 0 },
          whileInView: { width: w },
          viewport: viewportOnce,
          transition: {
            duration: 0.5,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        }

  const appear = (delay: number) => ({
    initial: { opacity: reduceMotion ? 1 : 0 },
    whileInView: { opacity: 1 },
    viewport: viewportOnce,
    transition: { duration: 0.4, delay: reduceMotion ? 0 : delay },
  })

  return (
    <figure>
      {/* The plate holds its scale rather than shrinking below legibility, so
          on a narrow viewport it scrolls sideways. */}
      <div className="border-faded overflow-x-auto rounded-2xl border bg-ivory-medium">
        <svg
          viewBox={`0 0 ${PLATE.w} ${PLATE.h}`}
          className="w-full min-w-[48rem]"
          role="img"
          aria-labelledby="save-plate-title save-plate-desc"
        >
          <title id="save-plate-title">
            Timeline of one save, {buildTotalMs} milliseconds end to end
          </title>
          <desc id="save-plate-desc">
            Two time tracks. The upper track covers the whole save to scale:{" "}
            {beforeMs} milliseconds of bookkeeping, a {engine.ms} millisecond
            engine pass, and {afterMs} milliseconds of diffing and repainting.
            The lower track expands the {restMs} milliseconds that are not the
            engine pass, showing each of the six steps around it.
          </desc>

          {/* Ruler for the upper track. */}
          {[0, 200, 400, 600, 800, buildTotalMs].map((ms) => {
            const x = X0 + (ms / buildTotalMs) * TRACK
            return (
              <g key={ms}>
                <line
                  x1={x}
                  y1="46"
                  x2={x}
                  y2="54"
                  stroke="currentColor"
                  className="text-foreground/25"
                />
                <text
                  x={x}
                  y="36"
                  textAnchor="middle"
                  className="fill-current font-mono text-detail-xs text-foreground/40 tabular-nums"
                >
                  {ms}
                </text>
              </g>
            )
          })}
          <text
            x={X0}
            y="20"
            className="fill-current font-mono text-detail-xs text-foreground/40 uppercase"
          >
            Milliseconds from ⌘S
          </text>

          {/* Upper track — the whole save, to scale. */}
          {lay(build.steps, buildTotalMs).map(({ step, x, w }, i) => (
            <motion.rect
              key={step.code}
              x={x}
              y="62"
              height="26"
              className={fillFor(step)}
              {...grow(i * 0.06, w)}
            />
          ))}

          {laneA.map((part) => (
            <motion.g key={part.label} {...appear(0.5)}>
              <text
                x={labelX(part.at, part.ms, part.anchor)}
                y="108"
                textAnchor={part.anchor}
                className="fill-current font-mono text-detail-xs tabular-nums"
              >
                {part.label}
              </text>
            </motion.g>
          ))}

          {/* Lower track — the part of the save this project is responsible
              for, expanded until it can be labelled. */}
          <motion.text
            x={X0}
            y="160"
            className="fill-current font-mono text-detail-xs text-foreground/40 uppercase"
            {...appear(0.75)}
          >
            The {restMs} ms that is not the engine, expanded
          </motion.text>

          {lay(rest, restMs).map(({ step, x, w }, i) => (
            <motion.rect
              key={step.code}
              x={x}
              y="176"
              height="26"
              className={fillFor(step)}
              {...grow(0.85 + i * 0.06, w)}
            />
          ))}

          {/* Where the engine pass would be, if it fitted on this scale. */}
          <motion.g {...appear(1.2)}>
            <line
              x1={splitX}
              y1="170"
              x2={splitX}
              y2="214"
              stroke="currentColor"
              strokeDasharray="4 5"
              className="text-clay"
            />
            <text
              x={splitX + 6}
              y="226"
              className="fill-current font-mono text-detail-xs text-clay"
            >
              engine pass here
            </text>
          </motion.g>

          {/* Labels, alternating between two rows so the narrow steps still
              get named without their labels colliding. */}
          {lay(rest, restMs).map(({ step, x }, i) => {
            const y = i % 2 === 0 ? 252 : 274
            return (
              <motion.g key={step.code} {...appear(1 + i * 0.06)}>
                <line
                  x1={x}
                  y1="202"
                  x2={x}
                  y2={y - 10}
                  stroke="currentColor"
                  className="text-foreground/20"
                />
                <text
                  x={x + 5}
                  y={y}
                  className="fill-current font-mono text-detail-xs tabular-nums"
                >
                  {step.short} · {step.ms} ms
                </text>
              </motion.g>
            )
          })}
        </svg>
      </div>

      <figcaption className="text-faded mt-4 font-mono text-detail-xs uppercase">
        One save · 182-page thesis · {buildTotalMs} ms end to end · olive is
        restored, not run
        {/* The plate keeps its scale on a narrow screen, so say that it moves
            rather than leaving the reader to discover it. */}
        <span className="block sm:hidden">Scroll the plate sideways</span>
      </figcaption>
    </figure>
  )
}
