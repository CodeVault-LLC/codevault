import { ArrowUpRight } from "lucide-react"
import { Link } from "@tanstack/react-router"

import { TextReveal } from "@/components/editorial/text-reveal"
import { Container } from "@/components/layout/container"
import { SecurityWorld } from "@/components/sections/hero/security-world"
import { homePage } from "@/core/config/site"

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="security-hero">
      <Container>
        <div className="grid items-end gap-8 pt-14 pb-12 md:gap-12 md:pt-20 md:pb-14 lg:grid-cols-[1.35fr_1fr] lg:pt-24 lg:pb-16">
          <h1 id="hero-title" className="text-display-hero font-normal">
            <TextReveal
              text={homePage.hero.title}
              variant="words"
              className="block"
            />
            <TextReveal
              text={homePage.hero.titleAccent}
              variant="words"
              delay={0.12}
              className="block font-serif italic"
            />
          </h1>
          <div className="max-w-md pb-1 lg:pl-10">
            <p className="text-paragraph-l text-pretty text-muted-foreground">
              {homePage.hero.introduction}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
              <Link to="/research" className="editorial-link">
                {homePage.hero.action}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                to="/projects"
                className="focus-ring inline-flex min-h-11 items-center text-paragraph-s text-muted-foreground transition-colors hover:text-foreground"
              >
                {homePage.hero.secondaryAction}
              </Link>
            </div>
          </div>
        </div>
        <SecurityWorld />
      </Container>
    </section>
  )
}
