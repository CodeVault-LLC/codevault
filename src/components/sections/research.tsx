import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { TextReveal } from "@/components/editorial/text-reveal"
import { Container } from "@/components/layout/container"
import { homePage, researchFindings } from "@/core/config/site"

export function Research() {
  const finding = researchFindings[0]
  return (
    <section
      id="research"
      aria-labelledby="home-research-title"
      className="section-space"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-20">
          <div className="py-3 lg:py-8">
            <p className="text-caption text-muted-foreground">
              {homePage.research.title}
            </p>
            <h2
              id="home-research-title"
              className="mt-5 max-w-sm text-display-xl font-normal text-balance"
            >
              <TextReveal text={homePage.research.description} />
            </h2>
            <Link to="/research" className="editorial-link mt-8">
              {homePage.research.action}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <article className="group relative bg-secondary p-7 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3 text-caption text-muted-foreground">
              <span>{homePage.research.featured}</span>
              <span className="font-mono text-detail-xs">{finding.report}</span>
            </div>
            <h3 className="mt-8 max-w-xl text-display-l font-normal text-balance">
              <Link
                to="/research/$slug"
                params={{ slug: finding.slug }}
                className="focus-ring underline-offset-8 hover:underline"
              >
                {finding.title}
              </Link>
            </h3>
            <p className="mt-4 max-w-lg text-paragraph-s text-pretty text-muted-foreground">
              {finding.summary}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-foreground/15 pt-5">
              <time
                dateTime={finding.reportDate}
                className="text-caption text-muted-foreground"
              >
                {finding.dateLabel}
              </time>
              <Link
                to="/research/$slug"
                params={{ slug: finding.slug }}
                className="focus-ring inline-flex min-h-11 items-center gap-4 text-paragraph-s"
              >
                {homePage.research.read}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                />
              </Link>
            </div>
          </article>
        </div>
      </Container>
    </section>
  )
}
