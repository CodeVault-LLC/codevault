import { cn } from "@/lib/utils"

/**
 * Scout — the small lander we send out ahead of a project.
 *
 * Same geometry family as the logo: its eye *is* the aperture, so the mascot
 * and the mark are the same object at two scales. Drawn monoline in
 * `currentColor` so it stays quiet next to body copy and survives dark mode.
 *
 * Scout is decorative by default. Give it a `label` only when it is carrying
 * meaning on its own (an empty state with no other explanation).
 */
const BLADE = "M12.3 0A12.3 12.3 0 0 1 5.775 10.86L-.412 5.886L5.003 3.127Z"
const ANGLES = [0, 90, 180, 270]

type ScoutProps = {
  className?: string
  label?: string
}

export function Scout({ className, label }: ScoutProps) {
  return (
    <svg
      viewBox="6 3 52 52"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-16", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* chassis */}
        <rect x="16" y="15" width="32" height="29" rx="13.5" />
        {/* dish arcs — listening in both directions */}
        <path d="M10.5 24c-2.6 2.2-2.6 11.8 0 14M53.5 24c2.6 2.2 2.6 11.8 0 14" />
        {/* antenna */}
        <path d="M32 15V9" />
        <circle cx="32" cy="7.4" r="2" fill="currentColor" />
        {/* landing legs */}
        <path d="M24.5 44l-3.5 7M39.5 44l3.5 7" />
      </g>
      {/* the eye is the mark: 9.4 / 13 of the logo's effective radius */}
      <g
        transform="translate(32 29.5) scale(0.7231)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
      >
        {ANGLES.map((angle) => (
          <path key={angle} transform={`rotate(${angle})`} d={BLADE} />
        ))}
      </g>
    </svg>
  )
}
