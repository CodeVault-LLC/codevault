import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowUpRight, Download } from "lucide-react"
import { Container } from "@/components/layout/container"
import {
  ResearchShell,
  researchButton,
  researchLink,
} from "@/components/research/research-shell"
import type { researchFindings } from "@/core/config/site"
import { researchPage as page } from "@/core/config/site"

export type ResearchFinding = (typeof researchFindings)[number]

export function ResearchArticle({ finding }: { finding: ResearchFinding }) {
  return (
    <ResearchShell>
      <article>
        <Container className="pt-8 pb-20 md:pt-12 md:pb-28">
          <Link to="/research" className={researchLink}>
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            {page.backLabel}
          </Link>
          <header className="mx-auto mt-12 max-w-4xl text-center md:mt-16">
            <h1 className="text-display-m font-medium text-balance">
              {finding.title}
            </h1>
            <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-paragraph-s text-muted-foreground">
              <span>{finding.author}</span>
              <time dateTime={finding.reportDate}>{finding.dateLabel}</time>
              <span className="font-mono">{finding.report}</span>
              <span
                className="research-severity"
                data-severity={finding.severity}
              >
                {finding.severity} · {finding.score}
              </span>
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-paragraph-m text-muted-foreground">
              {finding.introduction}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
              <a href={finding.pdf} download className={researchButton}>
                <Download aria-hidden="true" className="size-4" />
                {page.shortPdfLabel}
              </a>
              <a href={finding.advisory} className={researchLink}>
                {finding.advisoryLabel}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          </header>
          <div className="mt-14 grid gap-12 border-t border-border pt-12 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-20 lg:pt-16">
            <div className="editorial-prose max-w-3xl min-w-0 space-y-12">
              {finding.sections.map((section) => (
                <section key={section.id} aria-labelledby={section.id}>
                  <h2 id={section.id} className="text-display-xs font-medium">
                    {section.title}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-3 text-paragraph-m text-pretty text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
              <section aria-labelledby="timeline-title">
                <h2 id="timeline-title" className="text-display-xs font-medium">
                  {page.timelineTitle}
                </h2>
                <ol className="mt-4">
                  {finding.timeline.map((entry) => (
                    <li
                      key={entry.title}
                      className="grid gap-2 border-t border-border py-4 sm:grid-cols-[9rem_1fr] sm:gap-5"
                    >
                      <time
                        dateTime={entry.date}
                        className="text-paragraph-s text-muted-foreground"
                      >
                        {entry.label}
                      </time>
                      <div>
                        <h3 className="text-paragraph-m font-medium">
                          {entry.title}
                        </h3>
                        <p className="mt-1 text-paragraph-s text-muted-foreground">
                          {entry.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
              <p className="border-t border-border pt-5 text-paragraph-s text-muted-foreground">
                {finding.sourceNote}
              </p>
            </div>
            <aside aria-labelledby="record-title" className="lg:col-start-2">
              <div className="border-t border-border pt-5 lg:sticky lg:top-28">
                <h2 id="record-title" className="text-paragraph-m font-medium">
                  {page.detailsTitle}
                </h2>
                <dl className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-1">
                  {finding.metadata.map((item) => (
                    <div
                      key={item.label}
                      className="border-b border-border py-3 last:border-b-0"
                    >
                      <dt className="text-paragraph-s text-muted-foreground">
                        {item.label}
                      </dt>
                      <dd
                        data-severity={
                          "tone" in item ? finding.severity : undefined
                        }
                        className={cn(
                          "mt-1 text-paragraph-s font-medium",
                          "tone" in item && "research-severity"
                        )}
                      >
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </Container>
      </article>
    </ResearchShell>
  )
}
