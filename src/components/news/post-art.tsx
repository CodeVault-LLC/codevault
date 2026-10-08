import type { ArtKey, Tone } from "@/core/config/news"
import { cn } from "@/lib/utils"
import { LogoGlyph } from "@/components/brand/logo-glyph"
import { Orbit, orbitFoot } from "@/components/brand/orbit"

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
      {art === "fresh" ? (
        <LogoGlyph className="size-[38%] text-slate" />
      ) : (
        <svg
          viewBox="0 0 400 300"
          className="h-full w-full"
          fill="none"
          stroke="#141413"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ART[art]}
        </svg>
      )}
    </div>
  )
}

/**
 * Orbit standing with its feet at (x, y), held still like printed artwork.
 * `size` is the drawing's width; the ink and stroke above don't reach it.
 */
function Mascot({ x, y, size = 136 }: { x: number; y: number; size?: number }) {
  // Orbit's viewBox is 136 units from (-8, -12).
  const k = size / 136
  return (
    <svg
      x={x - (orbitFoot.x + 8) * k}
      y={y - (orbitFoot.y + 12) * k}
      width={size}
      height={size}
      overflow="visible"
      fill="#141413"
      stroke="none"
    >
      <Orbit tone="ivory" still />
    </svg>
  )
}

/** An isometric box whose front-bottom corner stands at (x, y). */
function Box({
  x,
  y,
  w,
  d,
  h,
  dashed = true,
}: {
  x: number
  y: number
  w: number
  d: number
  h: number
  dashed?: boolean
}) {
  const p = (px: number, py: number, pz: number) =>
    `${x + (px - py - (w - d)) * 0.866},${y - pz + (px + py - w - d) * 0.5}`
  const line = (...pts: string[]) => pts.join(" ")
  return (
    <g>
      <polygon points={line(p(0, 0, h), p(w, 0, h), p(w, d, h), p(0, d, h))} />
      <polyline
        points={line(
          p(0, d, h),
          p(0, d, 0),
          p(w, d, 0),
          p(w, 0, 0),
          p(w, 0, h)
        )}
      />
      <polyline points={line(p(w, d, 0), p(w, d, h))} />
      {dashed && (
        <g strokeDasharray="4 6" strokeWidth={1.5} opacity={0.45}>
          <polyline points={line(p(0, 0, h), p(0, 0, 0), p(w, 0, 0))} />
          <polyline points={line(p(0, 0, 0), p(0, d, 0))} />
        </g>
      )}
    </g>
  )
}

const ART: Record<Exclude<ArtKey, "fresh">, React.ReactNode> = {
  kilo: (
    <>
      <path d="M20 232 A 520 520 0 0 1 380 232" />
      <Mascot x={200} y={202} size={190} />
    </>
  ),
  assistant: (
    <>
      <Box x={150} y={250} w={150} d={90} h={95} />
      {/* A suggested fitting, highlighted the way Kilo shows proposals */}
      <circle cx={113} cy={196} r={9} stroke="#faf9f5" strokeDasharray="3 4" />
      <path
        d="M232 70 h120 a14 14 0 0 1 14 14 v42 a14 14 0 0 1 -14 14 h-78 l-20 18 v-18 h-22 a14 14 0 0 1 -14 -14 v-42 a14 14 0 0 1 14 -14 z"
        fill="#faf9f5"
      />
      <path d="M248 96 h88 M248 114 h58" />
    </>
  ),
  viewport: (
    <>
      {/* Plan */}
      <rect x={40} y={80} width={140} height={140} rx={2} />
      <path d="M40 150 h80 M120 80 v140 M120 186 h60" />
      <circle cx={80} cy={115} r={8} />
      <path d="M74.5 109.5 l11 11 M85.5 109.5 l-11 11" strokeWidth={1.75} />
      {/* 3D */}
      <Box x={290} y={236} w={120} d={80} h={86} />
      <circle cx={288} cy={142} r={6} fill="#faf9f5" />
    </>
  ),
  revit: (
    <>
      <path d="M120 50 h110 l40 40 v160 h-150 z" fill="#faf9f5" />
      <path d="M230 50 v40 h40" />
      {[112, 138, 164, 190, 216].map((y, i) => (
        <path key={y} d={`M144 ${y} h${[96, 70, 102, 58, 84][i]}`} />
      ))}
      <path
        d="M270 140 C 310 140 310 112 350 112 M270 170 h80 M270 200 C 310 200 310 228 350 228"
        strokeWidth={2}
      />
    </>
  ),
  foundation: (
    <>
      <Box x={200} y={270} w={170} d={100} h={70} />
      <Box x={200} y={200} w={170} d={100} h={70} dashed={false} />
      <path d="M150 103 l20 -12 l20 12" strokeWidth={2} />
    </>
  ),
}
