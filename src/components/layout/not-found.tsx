import { site } from "@/core/config/site"
import { ButtonLink } from "@/components/ui/button-link"
import { Container } from "./container"
import { PageShell } from "./page-shell"

export function NotFound() {
  return (
    <PageShell>
      <Container className="py-32 lg:py-48">
        <p className="mb-4 font-mono text-label text-muted-foreground uppercase">
          404
        </p>
        <h1 className="mb-4 font-sans text-display-l font-bold">
          {site.notFound.title}
        </h1>
        <p className="mb-10 text-paragraph-m text-muted-foreground">
          {site.notFound.description}
        </p>
        <ButtonLink to="/">{site.notFound.action}</ButtonLink>
      </Container>
    </PageShell>
  )
}
