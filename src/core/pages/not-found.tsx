import { ArrowUpRight } from "lucide-react"
import { Container } from "@/components/layout/container"
import { LogoMark } from "@/components/brand/logo-mark"
import { ContourField } from "@/components/editorial/contour-field"
import { site } from "@/core/config/site"

export function NotFound() {
  return (
    <main className="relative isolate flex min-h-svh flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 text-foreground/20"
      >
        <ContourField />
      </div>
      <Container className="py-8">
        <a
          href="/"
          className="focus-ring inline-block"
          aria-label={site.presentation.home}
        >
          <LogoMark />
        </a>
      </Container>
      <Container className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="eyebrow">{site.presentation.notFound.code}</p>
        <h1 className="mt-6 max-w-2xl text-display-xxl font-normal text-balance">
          {site.presentation.notFound.title}
        </h1>
        <p className="mt-6 max-w-md text-paragraph-m text-muted-foreground">
          {site.presentation.notFound.description}
        </p>
        <a href="/" className="editorial-button mt-8">
          {site.presentation.notFound.action}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </Container>
    </main>
  )
}
