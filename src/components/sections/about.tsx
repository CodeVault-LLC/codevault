import { motion } from "framer-motion"

import { Container } from "@/components/layout/container"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

const values = [
  {
    title: "Less ceremony",
    body: "Code review, builds, deploys, and observability in one place — without a stack of vendors to manage.",
  },
  {
    title: "Respect for the craft",
    body: "Tools that get out of the way, so the people writing the code can stay in flow.",
  },
  {
    title: "A platform you can trust",
    body: "Reproducible builds, immutable audit logs, and the option to run on your own infrastructure.",
  },
]

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
          className="mx-auto max-w-3xl"
        >
          <motion.p
            variants={fadeUp}
            className="text-faded text-detail-xs font-medium uppercase"
          >
            What we are working toward
          </motion.p>
          <motion.h2
            id="about-title"
            variants={fadeUp}
            className="mt-3 text-display-xl font-semibold text-balance"
          >
            We are building the platform we always wanted as{" "}
            <span className="font-serif font-normal italic">engineers</span>.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-6 text-paragraph-l text-pretty text-muted-foreground"
          >
            CodeVault started with a simple question: why does shipping a change
            still feel this hard? We are a small team of programmers who have
            spent our careers building developer tools, and we are here to make
            the daily work of software teams calmer, faster, and more honest.
          </motion.p>
        </motion.div>

        <motion.ul
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="border-faded bg-faded mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border md:grid-cols-3"
        >
          {values.map((v) => (
            <motion.li
              key={v.title}
              variants={fadeUp}
              className="bg-ivory-light p-7"
            >
              <h3 className="text-display-xs font-semibold">{v.title}</h3>
              <p className="mt-3 text-paragraph-s text-pretty text-muted-foreground">
                {v.body}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  )
}
