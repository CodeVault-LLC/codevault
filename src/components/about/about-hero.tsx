import { Container } from "@/components/layout/container"
import type { Heading } from "@/core/config/about"

type AboutHeroProps = {
  eyebrow: string
  heading: Heading
  lede: string
}

export function AboutHero({ heading, lede }: AboutHeroProps) {
  return (
    <section aria-labelledby="page-title" className="py-16 md:py-24 lg:py-28">
      <Container>
        <div className="grid items-end gap-8 lg:grid-cols-[3fr_2fr] lg:gap-20">
          <h1
            id="page-title"
            className="text-display-xl font-normal text-balance"
          >
            {heading.before}
            <span className="font-serif font-normal italic">
              {heading.accent}
            </span>
            {heading.after}
          </h1>
          <p className="max-w-xl text-paragraph-l leading-relaxed text-pretty text-muted-foreground">
            {lede}
          </p>
        </div>
      </Container>
    </section>
  )
}
