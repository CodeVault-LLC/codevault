import { Link } from "@tanstack/react-router"

import { electrical } from "@/core/config/electrical"
import { Arrow, buttonClass } from "@/components/ui/button-link"

/**
 * The big announcement card. The whole card is one link, like Anthropic's.
 *
 * It opens with a short introduction, about five seconds, then rests. Three
 * tiles fade in, one for each thing the product does: pick two devices,
 * suggest a route around what's in the way, take it through a wall. A
 * hairline arc draws through them, each tile dissolves as the line passes,
 * and the name settles onto the line, then the tagline and the button.
 *
 * All CSS, so it plays without JavaScript; with reduced motion the card
 * opens on its resting state.
 */
export function ElectricalAnnouncement() {
  return (
    <section
      aria-labelledby="electrical-announcement"
      className="fade-rise"
      style={{ "--d": "100ms" } as React.CSSProperties}
    >
      <Link
        to="/news/$slug"
        params={{ slug: electrical.announcementSlug }}
        className="group/card relative flex h-[clamp(25rem,46vw,36rem)] flex-col items-center justify-center overflow-hidden rounded-3xl bg-surface px-6 focus-visible:outline-offset-4"
      >
        <h2 id="electrical-announcement" className="sr-only">
          Introducing {electrical.name}
        </h2>
        <Arc text={electrical.name} />

        <div
          className="fade-rise mt-[clamp(1.5rem,4vw,3rem)] flex flex-col items-center gap-5 text-center"
          style={{ "--d": "4300ms" } as React.CSSProperties}
        >
          <p className="max-w-[30ch] text-paragraph-m text-balance sm:text-paragraph-l">
            {electrical.tagline}
          </p>
          <span className={buttonClass("primary")}>
            Read the announcement
            <Arrow />
          </span>
        </div>
      </Link>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* The arc: tiles, line and name in one drawing                               */
/* -------------------------------------------------------------------------- */

// The name sits on one circle and the hairline on a slightly smaller one
// with the same centre, so they stay parallel. The line runs on past the
// drawing's edges and is cut off by the card.
const CX = 500
const CY = 1950
const NAME_R = 1800
const LINE_R = 1765

/** The y of a point on a circle around (CX, CY) at `x`. */
function onCircle(r: number, x: number) {
  return CY - Math.sqrt(r * r - (x - CX) ** 2)
}

/** The hairline runs between these x, past both edges of the drawing. */
const LINE_FROM = -800
const LINE_TO = 1800

/** How far along the hairline (0 → 1) the point above `x` lies. */
function alongLine(x: number) {
  const angle = (at: number) => Math.asin((at - CX) / LINE_R)
  return (angle(x) - angle(LINE_FROM)) / (angle(LINE_TO) - angle(LINE_FROM))
}

function arcPath(r: number, x0: number, x1: number) {
  const y0 = onCircle(r, x0).toFixed(1)
  const y1 = onCircle(r, x1).toFixed(1)
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`
}

const TILE = 150
/** How much larger the tiles are drawn than their artwork. */
const TILE_SCALE = 1.3

/**
 * The tiles, on the illustration swatches, with when each fades in and when
 * it folds down into a small device on the line, just after the line
 * reaches it.
 */
const TILES = [
  { x: 210, tone: "fill-olive", art: "pick", in: 200, out: 2950 },
  { x: 500, tone: "fill-coral", art: "suggest", in: 450, out: 3100 },
  { x: 790, tone: "fill-sky", art: "through", in: 700, out: 3250 },
] as const

/**
 * At rest, now and then a pulse runs along the line, from just off the left
 * edge to past the right, and each device lights as it passes. Kept in step
 * with `arc-pulse` and `node-glow` in globals.css.
 */
const PULSE = {
  /** When the first pulse sets off: after the introduction. */
  start: 5200,
  /** Where along the line it starts and ends, and how long that takes. */
  from: 0.15,
  to: 1.02,
  travel: 4000,
  /** Its length along the line: a bright head and a fading tail. */
  trail: [
    { length: 0.14, width: 1.25, opacity: 0.22 },
    { length: 0.06, width: 1.5, opacity: 0.5 },
    { length: 0.014, width: 2.25, opacity: 1 },
  ],
}

/** When the pulse reaches the point above `x`, in ms after the page loads. */
function pulseReaches(x: number) {
  const { start, from, to, travel } = PULSE
  return Math.round(start + ((alongLine(x) - from) / (to - from)) * travel)
}

function Arc({ text }: { text: string }) {
  // Sized to the arc: short names at full size, longer ones scaled to fit.
  const size = Math.min(104, Math.round(1750 / text.length))
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 280"
      className="w-[min(56rem,100%)] shrink-0 overflow-visible"
    >
      <defs>
        <path id="announcement-arc" d={arcPath(NAME_R, 60, 940)} />
        {/* A fine print grain, so the tiles read as printed artwork. */}
        <filter id="tile-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed="4"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 0 0.07  0 0 0 0.55 -0.12"
          />
        </filter>
      </defs>

      {TILES.map((tile) => {
        // The line crosses each tile low down, as it passes.
        const top = onCircle(LINE_R, tile.x) - TILE * TILE_SCALE * 0.7
        return (
          <g
            key={tile.art}
            transform={`translate(${tile.x - (TILE * TILE_SCALE) / 2} ${top.toFixed(1)}) scale(${TILE_SCALE})`}
          >
            <g
              className="intro-tile"
              style={
                {
                  "--in": `${tile.in}ms`,
                  "--out": `${tile.out}ms`,
                } as React.CSSProperties
              }
            >
              <rect width={TILE} height={TILE} className={tile.tone} />
              <TileArt art={tile.art} delay={tile.in + 500} />
              <rect width={TILE} height={TILE} filter="url(#tile-grain)" />
              {/* Starts pale and deepens, like a print developing. */}
              <rect
                width={TILE}
                height={TILE}
                fill={PAPER}
                className="tile-wash"
              />
            </g>
          </g>
        )
      })}

      <path
        d={arcPath(LINE_R, LINE_FROM, LINE_TO)}
        pathLength={1}
        fill="none"
        vectorEffect="non-scaling-stroke"
        strokeWidth={1.25}
        className="draw-line stroke-foreground/55"
        style={
          {
            "--d": "2400ms",
            animationDuration: "1400ms",
          } as React.CSSProperties
        }
      />

      {PULSE.trail.map((part) => (
        <path
          key={part.length}
          d={arcPath(LINE_R, LINE_FROM, LINE_TO)}
          pathLength={1}
          fill="none"
          vectorEffect="non-scaling-stroke"
          strokeWidth={part.width}
          strokeLinecap="round"
          // One dash, its head at `from` until the pulse moves it along.
          strokeDasharray={`0 ${PULSE.from - part.length} ${part.length} 3`}
          opacity={part.opacity}
          className="arc-pulse stroke-persimmon"
          style={{ "--d": `${PULSE.start}ms` } as React.CSSProperties}
        />
      ))}

      {TILES.map((tile) => {
        const y = onCircle(LINE_R, tile.x)
        const box = { x: tile.x - 7, y: y - 7, width: 14, height: 14 }
        return (
          <g
            key={tile.art}
            className="arc-node"
            style={{ "--d": `${tile.out + 380}ms` } as React.CSSProperties}
          >
            <rect
              {...box}
              vectorEffect="non-scaling-stroke"
              strokeWidth={1.25}
              className="fill-surface stroke-foreground/70"
            />
            <rect
              {...box}
              className="node-glow fill-persimmon"
              style={
                {
                  "--d": `${pulseReaches(tile.x)}ms`,
                } as React.CSSProperties
              }
            />
          </g>
        )
      })}

      <text
        className="fill-foreground font-serif"
        fontSize={size}
        letterSpacing="-1"
        style={{ "--d": "3500ms" } as React.CSSProperties}
      >
        <textPath
          href="#announcement-arc"
          startOffset="50%"
          textAnchor="middle"
        >
          {[...text].map((ch, i) => (
            <tspan
              key={i}
              className="letter-in"
              style={{ "--i": i } as React.CSSProperties}
            >
              {ch}
            </tspan>
          ))}
        </textPath>
      </text>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* Tile drawings                                                              */
/* -------------------------------------------------------------------------- */

// Ink line work on a flat swatch, in the same language as the news
// illustrations: paper-square devices, routes with an ink casing and a paper
// core, elbows that bend rather than corner. Swatch and ink stay the same in
// dark mode, like printed artwork.

const INK = "#141413"
const PAPER = "#faf9f5"

/** The mouse pointer, tip at the origin. */
const POINTER = "M0 0 L0 15.5 L4.1 11.8 L7 18 L9.7 16.8 L6.9 10.7 L12 10.7 Z"

function Device({ x, y }: { x: number; y: number }) {
  return (
    <rect
      x={x - 13}
      y={y - 13}
      width={26}
      height={26}
      fill={PAPER}
      stroke={INK}
      strokeWidth={3}
    />
  )
}

/** A line that draws itself in, `delay` ms after the page loads. */
function Draw({
  delay,
  ...props
}: { delay: number } & React.SVGProps<SVGPathElement>) {
  return (
    <path
      pathLength={1}
      className="draw-line"
      style={
        {
          "--d": `${delay}ms`,
          animationDuration: "900ms",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

/** Fades in, `delay` ms after the page loads. */
function fadeIn(delay: number) {
  return {
    className: "letter-in",
    style: { "--d": `${delay}ms` } as React.CSSProperties,
  }
}

function TileArt({
  art,
  delay,
}: {
  art: (typeof TILES)[number]["art"]
  delay: number
}) {
  const ink = {
    fill: "none",
    stroke: INK,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const

  switch (art) {
    case "pick":
      // Two devices on the drawing grid; the first is picked.
      return (
        <g {...ink}>
          {[25, 50, 75, 100, 125].flatMap((y) =>
            [25, 50, 75, 100, 125].map((x) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r={1.8}
                fill={PAPER}
                stroke="none"
                opacity={0.55}
              />
            ))
          )}
          <Draw
            d="M 82 104 A 30 30 0 1 1 22 104 A 30 30 0 1 1 82 104"
            delay={delay}
            stroke={PAPER}
            strokeWidth={3}
          />
          <Device x={52} y={104} />
          <Device x={108} y={44} />
          <g {...fadeIn(delay + 350)}>
            <path
              d={POINTER}
              transform="translate(60 112) scale(2)"
              fill={INK}
              stroke={PAPER}
              strokeWidth={1.1}
            />
          </g>
        </g>
      )
    case "suggest":
      // A route suggested around a column and a duct, still dashed.
      return (
        <g {...ink}>
          <rect
            x={78}
            y={74}
            width={52}
            height={48}
            strokeWidth={2}
            strokeDasharray="7 6"
          />
          <rect x={48} y={58} width={22} height={22} fill={INK} stroke="none" />
          <Draw
            d="M 28 120 V 50 Q 28 32 46 32 H 104 Q 122 32 122 50 V 52"
            delay={delay}
            strokeWidth={9}
          />
          <path
            d="M 28 120 V 50 Q 28 32 46 32 H 104 Q 122 32 122 50 V 52"
            stroke={PAPER}
            strokeWidth={4}
            strokeDasharray="7 7"
            {...fadeIn(delay + 500)}
          />
          <Device x={28} y={122} />
          <Device x={122} y={58} />
        </g>
      )
    case "through":
      // A run taken through a wall, with a sleeve where it passes.
      return (
        <g {...ink}>
          <rect x={64} y={0} width={18} height={150} fill={INK} stroke="none" />
          <Draw
            d="M 30 104 H 84 Q 100 104 100 88 V 62 Q 100 46 116 46 H 120"
            delay={delay}
            strokeWidth={9}
          />
          <path
            d="M 30 104 H 84 Q 100 104 100 88 V 62 Q 100 46 116 46 H 120"
            stroke={PAPER}
            strokeWidth={4}
            {...fadeIn(delay + 500)}
          />
          <rect
            x={56}
            y={90}
            width={34}
            height={28}
            rx={2}
            stroke={PAPER}
            strokeWidth={3}
            {...fadeIn(delay + 700)}
          />
          <Device x={30} y={104} />
          <Device x={122} y={46} />
        </g>
      )
  }
}
