import { useId, useRef } from "react"

import { gsap, motionQuery, useGSAP } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

/**
 * Orbit, the CodeVault mascot: a small world with a ring around it. Its hands
 * and feet float free like moons, so it can hold, point at and sit on anything.
 *
 * Drawn in a 120-unit box. The body is centered at (60, 56) with radius 30; the
 * ring is centered at (60, 62) and tilted −14°, drawn once behind the body and
 * again, clipped to its near half, in front of it. Feet rest on y = 110.
 *
 * Colors come from the swatches through `tone`. The small props (pencils,
 * drinks, hats) carry their own illustration colors, like `PostArt`'s ink.
 */

export type OrbitPose =
  | "hello"
  | "stand"
  | "sit"
  | "peek"
  | "design"
  | "code"
  | "write"
  | "summer"
  | "pumpkin"
  | "witch"
  | "icon"

/** Where the feet meet the ground, in drawing units. */
export const orbitFoot = { x: 60, y: 110 } as const

/** Where an input's top edge falls, in drawing units, for the perched poses. */
export const orbitEdge = { sit: 86, peek: 70 } as const

const tones = {
  persimmon: {
    "--o-body": "var(--persimmon)",
    "--o-shade": "var(--persimmon-shade)",
    "--o-light": "var(--persimmon-light)",
  },
  ivory: {
    "--o-body": "var(--ivory-light)",
    "--o-shade": "var(--oat)",
    "--o-light": "var(--ivory-light)",
  },
} as const

const INK = "var(--slate-dark)"
const GLINT = "var(--ivory-light)"
const GLOW = "#ffcf5c"
const BODY = "var(--o-body)"
const SHADE = "var(--o-shade)"
const LIGHT = "var(--o-light)"

type Hand = {
  x: number
  y: number
  kind?: "rest" | "wave" | "grip" | "support" | "perch"
  /** Grip angle follows the prop's shaft; all hand geometry is local. */
  angle?: number
  flip?: boolean
  motion?: Motion
}
/** Work gestures. A tool and its grip share one, so they move together. */
type Motion = "type-left" | "type-right" | "draw" | "write"

type Spec = {
  eyes?: "open" | "happy" | "focus" | "jack"
  mouth?: "smile" | "grin" | "small" | "o" | "jack"
  look?: [number, number]
  faceTilt?: number
  hands?: Hand[]
  feet?: "stand" | "hang" | "none"
  shadow?: boolean
  ring?: "band" | "float"
  ribs?: boolean
  cheeks?: boolean
  under?: React.ReactNode
  /** Props sit between the palm and curled fingers. */
  held?: React.ReactNode
  acc?: React.ReactNode
}

/* -------------------------------------------------------------------------- */
/* Props                                                                      */

type Tool = { from: [number, number]; to: [number, number] }

const pencils = {
  design: { from: [106, 60], to: [85, 89] },
  write: { from: [105, 63], to: [83, 92] },
} satisfies Record<"design" | "write", Tool>

const wandShaft: Tool = { from: [96, 86], to: [108, 38] }

/** Place the grip on the shaft itself, so moving a tool moves its hand too. */
function gripOn({ from, to }: Tool, at: number): Hand {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI
  if (angle < -90) angle += 180
  if (angle > 90) angle -= 180
  return {
    x: from[0] + dx * at,
    y: from[1] + dy * at,
    kind: "grip",
    angle,
  }
}

function Pencil({
  from,
  to,
  color = GLOW,
  motion,
}: {
  from: [number, number]
  to: [number, number]
  color?: string
  motion?: Hand["motion"]
}) {
  const [x1, y1] = from
  const [x2, y2] = to
  const deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
  const L = Math.hypot(x2 - x1, y2 - y1)
  return (
    <g data-motion={motion}>
      <g
        transform={`translate(${x1} ${y1}) rotate(${deg})`}
        stroke={INK}
        strokeWidth={1.5}
      >
        <rect x={-2} y={-2.6} width={6} height={5.2} rx={2} fill="#f2a7a0" />
        <rect x={3} y={-2.6} width={L - 12} height={5.2} rx={1} fill={color} />
        <path
          d={`M${L - 9} -2.6 L${L} 0 L${L - 9} 2.6 Z`}
          fill="#f6e7cf"
          strokeLinejoin="round"
        />
        <path
          d={`M${L - 3.2} -1.3 L${L} 0 L${L - 3.2} 1.3 Z`}
          fill={INK}
          stroke="none"
        />
      </g>
    </g>
  )
}

function Sparkle({ x, y, r }: { x: number; y: number; r: number }) {
  const q = r * 0.2
  return (
    <path
      d={`M${x} ${y - r} Q${x + q} ${y - q} ${x + r} ${y} Q${x + q} ${y + q} ${x} ${y + r} Q${x - q} ${y + q} ${x - r} ${y} Q${x - q} ${y - q} ${x} ${y - r} Z`}
      fill={GLOW}
      stroke={INK}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  )
}

// Work surfaces are seen at a low angle, facing Orbit rather than the viewer.
const designPad = (
  <g stroke={INK} strokeLinejoin="round">
    <path
      d="M34 87 L89 78 L107 91 L52 101 Z"
      fill="var(--oat)"
      strokeWidth={1.5}
    />
    <path
      d="M34 85 L89 76 L107 89 L52 99 Z"
      fill="var(--slate-medium)"
      strokeWidth={1.5}
    />
    <path d="M40 85 L87 78 L100 88 L53 96 Z" fill={GLINT} stroke="none" />
    <path
      d="M59 90 Q69 82 85 89"
      stroke="var(--sky)"
      strokeWidth={1.4}
      strokeLinecap="round"
      fill="none"
    />
  </g>
)

const keyboard = (
  <g stroke={INK} strokeLinejoin="round">
    <path
      d="M26 98 H94 V101 Q94 103 92 103 H28 Q26 103 26 101 Z"
      fill="var(--slate-medium)"
      strokeWidth={1.4}
    />
    <path
      d="M34 86 H86 Q88 86 89 88 L95 98 H25 L31 88 Q32 86 34 86 Z"
      fill="var(--oat)"
      strokeWidth={1.4}
    />
    <g fill="var(--slate-medium)" stroke="none">
      {[36, 44, 52, 60, 68, 76, 84].map((x) => (
        <rect key={x} x={x - 2.5} y={89} width={5} height={2} rx={0.6} />
      ))}
      {[33, 42, 51, 60, 69, 78, 87].map((x) => (
        <rect key={x} x={x - 3} y={93} width={6} height={2} rx={0.6} />
      ))}
      <rect x={46} y={97} width={28} height={1.5} rx={0.6} />
    </g>
  </g>
)

const notebook = (
  <g stroke={INK} strokeLinejoin="round" strokeLinecap="round">
    <path
      d="M42 88 L87 79 L104 92 L57 103 Z"
      fill="var(--oat)"
      strokeWidth={1.4}
    />
    <path d="M42 85 L87 76 L104 89 L57 100 Z" fill={GLINT} strokeWidth={1.4} />
    <path d="M48 84 L62 98" stroke="var(--oat)" strokeWidth={1.5} />
    <path
      d="M59 85 L83 80 M63 89 L79 85"
      stroke="var(--oat)"
      strokeWidth={1.1}
    />
    <path
      d="M70 93 l3 -2 l2 1 l3 -2 l2 1 l3 -1"
      strokeWidth={1.2}
      fill="none"
    />
  </g>
)

const sunglasses = (
  <g fill={INK}>
    <path
      d="M38 44.5 L32 42.5 M82 44.5 L88 42.5"
      stroke={INK}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <path d="M38.5 41 H58 Q58.5 51 51 52.5 Q41 53.5 38.5 45 Z" />
    <path d="M62 41 H81.5 L81.5 45 Q79 53.5 69 52.5 Q61.5 51 62 41 Z" />
    <path
      d="M57.5 42.5 Q60 41 62.5 42.5"
      stroke={INK}
      strokeWidth={2.2}
      fill="none"
    />
    <path
      d="M43 43.5 L47 47.5 M66.5 43.5 L70.5 47.5"
      stroke="#fff"
      strokeWidth={1.8}
      strokeLinecap="round"
      opacity={0.7}
    />
  </g>
)

const drink = (
  <g stroke={INK} strokeLinejoin="round">
    <path d="M25 62 L31 46" strokeWidth={2.2} strokeLinecap="round" />
    <path
      d="M12 62 L32 62 L29.5 86 Q29 89 26 89 L18 89 Q15 89 14.5 86 Z"
      fill="#fff"
      fillOpacity={0.85}
      strokeWidth={1.5}
    />
    <path
      d="M13.2 69 L30.8 69 L29.5 86 Q29 88 26 88 L18 88 Q15 88 14.6 86 Z"
      fill="#ffb347"
      stroke="none"
    />
    <circle cx={13} cy={62} r={5} fill="#ffe066" strokeWidth={1.3} />
    <path d="M13 57.5 V66.5 M8.5 62 H17.5" stroke="#e8c33a" strokeWidth={1} />
  </g>
)

const stem = (
  <g>
    <path
      d="M56.5 27.5 Q55.5 19 60.5 14.5 L65 16.5 Q61 20.5 62.5 27.5 Z"
      fill="#5b6b3a"
      stroke="#3d4826"
      strokeWidth={1}
    />
    <path d="M62 21 Q71 11.5 79 17.5 Q71 25.5 62 21 Z" fill="#7d9a4e" />
    <path
      d="M63.5 20.5 Q70 17 76 17.8"
      stroke="#5b6b3a"
      strokeWidth={1}
      fill="none"
    />
  </g>
)

const bucket = (
  <g stroke={INK} strokeLinejoin="round">
    {/* The handle meets both rim pivots and passes through the raised grip. */}
    <path d="M9 82 V76 C9 61 31 61 31 76 V82" strokeWidth={1.8} fill="none" />
    <path
      d="M7 81 H33 L30 101 Q20 105 10 101 Z"
      fill={BODY}
      strokeWidth={1.5}
    />
    <path
      d="M9 83 H31"
      stroke={LIGHT}
      strokeWidth={1.4}
      strokeLinecap="round"
    />
    <path
      d="M13 88 L16 85 L19 88 Z M22 88 L25 85 L28 88 Z"
      fill={INK}
      stroke="none"
    />
    <path
      d="M13 92 L17 94 L20 92 L23 94 L27 92 Q25 98 20 98 Q15 98 13 92 Z"
      fill={INK}
      stroke="none"
    />
    <circle cx={9} cy={82} r={1.3} fill={INK} stroke="none" />
    <circle cx={31} cy={82} r={1.3} fill={INK} stroke="none" />
  </g>
)

const witchHat = (
  <g transform="rotate(-12 60 28)">
    <path
      d="M46 29 Q54 13 62 3 Q70 -4 80 -3 Q70 4 70 12 Q70 22 74 29 Z"
      fill={INK}
    />
    <path
      d="M47.5 25 Q60 22 73 25 L74 29.5 Q60 26.5 46.5 29.5 Z"
      fill="#7a5cc4"
    />
    <rect
      x={57}
      y={23.5}
      width={6}
      height={5}
      rx={1}
      fill="none"
      stroke={GLOW}
      strokeWidth={1.6}
    />
    <ellipse cx={60} cy={30} rx={27} ry={5.5} fill={INK} />
  </g>
)

const wand = (
  <g>
    <path
      d={`M${wandShaft.from.join(" ")} L${wandShaft.to.join(" ")}`}
      stroke="#5a3d2b"
      strokeWidth={3.4}
      strokeLinecap="round"
    />
    <g data-motion="twinkle">
      <Sparkle x={109} y={33} r={8} />
    </g>
    <circle cx={96} cy={22} r={1.6} fill={GLOW} />
    <circle cx={116} cy={38} r={1.3} fill={GLOW} />
  </g>
)

/* -------------------------------------------------------------------------- */
/* Poses                                                                      */

const poses: Record<OrbitPose, Spec> = {
  hello: {
    eyes: "happy",
    mouth: "grin",
    hands: [
      { x: 18, y: 80 },
      { x: 104, y: 30, kind: "wave", angle: -20 },
    ],
  },
  stand: {
    shadow: false,
    hands: [
      { x: 18, y: 80 },
      { x: 102, y: 80, flip: true },
    ],
  },
  sit: {
    look: [-0.6, 0.9],
    feet: "hang",
    shadow: false,
    hands: [
      { x: 30, y: 83, kind: "perch" },
      { x: 90, y: 83, kind: "perch", flip: true },
    ],
  },
  peek: {
    look: [0, 0.4],
    mouth: "o",
    feet: "none",
    shadow: false,
    hands: [
      { x: 39, y: 70, kind: "perch" },
      { x: 81, y: 70, kind: "perch", flip: true },
    ],
  },
  design: {
    look: [1.5, 2],
    faceTilt: 6,
    eyes: "focus",
    mouth: "small",
    hands: [
      { x: 39, y: 86, kind: "perch", angle: -10 },
      { ...gripOn(pencils.design, 0.4), motion: "draw" },
    ],
    held: (
      <>
        {designPad}
        <Pencil {...pencils.design} color="var(--sky)" motion="draw" />
      </>
    ),
  },
  code: {
    look: [0, 2],
    eyes: "focus",
    mouth: "small",
    hands: [
      { x: 43, y: 87, kind: "perch", motion: "type-left" },
      { x: 77, y: 87, kind: "perch", flip: true, motion: "type-right" },
    ],
    held: keyboard,
  },
  write: {
    look: [1.5, 2],
    faceTilt: 6,
    mouth: "small",
    hands: [
      { x: 48, y: 87, kind: "perch", angle: -10 },
      { ...gripOn(pencils.write, 0.4), motion: "write" },
    ],
    held: (
      <>
        {notebook}
        <Pencil {...pencils.write} motion="write" />
      </>
    ),
  },
  summer: {
    eyes: "happy",
    mouth: "grin",
    ring: "float",
    acc: sunglasses,
    hands: [
      { x: 29, y: 77, kind: "grip", angle: 90 },
      { x: 102, y: 34, kind: "wave", angle: -20 },
    ],
    held: drink,
  },
  pumpkin: {
    eyes: "jack",
    mouth: "jack",
    ribs: true,
    acc: stem,
    hands: [
      { x: 20, y: 65, kind: "grip" },
      { x: 101, y: 80, angle: -15 },
    ],
    held: bucket,
  },
  witch: {
    look: [0.6, 0],
    mouth: "grin",
    acc: witchHat,
    hands: [{ x: 22, y: 80 }, gripOn(wandShaft, 1 / 3)],
    held: wand,
  },
  icon: { feet: "none", shadow: false },
}

const viewBoxes: Partial<Record<OrbitPose, string>> = {
  sit: "0 0 120 120",
  peek: "0 0 120 120",
  icon: "4 4 112 112",
}

/* -------------------------------------------------------------------------- */
/* Parts                                                                      */

const RING_BAND =
  "M10 62 a50 13 0 1 0 100 0 a50 13 0 1 0 -100 0 Z M16 62 a44 9.6 0 1 0 88 0 a44 9.6 0 1 0 -88 0 Z"

function Ring({ kind }: { kind: "band" | "float" }) {
  if (kind === "float") {
    return (
      <g transform="rotate(-14 60 62)" fill="none" strokeWidth={9}>
        <ellipse cx={60} cy={62} rx={46} ry={11} stroke="#fff" />
        <ellipse
          cx={60}
          cy={62}
          rx={46}
          ry={11}
          stroke="#e8483a"
          strokeDasharray="13 13"
        />
      </g>
    )
  }
  return (
    <path
      d={RING_BAND}
      fill={INK}
      fillRule="evenodd"
      transform="rotate(-14 60 62)"
    />
  )
}

function Face({ spec }: { spec: Spec }) {
  const [lx, ly] = spec.look ?? [0, 0]
  const ex = [49 + lx * 2, 71 + lx * 2]
  const ey = 46 + ly * 2
  const mx = 60 + lx * 1.5
  const my = 57 + ly * 1.5
  const eyes = spec.eyes ?? "open"
  const mouth = spec.mouth ?? "smile"

  return (
    <>
      {eyes !== "jack" && spec.cheeks !== false && (
        <g fill={SHADE} opacity={0.55}>
          <ellipse cx={41 + lx * 2} cy={55 + ly * 2} rx={4.2} ry={2.5} />
          <ellipse cx={79 + lx * 2} cy={55 + ly * 2} rx={4.2} ry={2.5} />
        </g>
      )}
      <g data-part="eyes">
        {eyes === "jack" ? (
          <path
            d="M43 50 L49 39.5 L55 50 Z M65 50 L71 39.5 L77 50 Z"
            fill={GLOW}
            stroke="#8a3a1c"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        ) : (
          ex.map((x) =>
            eyes === "happy" ? (
              <path
                key={x}
                d={`M${x - 4} ${ey + 1.5} Q${x} ${ey - 4.5} ${x + 4} ${ey + 1.5}`}
                stroke={INK}
                strokeWidth={2.8}
                strokeLinecap="round"
                fill="none"
              />
            ) : eyes === "focus" ? (
              <g key={x}>
                <ellipse cx={x} cy={ey + 0.6} rx={3.7} ry={4.1} fill={INK} />
                <circle
                  cx={x - 1.2 + lx * 0.5}
                  cy={ey - 0.9 + ly * 0.4}
                  r={1.1}
                  fill={GLINT}
                />
                <path
                  d={`M${x - 4.2} ${ey - 4.7} Q${x} ${ey - 5.8} ${x + 4.2} ${ey - 4.2}`}
                  stroke={INK}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            ) : (
              <g key={x}>
                <ellipse cx={x} cy={ey} rx={3.9} ry={4.7} fill={INK} />
                <circle
                  cx={x - 1.3 + lx * 0.4}
                  cy={ey - 1.8}
                  r={1.3}
                  fill={GLINT}
                />
              </g>
            )
          )
        )}
      </g>
      {mouth === "smile" && (
        <path
          d={`M${mx - 5} ${my} Q${mx} ${my + 4.5} ${mx + 5} ${my}`}
          stroke={INK}
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {mouth === "small" && (
        <path
          d={`M${mx - 3} ${my + 1} Q${mx} ${my + 3} ${mx + 3} ${my + 1}`}
          stroke={INK}
          strokeWidth={2.3}
          strokeLinecap="round"
          fill="none"
        />
      )}
      {mouth === "o" && (
        <ellipse cx={mx} cy={my + 1.5} rx={2.6} ry={3.2} fill={INK} />
      )}
      {mouth === "grin" && (
        <>
          <path
            d={`M${mx - 6} ${my - 1} Q${mx} ${my + 8} ${mx + 6} ${my - 1} Z`}
            fill={INK}
          />
          <path
            d={`M${mx - 3} ${my + 3.4} Q${mx} ${my + 1.6} ${mx + 3} ${my + 3.4} Q${mx} ${my + 5.8} ${mx - 3} ${my + 3.4} Z`}
            fill="#f2756a"
          />
        </>
      )}
      {mouth === "jack" && (
        <path
          d="M44 57 L48.5 60.5 L52 57 L56 61.5 L60 57 L64 61.5 L68 57 L71.5 60.5 L76 57 Q73 68 60 68.5 Q47 68 44 57 Z"
          fill={GLOW}
          stroke="#8a3a1c"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      )}
    </>
  )
}

function Hands({
  hands,
  layer = "all",
}: {
  hands: Hand[]
  layer?: "all" | "palm" | "fingers"
}) {
  return hands.map(({ x, y, kind = "rest", angle = 0, flip, motion }) => {
    const gripping = kind === "grip" || kind === "support"
    if (layer === "palm" && !gripping) return null
    if (layer === "fingers" && !gripping) return null

    return (
      <g key={`${x}-${y}`} data-part="hand" data-motion={motion}>
        <g transform={`translate(${x} ${y}) rotate(${angle})`}>
          <g data-part={kind === "wave" ? "wave" : undefined}>
            <g transform={flip ? "scale(-1 1)" : undefined}>
              {gripping ? (
                <>
                  {layer !== "fingers" && (
                    <ellipse cx={0} cy={1} rx={7.3} ry={6.5} fill={BODY} />
                  )}
                  {layer !== "palm" && (
                    <>
                      <path
                        d="M-4 -1 Q-6 -4 -3 -5 Q0 -6 2 -3 L5 -3 Q8 -3 8 1 L8 3 Q8 7 3 7 H-2 Q-7 7 -7 3 Q-7 0 -4 -1 Z"
                        fill={BODY}
                      />
                      <path
                        d="M-3 -1 Q0 1 3 0 M4 2 H7 M3.5 4.5 H6"
                        stroke={SHADE}
                        strokeWidth={1.1}
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M-4 4.5 Q-1 6 2 5.5"
                        stroke={SHADE}
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        fill="none"
                        opacity={0.7}
                      />
                    </>
                  )}
                </>
              ) : kind === "wave" ? (
                <>
                  <path
                    d="M-6 3 L-7 -4 Q-7 -7 -5 -7 Q-3 -7 -3 -4 V-9 Q-3 -12 -1 -12 Q1 -12 1 -9 V-10 Q1 -13 3 -12 Q5 -12 5 -9 V-1 Q9 -5 11 -3 Q13 -1 9 3 L6 7 Q3 10 -1 8 Q-5 7 -6 3 Z"
                    fill={BODY}
                  />
                </>
              ) : kind === "perch" ? (
                <>
                  <path
                    d="M-7 -1 Q-10 -1 -9 -4 Q-8 -6 -5 -4 Q-3 -7 1 -6 Q7 -6 7 -1 V4 Q7 7 4.5 7 Q2.5 7 2.5 5 Q2.5 8 0 8 Q-2 8 -2 5 Q-2 7 -4.5 6.5 Q-7 6 -7 3 Z"
                    fill={BODY}
                  />
                  <path
                    d="M-2 1 V5 M2.5 1 V5"
                    stroke={SHADE}
                    strokeWidth={1.1}
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M-6 2 Q-9 -2 -6 -5 Q-3 -9 2 -6 Q7 -6 7 -1 Q9 4 4 7 Q0 9 -4 6 Z"
                    fill={BODY}
                  />
                </>
              )}
            </g>
          </g>
        </g>
      </g>
    )
  })
}

function Feet({ kind }: { kind: Spec["feet"] }) {
  if (kind === "none") return null
  if (kind === "hang") {
    return [
      [50, 98, 10],
      [70, 100, -8],
    ].map(([x, y, rot]) => (
      <g key={x} transform={`rotate(${rot} ${x} ${y})`}>
        <ellipse cx={x} cy={y} rx={6.2} ry={8.6} fill={BODY} />
        <ellipse
          cx={x - 1.5}
          cy={y + 3}
          rx={3}
          ry={4}
          fill={SHADE}
          opacity={0.5}
        />
      </g>
    ))
  }
  return [47, 73].map((x) => (
    <path
      key={x}
      d={`M${x - 9} 110 Q${x - 9} 101.5 ${x} 101.5 Q${x + 9} 101.5 ${x + 9} 110 Z`}
      fill={BODY}
    />
  ))
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                     */

const { random } = gsap.utils

/**
 * Orbit moves the way Clawd does: at rest it is the still drawing, and every
 * gesture is short and comes back to it. It blinks at uneven intervals, waves
 * once when it comes into view (and again on hover), and works in short
 * bursts with pauses between. Nothing runs off screen or for reduced motion,
 * and the server HTML is already the resting frame.
 */
function useOrbitMotion(
  root: React.RefObject<SVGSVGElement | null>,
  pose: OrbitPose,
  still: boolean
) {
  useGSAP(
    (_, contextSafe) => {
      const svg = root.current
      if (!svg || !contextSafe || still || pose === "icon") return
      const q = gsap.utils.selector(svg)
      const mm = gsap.matchMedia()

      mm.add(motionQuery.ok, () => {
        let alive = true
        let visible = false
        const awake = () => visible && !document.hidden

        // Run `step` now and then, skipping turns while Orbit can't be seen.
        const every = (min: number, max: number, step: () => void) => {
          const tick = contextSafe(() => {
            if (!alive) return
            if (awake()) step()
            gsap.delayedCall(random(min, max), tick)
          })
          gsap.delayedCall(random(min / 2, max), tick)
        }

        const eyes = q("[data-part=eyes]")
        if (eyes.length && pose !== "pumpkin") {
          gsap.set(eyes, { transformOrigin: "50% 50%" })
          every(2.8, 6.4, () => {
            gsap.to(eyes, {
              scaleY: 0.1,
              duration: 0.07,
              ease: "power2.in",
              yoyo: true,
              repeat: Math.random() < 0.2 ? 3 : 1,
            })
          })
        }

        // Pivots at the wrist: a lift, two shakes, and a settle.
        const hand = q("[data-part=wave]")
        const wave = hand.length
          ? gsap
              .timeline({ paused: true })
              .set(hand, { transformOrigin: "30% 100%" })
              .to(hand, { rotation: -16, duration: 0.18, ease: "power2.out" })
              .to(hand, {
                rotation: 10,
                duration: 0.22,
                ease: "sine.inOut",
                yoyo: true,
                repeat: 3,
              })
              .to(hand, { rotation: 0, duration: 0.45, ease: "back.out(2.2)" })
          : undefined
        let waved = false

        const left = q("[data-motion=type-left]")
        const right = q("[data-motion=type-right]")
        if (left.length && right.length) {
          every(1.8, 4.4, () => {
            const keys = gsap.timeline()
            const taps = random(4, 8, 1)
            for (let i = 0; i < taps; i++) {
              keys.to(
                i % 2 ? right : left,
                {
                  y: 1.5,
                  duration: 0.06,
                  ease: "power2.in",
                  yoyo: true,
                  repeat: 1,
                },
                i * 0.11
              )
            }
          })
        }

        // A tool and its grip share a group, so the pencil never slips.
        const draw = q("[data-motion=draw]")
        if (draw.length) {
          every(2, 4.6, () => {
            gsap
              .timeline({ defaults: { duration: 0.2, ease: "sine.inOut" } })
              .to(draw, { x: 2.2, y: -0.5 })
              .to(draw, { x: -0.8, y: 0.3 })
              .to(draw, { x: 1.8, y: -0.3 })
              .to(draw, { x: 0, y: 0, duration: 0.32 })
          })
        }

        const write = q("[data-motion=write]")
        if (write.length) {
          every(2, 4.6, () => {
            const line = gsap.timeline({
              defaults: { duration: 0.12, ease: "sine.inOut" },
            })
            for (let i = 1; i <= 5; i++) {
              line.to(write, { x: i * 0.7, y: i % 2 ? 0.4 : -0.3 })
            }
            line.to(write, { x: 0, y: 0, duration: 0.36, ease: "power2.inOut" })
          })
        }

        const sparkle = q("[data-motion=twinkle]")
        if (sparkle.length) {
          gsap.set(sparkle, { transformOrigin: "50% 50%" })
          every(3, 6.5, () => {
            gsap.to(sparkle, {
              scale: 1.25,
              rotation: 45,
              duration: 0.22,
              ease: "power2.out",
              yoyo: true,
              repeat: 1,
            })
          })
        }

        const sync = contextSafe(() => {
          if (!wave || waved || !awake()) return
          waved = true
          wave.delay(0.3).restart(true)
        })
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting
          sync()
        })
        observer.observe(svg)
        document.addEventListener("visibilitychange", sync)

        const again = contextSafe(() => {
          if (wave && !wave.isActive()) wave.restart()
        })
        svg.addEventListener("pointerenter", again)

        return () => {
          alive = false
          observer.disconnect()
          document.removeEventListener("visibilitychange", sync)
          svg.removeEventListener("pointerenter", again)
        }
      })
    },
    { scope: root, dependencies: [pose, still], revertOnUpdate: true }
  )
}

/* -------------------------------------------------------------------------- */

type OrbitProps = {
  pose?: OrbitPose
  tone?: keyof typeof tones
  /**
   * For poses that sit behind something: `back` draws everything but the
   * hands, `front` only the hands. Stack them around the element in between.
   */
  layer?: "all" | "back" | "front"
  /**
   * Skips Orbit's own blinks and gestures, for a parent that animates it
   * (the Kilo scene) or artwork that should hold still (post art).
   */
  still?: boolean
  /** Accessible name. Without one the drawing is decorative. */
  label?: string
  className?: string
}

export function Orbit({
  pose = "hello",
  tone = "persimmon",
  layer = "all",
  still = false,
  label,
  className,
}: OrbitProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const root = useRef<SVGSVGElement>(null)
  const spec = poses[pose]

  useOrbitMotion(root, pose, still)
  const ring = spec.ring ?? "band"

  return (
    <svg
      ref={root}
      viewBox={viewBoxes[pose] ?? "-8 -12 136 136"}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("overflow-visible", className)}
      style={tones[tone] as React.CSSProperties}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
    >
      <defs>
        <clipPath id={`${id}-body`}>
          <circle cx={60} cy={56} r={30} />
        </clipPath>
        <clipPath id={`${id}-near`}>
          <rect
            x={-40}
            y={62}
            width={200}
            height={80}
            transform="rotate(-14 60 62)"
          />
        </clipPath>
      </defs>

      {layer === "front" ? (
        <Hands hands={spec.hands ?? []} />
      ) : (
        <>
          {spec.shadow !== false && layer === "all" && (
            <ellipse
              cx={60}
              cy={113}
              rx={24}
              ry={3.2}
              fill={INK}
              opacity={0.09}
            />
          )}
          <g>
            {layer === "all" && (
              <g data-part="feet">
                <Feet kind={spec.feet} />
              </g>
            )}
            {spec.under}
            <Ring kind={ring} />
            <circle cx={60} cy={56} r={30} fill={BODY} />
            <g clipPath={`url(#${id}-body)`}>
              <circle cx={60} cy={56} r={30} fill={SHADE} />
              <circle cx={54.5} cy={51} r={30.5} fill={BODY} />
              {spec.ribs && (
                <path
                  d="M51 26 Q42 56 51 86 M69 26 Q78 56 69 86"
                  stroke={SHADE}
                  strokeWidth={2.4}
                  fill="none"
                  opacity={0.75}
                />
              )}
            </g>
            <g
              data-part="face"
              transform={
                spec.faceTilt ? `rotate(${spec.faceTilt} 60 56)` : undefined
              }
            >
              <Face spec={spec} />
            </g>
            <g clipPath={`url(#${id}-near)`}>
              <Ring kind={ring} />
            </g>
            {spec.acc}
            {layer === "all" && (
              <>
                <Hands hands={spec.hands ?? []} layer="palm" />
                {spec.held}
                <Hands
                  hands={(spec.hands ?? []).filter(
                    ({ kind }) => kind !== "grip" && kind !== "support"
                  )}
                />
                <Hands hands={spec.hands ?? []} layer="fingers" />
              </>
            )}
          </g>
        </>
      )}
    </svg>
  )
}
