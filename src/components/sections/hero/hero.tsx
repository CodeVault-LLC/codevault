import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Container } from "@/components/layout/container"
import { WorldGlobe } from "@/components/sections/hero/world-globe"
import { homePage } from "@/core/config/site"
import { fadeUp, staggerContainer } from "@/core/lib/motion"
import { Link } from "@tanstack/react-router"

export function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden pt-16 pb-10 md:pt-24 md:pb-16"
    >
      <Container>
        <motion.div
          variants={staggerContainer(0.1, 0.05)}
          initial="hidden"
          animate="show"
          className="grid items-end gap-10 md:grid-cols-12"
        >
          <motion.h1
            id="hero-title"
            variants={fadeUp}
            className="max-w-5xl text-display-xxl text-balance md:col-span-8"
          >
            {homePage.hero.heading.before}
            <span className="font-serif font-normal italic">
              {homePage.hero.heading.accent}
            </span>
            {homePage.hero.heading.after}
          </motion.h1>

          <motion.div variants={fadeUp} className="md:col-span-4 md:pb-2">
            <p className="max-w-md text-paragraph-m text-pretty text-muted-foreground">
              {homePage.hero.introduction}
            </p>
            <Link
              to="/projects"
              className="group mt-6 inline-flex min-h-11 items-center gap-2 text-paragraph-s font-medium underline decoration-foreground/25 underline-offset-8 transition-[text-decoration-color] hover:decoration-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {homePage.hero.action}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative mt-8 md:mt-4"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-[80%] w-[80%] -translate-y-1/2 bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--foreground)_8%,transparent),transparent_70%)]"
          />
          <WorldGlobe className="max-w-[760px] md:mr-0" />
        </motion.div>
      </Container>
    </section>
  )
}
