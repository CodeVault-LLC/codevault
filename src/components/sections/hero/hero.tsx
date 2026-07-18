import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"
import { WorldGlobe } from "@/components/sections/hero/world-globe"
import { fadeUp, staggerContainer } from "@/core/lib/motion"
import { Link } from "@tanstack/react-router"

export function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24"
    >
      <Container>
        <motion.div
          variants={staggerContainer(0.08, 0.05)}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-4xl text-center"
        >
          <motion.p
            variants={fadeUp}
            className="text-faded text-detail-xs font-medium uppercase"
          >
            CodeVault
          </motion.p>

          <motion.h1
            id="hero-title"
            variants={fadeUp}
            className="mt-4 text-display-xxl font-semibold text-balance"
          >
            We point ourselves at{" "}
            <span className="font-serif font-normal italic">tech</span>,
            <br />
            and see what happens.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-paragraph-m text-pretty text-muted-foreground"
          >
            We're not a product company. CodeVault runs projects — a trial, an
            experience, an adjustment, a result. Some grow into real tools. Some
            are just a small game we pushed to GitHub one afternoon. It's all
            tech, and it's all in the open.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              render={
                <Link to="/projects">
                  See what we're building
                  <ArrowRight />
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              render={<Link to="/about">What we're about</Link>}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative mt-14 md:mt-20"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-[80%] w-[80%] -translate-y-1/2 bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--foreground)_8%,transparent),transparent_70%)]"
          />
          <WorldGlobe />
        </motion.div>
      </Container>
    </section>
  )
}
