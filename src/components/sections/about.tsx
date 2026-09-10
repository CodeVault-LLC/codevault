import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Link } from "@tanstack/react-router"

import { Container } from "@/components/layout/container"
import { homePage } from "@/core/config/site"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"
// Shared with /about, which renders the same four steps with `detail` expanded.
import { projectLoop as steps } from "@/core/config/about"

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="py-24 md:py-32"
    >
      <Container>
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-8 md:grid-cols-12 md:items-end"
        >
          <motion.h2
            id="about-title"
            variants={fadeUp}
            className="max-w-4xl text-display-xl text-balance md:col-span-8"
          >
            {homePage.process.title}
          </motion.h2>
          <motion.div variants={fadeUp} className="md:col-span-4 md:pb-2">
            <p className="text-paragraph-m text-muted-foreground">
              {homePage.process.introduction}
            </p>
            <Link
              to="/about"
              className="group mt-4 inline-flex min-h-11 items-center gap-2 text-paragraph-s font-medium underline decoration-foreground/25 underline-offset-8 transition-[text-decoration-color] hover:decoration-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {homePage.process.action}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.ol
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="border-faded mt-14 grid border-t md:grid-cols-2"
        >
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              variants={fadeUp}
              className="border-faded grid grid-cols-[2.5rem_1fr] gap-3 border-b py-7 md:gap-5 md:py-9 md:odd:pr-10 md:even:border-l md:even:pl-10"
            >
              <span className="pt-1 text-detail-xs text-muted-foreground tabular-nums">
                {i + 1}
              </span>
              <div>
                <h3 className="text-display-s">{s.title}</h3>
                <p className="mt-2 max-w-sm text-paragraph-s text-pretty text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </Container>
    </section>
  )
}
