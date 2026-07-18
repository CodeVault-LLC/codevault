import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

import { AboutHero } from "@/components/about/about-hero"
import { Container } from "@/components/layout/container"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"
import { legal, legalPages } from "@/core/config/legal"

/**
 * The /legal landing page: four cards and a date. Nothing else — an index of
 * legal documents that needs its own introduction has the wrong documents.
 */

const documents = [
  {
    label: "Privacy",
    href: "/legal/privacy",
    description:
      "What we collect, how long we keep it, and what you can ask us to do with it.",
  },
  {
    label: "Terms",
    href: "/legal/terms",
    description:
      "What the archive is, who owns what, and the few things we ask you not to do.",
  },
  {
    label: "Cookies",
    href: "/legal/cookies",
    description: "One cookie, only if you sign in, and why there's no banner.",
  },
  {
    label: "Security",
    href: "/legal/security",
    description:
      "How to report a vulnerability, what's in scope, and what to expect back.",
  },
]

export function LegalIndex() {
  return (
    <>
      <AboutHero
        eyebrow={legalPages.index.eyebrow}
        heading={legalPages.index.heading}
        lede={legalPages.index.lede}
      />

      <Container className="pb-20 md:pb-28">
        <motion.ul
          variants={staggerContainer(0.08, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-4 md:grid-cols-2"
        >
          {documents.map((document) => (
            <motion.li key={document.href} variants={fadeUp}>
              <Link
                to={document.href}
                className="group border-faded flex h-full flex-col rounded-2xl border p-6 transition-[background-color,transform] duration-300 ease-out outline-none hover:-translate-y-0.5 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:hover:translate-y-0 md:p-7"
              >
                <span className="flex items-center gap-2 text-display-xs font-semibold">
                  {document.label}
                  <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                </span>
                <span className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                  {document.description}
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>

        <p className="text-faded mt-8 font-mono text-detail-xs">
          All four last updated {legal.effective}
        </p>
      </Container>
    </>
  )
}
