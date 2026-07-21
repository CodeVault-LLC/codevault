import { motion } from "framer-motion"

import { fadeUp, staggerContainer, viewportEdge } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

/**
 * A numbered section on the chart sheet.
 *
 * The header borrows the anatomy of a chart panel: a rule across the full
 * measure, the sheet number at the left margin, and an optional bearing label
 * held at the right — the place a chart puts its scale or its datum. The rule
 * is the only decoration; everything below it is type.
 */
export function ChartSection({
  index,
  title,
  bearing,
  lede,
  children,
  className,
}: {
  index: string
  title: string
  /** Mono label held at the right margin. Chart furniture, not information. */
  bearing?: string
  lede?: string
  children: React.ReactNode
  className?: string
}) {
  const id = `seamark-${index}`

  return (
    <motion.section
      aria-labelledby={id}
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportEdge}
      className={cn("scroll-mt-24", className)}
      id={`section-${index}`}
    >
      <motion.div
        variants={fadeUp}
        className="border-faded flex items-baseline justify-between gap-6 border-t pt-5"
      >
        <div className="flex items-baseline gap-4 md:gap-6">
          <span className="text-faded font-mono text-detail-xs tabular-nums">
            {index}
          </span>
          <h2 id={id} className="text-display-m font-semibold text-balance">
            {title}
          </h2>
        </div>
        {bearing && (
          <span className="text-faded hidden shrink-0 font-mono text-detail-xs uppercase tabular-nums sm:inline">
            {bearing}
          </span>
        )}
      </motion.div>

      {lede && (
        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-3xl text-paragraph-m text-pretty text-muted-foreground"
        >
          {lede}
        </motion.p>
      )}

      <motion.div variants={fadeUp} className="mt-8">
        {children}
      </motion.div>
    </motion.section>
  )
}
