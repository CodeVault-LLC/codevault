import { motion } from "framer-motion"

import { Container } from "@/components/layout/container"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

const steps = [
  {
    title: "Trial",
    body: "We start by just trying it — a prototype, a spike, a weekend build. Something real enough to react to.",
  },
  {
    title: "Experience",
    body: "Then we live with it. What's annoying, what's surprising, what actually matters only shows up once you use the thing.",
  },
  {
    title: "Adjustment",
    body: "We change our minds freely. Most of what we learn arrives after the first version turns out to be wrong.",
  },
  {
    title: "Result",
    body: "Whatever we end up with, we share it — a tool, a write-up, or just a repo. Then we point ourselves at the next thing.",
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
            How we work
          </motion.p>
          <motion.h2
            id="about-title"
            variants={fadeUp}
            className="mt-3 text-display-xl font-semibold text-balance"
          >
            We treat everything as a{" "}
            <span className="font-serif font-normal italic">project</span>.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-6 text-paragraph-l text-pretty text-muted-foreground"
          >
            CodeVault isn't built around a product to sell. We're a small group
            of people curious about too many things to pick just one — so we run
            projects. We try something, live with it, adjust, and share what
            comes out the other side. Sometimes it's useful. Sometimes it's just
            interesting. Always, it's tech.
          </motion.p>
        </motion.div>

        <motion.ol
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="border-faded bg-faded mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 md:grid-cols-4"
        >
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              variants={fadeUp}
              className="bg-ivory-light p-7"
            >
              <span className="text-faded text-detail-xs font-medium tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-display-xs font-semibold">{s.title}</h3>
              <p className="mt-3 text-paragraph-s text-pretty text-muted-foreground">
                {s.body}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </Container>
    </section>
  )
}
