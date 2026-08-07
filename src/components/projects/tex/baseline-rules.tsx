import { cn } from "@/lib/utils"

/**
 * The faint ruling behind the masthead and the appendix.
 *
 * Seamark's sheet is a chart, so its grid is squares. This one is a set page,
 * so it is a baseline grid — horizontal rules at a fixed leading, with two
 * vertical rules standing in for the margins the measure is set to. Drawn in
 * `currentColor` so it inherits the foreground token and survives dark mode
 * without a second definition. Purely decorative.
 */
export function BaselineRules({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 size-full text-foreground/[0.07]",
        className
      )}
    >
      <defs>
        <pattern
          id="tex-baseline"
          width="100%"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="100%"
            y2="0"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#tex-baseline)" />
      {/* The margins. Held in percentages so they track the container rather
          than drifting off a wide viewport. */}
      <line x1="12%" y1="0" x2="12%" y2="100%" stroke="currentColor" />
      <line x1="88%" y1="0" x2="88%" y2="100%" stroke="currentColor" />
    </svg>
  )
}
