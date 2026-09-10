import { Container } from "@/components/layout/container"
import { legal } from "@/core/config/legal"
import { legalPresentation } from "@/core/config/site"

export function LegalFooter() {
  return (
    <footer className="border-t border-border py-8 md:py-10">
      <Container className="flex flex-col justify-between gap-4 text-paragraph-s text-muted-foreground sm:flex-row">
        <p>{legalPresentation.home}</p>
        <p className="flex flex-wrap gap-x-3 gap-y-1">
          {legalPresentation.contact}
          <a
            href={legal.contact.href}
            className="text-foreground underline decoration-foreground/30 underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {legal.contact.email}
          </a>
        </p>
      </Container>
    </footer>
  )
}
