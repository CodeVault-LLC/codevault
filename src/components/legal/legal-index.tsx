import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { Container } from "@/components/layout/container"
import { legalPages } from "@/core/config/legal"
import { legalPresentation } from "@/core/config/site"

export function LegalIndex() {
  const { heading } = legalPages.index
  return (
    <>
      <section aria-labelledby="page-title">
        <Container className="py-16 md:py-24">
          <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
            <h1
              id="page-title"
              className="text-display-xxl font-normal text-balance"
            >
              {heading.before}
              <span className="font-serif italic">{heading.accent}</span>
              {heading.after}
            </h1>
            <p className="max-w-md text-paragraph-l text-pretty text-muted-foreground">
              {legalPresentation.introduction}
            </p>
          </div>
        </Container>
      </section>
      <section
        id="documents"
        aria-labelledby="documents-title"
        className="pb-20 md:pb-28"
      >
        <Container>
          <h2 id="documents-title" className="sr-only">
            {legalPresentation.documents}
          </h2>
          <ul className="border-t border-foreground">
            {legalPresentation.documentsList.map((document) => (
              <li key={document.href} className="border-b border-border">
                <Link
                  to={document.href}
                  className="focus-ring group grid items-baseline gap-4 py-8 sm:grid-cols-[1fr_auto] md:grid-cols-[1fr_1.3fr_auto] md:gap-10 md:py-12"
                >
                  <span className="text-display-l font-normal">
                    {document.label}
                  </span>
                  <span className="max-w-md text-paragraph-m text-pretty text-muted-foreground sm:col-start-1 md:col-auto">
                    {document.description}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="col-start-2 row-start-1 size-6 justify-self-end transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:col-start-2 md:col-start-3"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  )
}
