import { Link } from "@tanstack/react-router"
import { ArrowDown, ArrowRight } from "lucide-react"

import { Container } from "@/components/layout/container"
import { legalPages } from "@/core/config/legal"
import { legalPresentation } from "@/core/config/site"

export function LegalIndex() {
  const { heading } = legalPages.index

  return (
    <>
      <section aria-labelledby="page-title" className="bg-muted/50">
        <Container className="grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1
              id="page-title"
              className="text-display-xxl font-normal text-balance"
            >
              {heading.before}
              <span className="font-serif font-normal italic">
                {heading.accent}
              </span>
              {heading.after}
            </h1>
            <p className="mt-7 max-w-md text-paragraph-m text-pretty text-muted-foreground">
              {legalPresentation.introduction}
            </p>
            <a
              href="#documents"
              className="mt-8 inline-flex min-h-11 items-center gap-5 border-b border-border text-paragraph-s transition-colors outline-none hover:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {legalPresentation.documents}
              <ArrowDown aria-hidden="true" className="size-4" />
            </a>
          </div>
          <img
            {...legalPresentation.image}
            sizes="(min-width: 1024px) 528px, calc(100vw - 48px)"
            width={1800}
            height={1200}
            fetchPriority="high"
            className="aspect-[4/3] w-full object-cover"
          />
        </Container>
      </section>
      <section
        id="documents"
        aria-labelledby="documents-title"
        className="scroll-mt-36 py-14 sm:scroll-mt-24 md:py-20"
      >
        <Container>
          <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:gap-16">
            <h2 id="documents-title" className="text-display-m">
              {legalPresentation.documents}
            </h2>
            <ul className="border-t border-border">
              {legalPresentation.documentsList.map((document) => (
                <li key={document.href} className="border-b border-border">
                  <Link
                    to={document.href}
                    className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 py-6 transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-[8rem_1fr_auto] md:py-7"
                  >
                    <span className="text-display-xs">{document.label}</span>
                    <span className="col-start-1 max-w-md text-paragraph-s text-pretty text-muted-foreground md:col-auto">
                      {document.description}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="col-start-2 row-start-1 size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 md:col-auto md:row-auto"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  )
}
