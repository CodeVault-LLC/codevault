import { Children, isValidElement } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowUp, ChevronDown } from "lucide-react"

import { Container } from "@/components/layout/container"
import { legal } from "@/core/config/legal"
import { legalPresentation } from "@/core/config/site"
import { cn } from "@/lib/utils"

type LegalDocumentProps = {
  page: {
    eyebrow: string
    heading: { before: string; accent: string; after?: string }
    lede: string
  }
  children: React.ReactNode
}

type LegalSectionProps = {
  id: string
  title: string
  children: React.ReactNode
}

export function LegalDocument({ page, children }: LegalDocumentProps) {
  // Derive navigation from the authored sections so the two cannot drift.
  const sections = Children.toArray(children).filter(
    (child) =>
      isValidElement<LegalSectionProps>(child) && child.type === LegalSection
  )
  const contents = (
    <ul className="space-y-1">
      {sections.map((section) => {
        if (!isValidElement<LegalSectionProps>(section)) return null
        return (
          <li key={section.props.id}>
            <a
              href={`#${section.props.id}`}
              className="block rounded-sm py-2 text-paragraph-s text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              {section.props.title}
            </a>
          </li>
        )
      })}
    </ul>
  )

  return (
    <>
      <Container className="pt-10 pb-20 md:pt-20 md:pb-32">
        <div className="grid gap-x-16 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <div className="mb-8 lg:mb-0">
            <Link
              to="/legal"
              className="inline-flex min-h-11 items-center gap-2 text-paragraph-s text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              {legalPresentation.overview}
            </Link>
          </div>
          <header
            id="document-top"
            className="max-w-3xl scroll-mt-36 sm:scroll-mt-24"
          >
            <h1
              id="page-title"
              className="text-display-xl font-normal text-balance"
            >
              {page.heading.before}
              <span className="font-serif font-normal italic">
                {page.heading.accent}
              </span>
              {page.heading.after}
            </h1>
            <p className="mt-6 text-paragraph-m text-pretty text-muted-foreground">
              {page.lede}
            </p>
            <p className="mt-6 text-paragraph-s text-muted-foreground">
              {legalPresentation.updated}{" "}
              <time dateTime={legal.effective}>
                {new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(legal.effective))}
              </time>
            </p>
          </header>
          <aside className="mt-10 lg:mt-12">
            <nav
              aria-label={legalPresentation.contents}
              className="sticky top-24 hidden lg:block"
            >
              <p className="mb-4 text-paragraph-s font-medium">
                {legalPresentation.contents}
              </p>
              {contents}
            </nav>
            <details className="group border-y border-border lg:hidden">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-paragraph-s font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                {legalPresentation.contents}
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 group-open:rotate-180"
                />
              </summary>
              <nav aria-label={legalPresentation.contents} className="pb-5">
                {contents}
              </nav>
            </details>
          </aside>
          <article
            aria-labelledby="page-title"
            className="editorial-prose max-w-3xl min-w-0 pt-10 lg:pt-16"
          >
            <div className="space-y-12 md:space-y-14">{children}</div>
            <div className="mt-14 border-t border-border pt-6">
              <a
                href="#document-top"
                className="inline-flex min-h-11 items-center gap-3 text-paragraph-s text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {legalPresentation.backToTop}
                <ArrowUp aria-hidden="true" className="size-4" />
              </a>
            </div>
          </article>
        </div>
      </Container>
    </>
  )
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section aria-labelledby={id}>
      <h2
        id={id}
        className="scroll-mt-36 text-display-s font-semibold text-balance sm:scroll-mt-24"
      >
        {title}
      </h2>
      <div
        className={cn(
          "[&_p]:mt-5 [&_p]:text-paragraph-m [&_p]:text-pretty [&_p]:text-muted-foreground",
          "[&_h3]:mt-8 [&_h3]:text-display-xs [&_h3]:font-semibold [&_h3]:text-foreground",
          "[&_ul]:mt-5 [&_ul]:list-disc [&_ul]:space-y-2.5 [&_ul]:pl-5",
          "[&_li]:text-paragraph-m [&_li]:text-pretty [&_li]:text-muted-foreground [&_li]:marker:text-olive",
          "[&_strong]:font-medium [&_strong]:text-foreground",
          "[&_a]:text-foreground [&_a]:underline [&_a]:decoration-foreground/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-foreground",
          "[&_a]:break-words [&_a]:outline-none focus-visible:[&_a]:ring-2 focus-visible:[&_a]:ring-ring",
          "[&_code]:break-all"
        )}
      >
        {children}
      </div>
    </section>
  )
}
