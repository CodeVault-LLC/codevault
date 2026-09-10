import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

import { site } from "@/core/config/site"
import { Container } from "@/components/layout/container"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

type AboutFooterLink = {
  label: string
  href: string
  description: string
}

/**
 * "Where to go next" at the foot of an About page.
 *
 * Every page in the cluster ends somewhere deliberate rather than dropping the
 * reader onto the site footer — these pages are read end-to-end more often than
 * they're navigated around.
 */
export function AboutFooterLinks({ links }: { links: AboutFooterLink[] }) {
  return (
    <section aria-labelledby="next-title" className="border-faded border-t">
      <Container className="py-16 md:py-20">
        <h2
          id="next-title"
          className="text-faded text-detail-xs font-medium uppercase"
        >
          {site.presentation.next}
        </h2>

        <motion.ul
          variants={staggerContainer(0.08, 0.05)}
          initial={false}
          whileInView="show"
          viewport={viewportOnce}
          className="mt-6 grid gap-8 md:grid-cols-2 md:gap-16"
        >
          {links.map((link) => (
            <motion.li key={link.href} variants={fadeUp}>
              <Link
                to={link.href}
                className="group flex h-full flex-col border-t border-border py-6 outline-none hover:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center gap-2 text-display-xs font-semibold">
                  {link.label}
                  <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transform-none" />
                </span>
                <span className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                  {link.description}
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  )
}
