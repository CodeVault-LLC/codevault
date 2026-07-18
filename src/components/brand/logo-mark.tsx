import { cn } from "@/lib/utils"
import { site } from "@/core/config/site"
import { LogoGlyph } from "@/components/brand/logo-glyph"

type LogoMarkProps = {
  className?: string
  withWordmark?: boolean
  variant?: "mark" | "badge"
}

/**
 * The horizontal lockup: aperture plus wordmark. Hovering turns the aperture a
 * quarter turn — one step of the loop — which lands back on its own symmetry.
 */
export function LogoMark({
  className,
  withWordmark = true,
  variant = "mark",
}: LogoMarkProps) {
  return (
    <div className={cn("group flex items-center gap-2", className)}>
      <LogoGlyph
        variant={variant}
        className={cn(
          "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:rotate-90",
          "motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
        )}
      />
      {withWordmark && (
        // Optical size: the wordmark is set to sit with the glyph, not with the
        // body copy, so it stays off the fluid type scale.
        <span className="text-[15px] font-semibold tracking-[-0.01em]">
          {site.name}
        </span>
      )}
    </div>
  )
}
