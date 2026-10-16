import type { ArtKey, Tone } from "@/core/config/news"
import { cn } from "@/lib/utils"

const toneClass: Record<Tone, string> = {
  persimmon: "bg-persimmon",
  oat: "bg-oat",
  sky: "bg-sky",
  olive: "bg-olive",
  cactus: "bg-cactus",
  heather: "bg-heather",
}

/**
 * A post's illustration: ink line work on a flat swatch. The swatches and ink
 * stay the same in dark mode, like printed artwork would.
 */
export function PostArt({
  art,
  tone,
  className,
}: {
  art: ArtKey
  tone: Tone
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        toneClass[tone],
        className
      )}
    >
      <svg
        viewBox="0 0 400 300"
        className="h-full w-full"
        fill="none"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ART[art]}
      </svg>
    </div>
  )
}

const INK = "#141413"
const PAPER = "#faf9f5"

/**
 * A conduit route: an ink casing with a paper core, so it reads over walls
 * and on every swatch. Corners are rounded, the way an elbow bends.
 */
function Route({ d, faded = false }: { d: string; faded?: boolean }) {
  if (faded)
    return <path d={d} strokeWidth={2.5} strokeDasharray="2 7" opacity={0.55} />
  return (
    <g>
      <path d={d} strokeWidth={9} />
      <path d={d} strokeWidth={4} stroke={PAPER} />
    </g>
  )
}

/** A device or board: a paper square on the route's end. */
function Terminal({
  x,
  y,
  w = 20,
  h = 20,
  board = false,
}: {
  x: number
  y: number
  w?: number
  h?: number
  board?: boolean
}) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={PAPER} />
      {board && (
        <path
          d={`M${x - w / 2} ${y - h / 2} H${x + w / 2} L${x - w / 2} ${y + h / 2} Z`}
          fill={INK}
        />
      )}
    </g>
  )
}

/** Where a route passes through a wall: a sleeve straddling it. */
function Sleeve({
  x,
  y,
  vertical = false,
}: {
  x: number
  y: number
  vertical?: boolean
}) {
  const [w, h] = vertical ? [24, 30] : [30, 24]
  return (
    <rect
      x={x - w / 2}
      y={y - h / 2}
      width={w}
      height={h}
      rx={2}
      strokeWidth={2.5}
    />
  )
}

/** Ductwork overhead, drawn dashed. A diffuser is crossed. */
function Duct({
  x,
  y,
  w,
  h,
  diffuser = false,
}: {
  x: number
  y: number
  w: number
  h: number
  diffuser?: boolean
}) {
  return (
    <g strokeWidth={1.75} strokeDasharray="7 6">
      <rect x={x} y={y} width={w} height={h} />
      {diffuser && (
        <path
          d={`M${x} ${y} L${x + w} ${y + h} M${x + w} ${y} L${x} ${y + h}`}
        />
      )}
    </g>
  )
}

const ART: Record<ArtKey, React.ReactNode> = {
  tray: (
    <>
      {/* Under the slab: a cable tray, a duct, and three devices dropping up
          into the tray's bottom, one of them around the duct */}
      <path d="M20 34 H380" strokeWidth={5} strokeLinecap="square" />
      <path d="M70 62 V82 H350 V62" strokeWidth={3.5} />
      <Duct x={90} y={110} w={80} h={44} />
      <Route d="M130 228 V200 Q130 186 144 186 H176 Q190 186 190 172 V86" />
      <Route d="M240 228 V86" />
      <Route d="M320 228 V86" />
      <Terminal x={130} y={240} />
      <Terminal x={240} y={240} />
      <Terminal x={320} y={240} />
    </>
  ),
  electrical: (
    <>
      {/* Two rooms, a diffuser overhead, and one run between two devices,
          through the wall between them */}
      <path d="M40 48 H360 V256 H40 Z" strokeWidth={6} strokeLinecap="square" />
      <path
        d="M216 48 V96 M216 150 V256"
        strokeWidth={6}
        strokeLinecap="square"
      />
      <path d="M216 150 H262 M262 150 A54 54 0 0 0 216 96" strokeWidth={2} />
      <Duct x={92} y={90} w={78} h={66} diffuser />
      <Route d="M92 212 H272 Q292 212 292 192 V132 Q292 112 312 112 H316" />
      <Sleeve x={216} y={212} />
      <Terminal x={86} y={212} />
      <Terminal x={322} y={112} />
    </>
  ),
  ab: (
    <>
      {/* A box in a room to the board in the corridor: past the duct's end,
          through one wall */}
      <path d="M30 40 H370 V262 H30 Z" strokeWidth={6} strokeLinecap="square" />
      <path
        d="M30 168 H262 M300 168 H370 M180 40 V168"
        strokeWidth={4}
        strokeLinecap="square"
      />
      <path d="M300 168 V130 M300 130 A38 38 0 0 0 262 168" strokeWidth={2} />
      <Duct x={86} y={184} w={214} h={22} />
      <Route d="M336 98 V218 Q336 232 322 232 H72" />
      <Sleeve x={336} y={168} vertical />
      <Terminal x={336} y={92} />
      <Terminal x={56} y={232} w={16} h={36} board />
      <circle cx={112} cy={104} r={13} />
      <path
        d="M102.8 94.8 l18.4 18.4 M121.2 94.8 l-18.4 18.4"
        strokeWidth={1.75}
      />
    </>
  ),
  clearance: (
    <>
      {/* Around what's set to Avoid, through what may be passed */}
      <path d="M262 30 V270 M290 30 V270" strokeWidth={2.5} />
      <path
        d="M262 60 L290 32 M262 100 L290 72 M262 140 L290 112 M262 180 L290 152 M262 220 L290 192 M262 260 L290 232"
        strokeWidth={1.25}
        opacity={0.6}
      />
      <Duct x={70} y={120} w={150} h={46} />
      <rect x={176} y={208} width={22} height={22} fill={INK} />
      <Route d="M48 196 H226 Q240 196 240 182 V100 Q240 86 254 86 H352" />
      <rect
        x={252}
        y={74}
        width={48}
        height={24}
        fill="none"
        stroke={PAPER}
        strokeWidth={2}
      />
      <Terminal x={42} y={196} />
      <Terminal x={358} y={86} />
    </>
  ),
  openings: (
    <>
      {/* A wall, seen face on: two boxes, joined over the top. The route
          they used to get, under the floor, is ghosted below. */}
      <path d="M20 232 H380" strokeWidth={5} strokeLinecap="square" />
      <path d="M20 46 H380" strokeWidth={2.5} strokeDasharray="10 8" />
      <Route
        d="M124 206 V256 Q124 270 138 270 H262 Q276 270 276 256 V206"
        faded
      />
      <Route d="M124 152 V96 Q124 82 138 82 H262 Q276 82 276 96 V152" />
      <rect x={106} y={152} width={36} height={46} fill={PAPER} />
      <rect x={258} y={152} width={36} height={46} fill={PAPER} />
      <path d="M118 152 v-8 h12 v8 M270 152 v-8 h12 v8" strokeWidth={2} />
      <path d="M118 198 v8 h12 v-8 M270 198 v8 h12 v-8" strokeWidth={2} />
    </>
  ),
  fittings: (
    <>
      {/* A run with two elbows: each fitting marked where it starts and
          ends, and the straight runs between them dimensioned */}
      <Route d="M66 226 H176 Q216 226 216 186 V126 Q216 86 256 86 H334" />
      <g strokeWidth={2}>
        <path d="M176 214 v24 M204 186 h24" />
        <path d="M204 126 h24 M256 74 v24" />
      </g>
      <g strokeWidth={1.5} opacity={0.75}>
        <path d="M66 258 H176 M66 250 v16 M176 250 v16" />
        <path d="M60 264 l12 -12 M170 264 l12 -12" />
        <path d="M252 126 V186 M244 126 h16 M244 186 h16" />
        <path d="M246 132 l12 -12 M246 192 l12 -12" />
        <path d="M256 50 H334 M256 42 v16 M334 42 v16" />
        <path d="M250 56 l12 -12 M328 56 l12 -12" />
      </g>
      <Terminal x={56} y={226} />
      <Terminal x={344} y={86} />
    </>
  ),
  ribbon: (
    <>
      {/* A Revit window: tabs, our tab open, its tools, and a route in the
          view below */}
      <rect x={30} y={44} width={340} height={212} rx={6} fill={PAPER} />
      <path d="M30 76 H370 M30 140 H370" strokeWidth={2} />
      <path d="M48 62 h40 M106 62 h40" strokeWidth={2} opacity={0.5} />
      <rect x={160} y={52} width={92} height={24} rx={3} strokeWidth={2.5} />
      <path d="M172 64 h68" strokeWidth={2} />
      <path d="M232 86 V130 M300 86 V130" strokeWidth={1.5} opacity={0.5} />
      {/* Route A→B */}
      <path d="M54 118 H70 V100 H86" strokeWidth={3} />
      <rect x={48} y={113} width={10} height={10} fill={INK} />
      <rect x={84} y={95} width={10} height={10} fill={INK} />
      {/* Connect Devices */}
      <path d="M118 110 H134 V96 H150 M134 110 V124 H150" strokeWidth={3} />
      <rect x={110} y={105} width={10} height={10} fill={INK} />
      <rect x={148} y={91} width={10} height={10} fill={INK} />
      <rect x={148} y={119} width={10} height={10} fill={INK} />
      {/* Settings */}
      <path d="M250 98 h34 M250 110 h34 M250 122 h34" strokeWidth={2} />
      <circle cx={260} cy={98} r={4} fill={PAPER} />
      <circle cx={276} cy={110} r={4} fill={PAPER} />
      <circle cx={264} cy={122} r={4} fill={PAPER} />
      {/* Support */}
      <circle cx={330} cy={106} r={10} />
      <path d="M337 113 l9 9" strokeWidth={3} />
      {/* The view */}
      <Duct x={150} y={164} w={70} h={34} />
      <Route d="M96 226 H232 Q248 226 248 210 V176 Q248 160 264 160 H300" />
      <Terminal x={88} y={226} w={16} h={16} />
      <Terminal x={308} y={160} w={16} h={16} />
    </>
  ),
  box: (
    <>
      {/* One box, its openings in order: top first, then the sides, the
          bottom last */}
      <path d="M40 270 H360" strokeWidth={5} strokeLinecap="square" />
      <rect x={150} y={120} width={100} height={110} fill={PAPER} />
      <path d="M172 120 v-10 h16 v10 M212 120 v-10 h16 v10" strokeWidth={2} />
      <path d="M150 162 h-10 v16 h10 M250 162 h10 v16 h-10" strokeWidth={2} />
      <path
        d="M172 230 v10 h16 v-10 M212 230 v10 h16 v-10"
        strokeWidth={2}
        strokeDasharray="3 4"
      />
      <Route d="M180 110 V64 Q180 44 200 44 H352" />
      <Route d="M260 170 H300" faded />
      <Route d="M180 240 V262" faded />
    </>
  ),
}
