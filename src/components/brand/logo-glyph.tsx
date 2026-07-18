import { cn } from "@/lib/utils"

/**
 * The CodeVault aperture.
 *
 * Four identical blades in 90° rotational symmetry, swept so the mark reads as
 * an iris mid-turn rather than a static pie. Four blades because a project is
 * a four-step loop (trial, experience, adjustment, result); rotational because
 * the loop repeats; open in the middle because we don't know how it lands.
 *
 * Geometry is fixed on a 32×32 grid: outer radius 12.3, opening inradius 5.9,
 * each blade spanning 62° and leading its outer edge by 32°. The 1.6 stroke is
 * drawn in the fill color purely to round the corners — it is not an outline,
 * and changing it changes the silhouette.
 */
const BLADE = "M12.3 0A12.3 12.3 0 0 1 5.775 10.86L-.412 5.886L5.003 3.127Z"
const ANGLES = [0, 90, 180, 270]

type BladesProps = {
  scale?: number
  className?: string
}

function Blades({ scale = 1, className }: BladesProps) {
  return (
    <g
      transform={`translate(16 16) scale(${scale})`}
      strokeWidth={1.6}
      strokeLinejoin="round"
      className={className}
    >
      {ANGLES.map((angle) => (
        <path key={angle} transform={`rotate(${angle})`} d={BLADE} />
      ))}
    </g>
  )
}

type LogoGlyphProps = {
  className?: string
  /**
   * `mark` — the bare aperture in `currentColor`. The default, and what should
   * appear inside the site.
   * `badge` — the aperture knocked out of a filled rounded square. For places
   * that need the mark to hold its own shape: avatars, app tiles, favicons.
   */
  variant?: "mark" | "badge"
}

export function LogoGlyph({ className, variant = "mark" }: LogoGlyphProps) {
  if (variant === "badge") {
    return (
      <svg
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("size-6", className)}
        aria-hidden
      >
        <rect width="32" height="32" rx="8.5" className="fill-foreground" />
        <Blades scale={0.78} className="fill-background stroke-background" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6", className)}
      aria-hidden
    >
      <Blades className="fill-current stroke-current" />
    </svg>
  )
}
