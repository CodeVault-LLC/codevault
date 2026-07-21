import { cn } from "@/lib/utils"

/**
 * The faint graticule behind the hero and the appendix.
 *
 * Drawn as an SVG pattern in `currentColor` rather than a background gradient
 * so it inherits the foreground token and survives dark mode without a second
 * definition. Purely decorative — hidden from assistive tech.
 */
export function SheetGrid({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 size-full text-foreground/[0.06]",
        className
      )}
    >
      <defs>
        <pattern
          id="sheet-grid"
          width="56"
          height="56"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M56 0 L0 0 0 56"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sheet-grid)" />
    </svg>
  )
}
