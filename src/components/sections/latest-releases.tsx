import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Link } from "@tanstack/react-router"

import { Container } from "@/components/layout/container"
import { homePage, releases } from "@/core/config/site"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

export function LatestReleases() {
  return (
    <section
      id="releases"
      aria-labelledby="releases-title"
      className="border-faded border-y bg-secondary py-20 md:py-28"
    >
      <Container>
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex items-end justify-between gap-8"
        >
          <motion.h2
            id="releases-title"
            variants={fadeUp}
            className="text-display-l text-balance"
          >
            {homePage.recent.title}
          </motion.h2>
          <motion.div variants={fadeUp} className="hidden sm:block">
            <Link
              to="/projects"
              className="group inline-flex min-h-11 items-center gap-2 text-paragraph-s text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {homePage.recent.action}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.ul
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="border-faded mt-10 border-t"
        >
          {releases.map((r) => (
            <motion.li
              key={r.title}
              variants={fadeUp}
              className="border-faded border-b"
            >
              <a
                href={r.href}
                className="group grid min-h-28 items-center gap-3 py-6 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset md:grid-cols-12 md:gap-6 md:py-8"
              >
                <time className="text-detail-xs text-muted-foreground md:col-span-3">
                  {r.date}
                </time>
                <h3 className="text-display-m text-balance md:col-span-8">
                  {r.title}
                </h3>
                <ArrowRight className="size-5 text-muted-foreground transition-[translate,color] duration-200 group-hover:translate-x-1 group-hover:text-foreground motion-reduce:transition-none md:col-span-1 md:justify-self-end" />
              </a>
            </motion.li>
          ))}
        </motion.ul>
        <Link
          to="/projects"
          className="group mt-7 inline-flex min-h-11 items-center gap-2 text-paragraph-s text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none sm:hidden"
        >
          {homePage.recent.action}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
        </Link>
      </Container>
    </section>
  )
}
