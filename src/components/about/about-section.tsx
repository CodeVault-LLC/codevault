import { motion } from "framer-motion"

import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

type AboutSectionProps = {
  index: string
  label: string
  title: string
  /** Optional — plenty of sections say enough with a heading alone. */
  body?: string[]
  /** Rendered after the prose, inside the right-hand column. */
  children?: React.ReactNode
  className?: string
}

/**
 * A numbered section with a left rail — the "dossier furniture" that carries
 * the mission-report feel without turning the page into a spec sheet.
 *
 * The rail stacks above the prose on mobile (where a 8rem column would strand
 * the body text in a gutter) and sits beside it from `md` up.
 */
export function AboutSection({
  index,
  label,
  title,
  body,
  children,
  className,
}: AboutSectionProps) {
  const headingId = `section-${index}`

  return (
    <motion.section
      aria-labelledby={headingId}
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={cn("border-faded border-t pt-10 md:pt-14", className)}
    >
      <div className="grid gap-5 md:grid-cols-[7rem_1fr] md:gap-12">
        <motion.div
          variants={fadeUp}
          className="flex items-baseline gap-3 md:flex-col md:gap-1.5"
        >
          <span className="text-faded font-mono text-detail-xs tabular-nums">
            {index}
          </span>
          <span className="text-faded text-detail-xs font-medium uppercase">
            {label}
          </span>
        </motion.div>

        <div className="max-w-2xl">
          <motion.h2
            id={headingId}
            variants={fadeUp}
            className="text-display-m font-semibold text-balance"
          >
            {title}
          </motion.h2>

          {body?.map((paragraph) => (
            <motion.p
              key={paragraph}
              variants={fadeUp}
              className="mt-5 text-paragraph-m text-pretty text-muted-foreground"
            >
              {paragraph}
            </motion.p>
          ))}

          {children}
        </div>
      </div>
    </motion.section>
  )
}
