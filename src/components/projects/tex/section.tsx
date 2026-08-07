import { motion } from "framer-motion"

import { fadeUp, staggerContainer, viewportEdge } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

/**
 * A numbered panel on the specimen sheet.
 *
 * Where Seamark's chart section holds its number inline and its bearing at the
 * right margin, this one puts the folio out in the left margin and leaves it
 * there: on a wide screen the number and the measure stay beside the section
 * as it scrolls past, the way a running head does on a set page. Below `lg`
 * there is no margin to put anything in, so the same two labels sit above the
 * title instead.
 */
export function SpecimenSection({
  index,
  title,
  measure,
  lede,
  children,
  className,
}: {
  index: string
  title: string
  /** Mono label held in the margin. Sheet furniture, not information. */
  measure?: string
  lede?: string
  children: React.ReactNode
  className?: string
}) {
  const id = `tex-${index}`

  return (
    <motion.section
      aria-labelledby={id}
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportEdge}
      className={cn(
        "grid scroll-mt-24 grid-cols-1 gap-x-10 lg:grid-cols-[4.5rem_1fr]",
        className
      )}
      id={`section-${index}`}
    >
      {/* The margin folio. Sticky, so the number keeps pointing at the section
          you are actually reading rather than the top of it. */}
      <motion.div
        variants={fadeUp}
        aria-hidden
        className="text-faded hidden font-mono text-detail-xs tabular-nums lg:sticky lg:top-28 lg:block lg:self-start lg:pt-5"
      >
        <p>{index}</p>
        {measure && <p className="mt-2 uppercase">{measure}</p>}
      </motion.div>

      <div>
        <motion.div variants={fadeUp} className="border-faded border-t pt-5">
          <div className="text-faded flex items-baseline justify-between gap-6 font-mono text-detail-xs tabular-nums lg:hidden">
            <span>{index}</span>
            {measure && <span className="uppercase">{measure}</span>}
          </div>
          <h2
            id={id}
            className="mt-3 text-display-l font-semibold text-balance lg:mt-0"
          >
            {title}
          </h2>
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
      </div>
    </motion.section>
  )
}
