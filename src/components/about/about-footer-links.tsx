import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

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
          Next
        </h2>

        <motion.ul
          variants={staggerContainer(0.08, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          {links.map((link) => (
            <motion.li key={link.href} variants={fadeUp}>
              <Link
                to={link.href}
                className="group border-faded flex h-full flex-col rounded-2xl border p-6 transition-[background-color,transform] duration-300 ease-out outline-none hover:-translate-y-0.5 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:hover:translate-y-0 md:p-7"
              >
                <span className="flex items-center gap-2 text-display-xs font-semibold">
                  {link.label}
                  <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
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
