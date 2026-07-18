import { motion } from "framer-motion"

import { AboutHero } from "@/components/about/about-hero"
import { Container } from "@/components/layout/container"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"
import { legal } from "@/core/config/legal"

/**
 * Shared furniture for a legal document.
 *
 * The hero is `AboutHero` rather than a copy of it — it's already "eyebrow,
 * heading, lede" and nothing about it is about-specific. Two of them would
 * drift.
 *
 * Prose is styled here with descendant selectors instead of a `<Paragraph>`
 * component per line. These documents are long, and plain `<p>`/`<ul>`/`<a>`
 * inside the sections keeps them readable as text — which matters when the
 * text is the thing under review.
 */

type LegalDocumentProps = {
  page: {
    eyebrow: string
    heading: { before: string; accent: string; after?: string }
    lede: string
  }
  children: React.ReactNode
}

export function LegalDocument({ page, children }: LegalDocumentProps) {
  return (
    <>
      <AboutHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        lede={page.lede}
      />

      <Container className="pb-20 md:pb-28">
        <div className="mx-auto max-w-3xl">
          {/* Dated because a legal document without one can't be relied on —
              and dated from config, so it can't drift from the other three. */}
          <p className="border-faded text-faded border-b pb-6 font-mono text-detail-xs">
            Last updated {legal.effective}
          </p>

          <div className="space-y-12 md:space-y-16">{children}</div>
        </div>
      </Container>
    </>
  )
}

type LegalSectionProps = {
  /** Anchor target — legal text gets linked to section by section. */
  id: string
  title: string
  children: React.ReactNode
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <motion.section
      aria-labelledby={id}
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="scroll-mt-24"
    >
      <motion.h2
        id={id}
        variants={fadeUp}
        className="text-display-s font-semibold text-balance"
      >
        {title}
      </motion.h2>

      <motion.div
        variants={fadeUp}
        className={cnProse}
        // The prose below is authored as plain HTML; see the note above.
      >
        {children}
      </motion.div>
    </motion.section>
  )
}

/**
 * Prose styling for section bodies.
 *
 * `strong` resolves to the foreground colour so an emphasised clause stands
 * out of the muted body — legal text leans on emphasis more than the rest of
 * the site does.
 */
const cnProse = [
  "[&_p]:mt-5 [&_p]:text-paragraph-m [&_p]:text-pretty [&_p]:text-muted-foreground",
  "[&_h3]:mt-8 [&_h3]:text-display-xs [&_h3]:font-semibold [&_h3]:text-foreground",
  "[&_ul]:mt-5 [&_ul]:space-y-2.5 [&_ul]:pl-5 [&_ul]:list-disc",
  "[&_li]:text-paragraph-m [&_li]:text-pretty [&_li]:text-muted-foreground",
  "[&_li]:marker:text-foreground/30",
  "[&_strong]:font-medium [&_strong]:text-foreground",
  "[&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4",
  "[&_a]:decoration-foreground/30 hover:[&_a]:decoration-foreground",
  "[&_a]:transition-colors [&_a]:outline-none",
  "focus-visible:[&_a]:ring-2 focus-visible:[&_a]:ring-ring/50",
].join(" ")
