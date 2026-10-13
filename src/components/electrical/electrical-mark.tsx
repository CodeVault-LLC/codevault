import { cn } from "@/lib/utils"

// The CodeVault Electrical symbol, copied from the product's own brand
// source: two square terminals joined by a stepped route around a detached
// obstacle. Keep the geometry identical; the color is ours.
const route =
  "8,85 29,85 29,90 42,90 42,46 49,39 97,39 97,23 120,23 120,45 105,45 105,53 55,53 55,102 29,102 29,107 8,107"
const obstacle = "62,59 79,59 79,86 62,86"

/** The symbol. Decorative: the product name is always set beside it. */
export function ElectricalMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 128 128"
      aria-hidden
      className={cn(
        "size-8 fill-persimmon-strong dark:fill-persimmon",
        className
      )}
    >
      <polygon points={route} />
      <polygon points={obstacle} />
    </svg>
  )
}
