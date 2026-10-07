import { Container } from "@/components/layout/container"
import type { Heading } from "@/core/config/about"

type AboutHeroProps = { eyebrow: string; heading: Heading; lede: string }

export function AboutHero({ heading, lede }: AboutHeroProps) {
  return (
    <section aria-labelledby="page-title" className="py-14 md:py-24">
      <Container>
        <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <h1
            id="page-title"
            className="text-display-xxl font-normal text-balance"
          >
            {heading.before}
            <span className="font-serif italic">{heading.accent}</span>
            {heading.after}
          </h1>
          <p className="max-w-xl pb-2 text-paragraph-l text-pretty text-muted-foreground">
            {lede}
          </p>
        </div>
      </Container>
    </section>
  )
}
