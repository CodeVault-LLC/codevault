import { cn } from "@/lib/utils"
import { kiloMarkPath, kiloWordmarkPath } from "./artwork"

/** Kilo's horizontal logo: the split K mark and the lowercase wordmark. */
export function KiloLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 250 72"
      role="img"
      aria-label="Kilo"
      className={cn("h-8 w-auto", className)}
    >
      <path
        d={kiloMarkPath}
        transform="translate(0 4)"
        className="fill-clay-strong dark:fill-clay"
      />
      <path
        d={kiloWordmarkPath}
        transform="translate(86 2)"
        fillRule="evenodd"
        className="fill-current"
      />
    </svg>
  )
}
