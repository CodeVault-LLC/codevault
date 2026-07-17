import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

import { Container } from "@/components/layout/container"
import { releases } from "@/core/config/site"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

export function LatestReleases() {
  return (
    <section
      id="releases"
      aria-labelledby="releases-title"
      className="border-faded border-y bg-ivory-medium py-20 md:py-28"
    >
      <Container>
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <motion.p
              variants={fadeUp}
              className="text-faded text-detail-xs font-medium uppercase"
            >
              Recent projects
            </motion.p>
            <motion.h2
              id="releases-title"
              variants={fadeUp}
              className="mt-3 max-w-xl text-display-l font-semibold text-balance"
            >
              What we've been trying lately.
            </motion.h2>
          </div>
          <motion.a
            variants={fadeUp}
            href="#github"
            className="group inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-foreground"
          >
            Everything on GitHub
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </motion.a>
        </motion.div>

        <motion.ul
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="border-faded bg-faded mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border md:grid-cols-3"
        >
          {releases.map((r) => (
            <motion.li
              key={r.title}
              variants={fadeUp}
              className="group flex flex-col bg-oat p-7 transition-colors hover:bg-[#dcd2bd]"
            >
              <p className="text-faded text-detail-xs font-medium uppercase">
                {r.category} · {r.date}
              </p>
              <h3 className="mt-3 text-display-s font-semibold text-balance">
                {r.title}
              </h3>
              <p className="mt-3 grow text-paragraph-s text-foreground/75">
                {r.description}
              </p>
              <a
                href={r.href}
                className="mt-6 inline-flex items-center gap-1.5 text-paragraph-s font-medium underline-offset-4 group-hover:underline"
              >
                Take a look
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  )
}
