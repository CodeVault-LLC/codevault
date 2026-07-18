import { motion } from "framer-motion"

import { Container } from "@/components/layout/container"
import { fadeUp, staggerContainer } from "@/core/lib/motion"
import type { Heading } from "@/core/config/about"

type AboutHeroProps = {
  eyebrow: string
  heading: Heading
  lede: string
}

/**
 * The opening of every About page: eyebrow, display heading, lede.
 *
 * Left-aligned inside a centred measure, matching the homepage's About section
 * rather than its hero — these are reading pages, and a centred column of
 * long-form prose is harder to scan than a ragged-right one.
 */
export function AboutHero({ eyebrow, heading, lede }: AboutHeroProps) {
  return (
    <section
      aria-labelledby="page-title"
      className="pt-14 pb-12 md:pt-20 md:pb-16"
    >
      <Container>
        <motion.div
          variants={staggerContainer(0.08, 0.05)}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-3xl"
        >
          <motion.p
            variants={fadeUp}
            className="text-faded text-detail-xs font-medium uppercase"
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            id="page-title"
            variants={fadeUp}
            className="mt-4 text-display-xl font-semibold text-balance"
          >
            {heading.before}
            <span className="font-serif font-normal italic">
              {heading.accent}
            </span>
            {heading.after}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-paragraph-l text-pretty text-muted-foreground"
          >
            {lede}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  )
}
