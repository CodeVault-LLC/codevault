import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
import { ArrowRight, ArrowUpRight, Download } from "lucide-react"
import { Container } from "@/components/layout/container"
import {
  ResearchShell,
  researchLink,
} from "@/components/research/research-shell"
import { researchFindings, researchPage as page } from "@/core/config/site"

export function ResearchIndex() {
  return (
    <ResearchShell>
      <section
        aria-labelledby="research-title"
        className="relative isolate overflow-hidden bg-slate-dark text-ivory-light"
      >
        <img
          src={page.image}
          srcSet={page.imageSrcSet}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-20 size-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-r from-slate-dark/75 via-slate-dark/60 to-slate-dark/50 md:via-slate-dark/35 md:to-slate-dark/10"
        />
        <Container className="flex min-h-[34rem] flex-col justify-center py-16 md:min-h-[min(76svh,48rem)] md:py-24">
          <h1
            id="research-title"
            className="max-w-xl text-display-l font-normal text-balance"
          >
            {page.title}
          </h1>
          <p className="mt-5 max-w-md text-paragraph-m text-pretty text-ivory-light/90">
            {page.introduction}
          </p>
          <a
            href="#findings"
            className="mt-7 inline-flex min-h-10 w-fit items-center gap-6 bg-ivory-light px-4 py-2 text-paragraph-s font-medium text-slate-dark transition-colors hover:bg-ivory-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory-light"
          >
            {page.exploreLabel}
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
        </Container>
      </section>
      <section
        id="findings"
        aria-labelledby="findings-title"
        className="scroll-mt-24"
      >
        <Container className="py-12 md:py-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="findings-title" className="text-display-s font-medium">
              {page.findingsTitle}
            </h2>
            <span className="text-paragraph-s text-muted-foreground">
              {page.independentLabel}
            </span>
          </div>
          <ul className="mt-6 border-t border-border">
            {researchFindings.map((finding) => (
              <li
                key={finding.slug}
                className="grid gap-5 border-b border-border py-7 md:grid-cols-[10rem_minmax(0,1fr)_auto] md:gap-9"
              >
                <div className="flex flex-wrap items-baseline gap-3 text-paragraph-s text-muted-foreground md:flex-col md:gap-2">
                  <span className="font-mono text-foreground">
                    {finding.report}
                  </span>
                  <time dateTime={finding.reportDate}>{finding.dateLabel}</time>
                  <span
                    className="research-severity"
                    data-severity={finding.severity}
                  >
                    {finding.severity} · {finding.score}
                  </span>
                </div>
                <article>
                  <h3 className="max-w-xl text-display-xs font-medium text-balance">
                    <Link
                      to="/research/$slug"
                      params={{ slug: finding.slug }}
                      className="hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                    >
                      {finding.title}
                    </Link>
                  </h3>
                  <p className="mt-3 max-w-xl text-paragraph-s text-muted-foreground">
                    {finding.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                    <Link
                      to="/research/$slug"
                      params={{ slug: finding.slug }}
                      className={researchLink}
                    >
                      {page.readFinding}
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </Link>
                    <a href={finding.pdf} download className={researchLink}>
                      {page.shortPdfLabel}
                      <Download aria-hidden="true" className="size-3.5" />
                    </a>
                  </div>
                </article>
                <a
                  href={finding.advisory}
                  data-severity={finding.severity}
                  className="research-severity inline-flex h-fit w-fit items-center gap-2 text-paragraph-s underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  {finding.cve}
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section aria-labelledby="approach-title" className="bg-muted/50">
        <Container className="grid gap-6 py-10 md:grid-cols-[1fr_2fr] md:gap-16 md:py-12">
          <h2 id="approach-title" className="text-display-s font-normal">
            {page.approachTitle}
          </h2>
          <div>
            <p className="max-w-2xl text-paragraph-m text-muted-foreground">
              {page.approach}
            </p>
            <Link to="/about/contact" className={cn(researchLink, "mt-5")}>
              {page.contactLabel}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </Container>
      </section>
    </ResearchShell>
  )
}
