import { motion, useReducedMotion } from "framer-motion"

import { viewportOnce } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

/**
 * A horizontal proportion bar, shared by the project pages that draw one —
 * Seamark's detector rail and pipeline funnel, TeX's build ladder and timing
 * table. Deliberately plain: a hairline track and a filled span, no gradient,
 * no rounded cap trickery. It reads as a measurement, not a chart.
 *
 * `value` is 0–1. Under reduced motion the bar is simply drawn at its final
 * width — the number is the content, the growth is decoration.
 */
export function Meter({
  value,
  className,
  barClassName,
}: {
  value: number
  className?: string
  barClassName?: string
}) {
  const reduceMotion = useReducedMotion() ?? false
  const width = `${Math.round(value * 100)}%`

  return (
    <div
      className={cn("bg-faded h-1.5 w-full overflow-hidden", className)}
      role="presentation"
    >
      <motion.div
        initial={reduceMotion ? false : { width: 0 }}
        whileInView={{ width }}
        viewport={viewportOnce}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={reduceMotion ? { width } : undefined}
        className={cn("h-full bg-foreground/55", barClassName)}
      />
    </div>
  )
}
