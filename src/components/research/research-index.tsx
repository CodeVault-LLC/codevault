import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Download } from "lucide-react"
import { TextReveal } from "@/components/editorial/text-reveal"
import { Container } from "@/components/layout/container"
import { ContourField } from "@/components/editorial/contour-field"
import { ResearchShell } from "@/components/research/research-shell"
import { researchFindings, researchPage as page } from "@/core/config/site"

export function ResearchIndex() {
  const featured = researchFindings[0]
  return (
    <ResearchShell>
      <section aria-labelledby="research-title">
        <Container className="pt-14 pb-16 md:pt-24 md:pb-20">
          <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
            <h1
              id="research-title"
              className="text-display-xxl font-medium text-balance"
            >
              <TextReveal text={page.title} />
            </h1>
            <p className="max-w-lg pb-2 text-paragraph-l text-pretty text-muted-foreground">
              {page.introduction}
            </p>
          </div>
        </Container>
      </section>
      <Container>
        <article className="grid grid-cols-1 bg-secondary lg:grid-cols-[1.2fr_1fr]">
          <Link
            to="/research/$slug"
            params={{ slug: featured.slug }}
            aria-label={featured.title}
            className="focus-ring relative isolate flex min-h-80 items-center justify-center overflow-hidden bg-slate-dark text-ivory-light md:min-h-[30rem]"
          >
            <ContourField className="absolute inset-0 -z-10 scale-150 text-ivory-light/55" />
            <div className="flex size-40 items-center justify-center rounded-full border border-ivory-light/40 bg-slate-dark md:size-52">
              <span className="font-mono text-display-s">
                {featured.report}
              </span>
            </div>
          </Link>
          <div className="flex min-w-0 flex-col justify-center p-6 md:p-12">
            <h2 className="text-display-l font-normal text-balance [overflow-wrap:anywhere]">
              <Link
                to="/research/$slug"
                params={{ slug: featured.slug }}
                className="focus-ring underline-offset-8 hover:underline"
              >
                {featured.title}
              </Link>
            </h2>
            <p className="mt-5 text-paragraph-m text-pretty text-muted-foreground">
              {featured.summary}
            </p>
            <Link
              to="/research/$slug"
              params={{ slug: featured.slug }}
              className="editorial-link mt-8 w-fit"
            >
              {page.readFinding}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </article>
      </Container>
      <section
        id="findings"
        aria-labelledby="findings-title"
        className="section-space"
      >
        <Container>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="findings-title" className="text-display-l font-normal">
              {page.findingsTitle}
            </h2>
          </div>
          <ul className="mt-9 border-t border-border">
            {researchFindings.map((finding) => (
              <li
                key={finding.slug}
                className="grid gap-7 border-b border-border py-9 md:grid-cols-[10rem_1fr] lg:grid-cols-[11rem_1fr_12rem] lg:gap-12"
              >
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-paragraph-s text-muted-foreground md:flex-col">
                  <time dateTime={finding.reportDate}>{finding.dateLabel}</time>
                  <span className="font-mono text-detail-xs">
                    {finding.report}
                  </span>
                </div>
                <article>
                  <h3 className="max-w-2xl text-display-m font-normal text-balance">
                    <Link
                      to="/research/$slug"
                      params={{ slug: finding.slug }}
                      className="focus-ring underline-offset-4 hover:underline"
                    >
                      {finding.title}
                    </Link>
                  </h3>
                  <p className="mt-4 max-w-xl text-paragraph-s text-muted-foreground">
                    {finding.summary}
                  </p>
                  <a
                    href={finding.pdf}
                    download
                    className="editorial-link mt-5"
                  >
                    {page.shortPdfLabel}
                    <Download aria-hidden="true" className="size-4" />
                  </a>
                </article>
                <div className="flex flex-col items-start gap-3 md:col-start-2 lg:col-auto">
                  <span
                    className="research-severity text-paragraph-s"
                    data-severity={finding.severity}
                  >
                    {finding.severity} · {finding.score}
                  </span>
                  <a
                    href={finding.advisory}
                    className="focus-ring inline-flex items-center gap-2 font-mono text-detail-xs underline underline-offset-4"
                  >
                    {finding.cve}
                    <ArrowUpRight aria-hidden="true" className="size-3" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section
        aria-labelledby="approach-title"
        className="border-t border-border bg-secondary py-16 md:py-24"
      >
        <Container>
          <h2
            id="approach-title"
            className="text-display-xl font-normal text-balance"
          >
            {page.approachTitle}
          </h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
            {page.methods.map((method) => (
              <li
                key={method.title}
                className="border-t border-foreground/25 pt-5"
              >
                <h3 className="text-display-s font-medium">{method.title}</h3>
                <p className="mt-4 text-paragraph-s text-pretty text-muted-foreground">
                  {method.text}
                </p>
              </li>
            ))}
          </ol>
          <Link to="/about/contact" className="editorial-link mt-10">
            {page.contactLabel}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </Container>
      </section>
    </ResearchShell>
  )
}
