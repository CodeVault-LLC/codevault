import { createFileRoute } from "@tanstack/react-router"

import { allGuides } from "@/core/config/guides"
import { guidesPage } from "@/core/config/pages"
import { site } from "@/core/config/site"
import { seo } from "@/core/lib/seo"
import { breadcrumbs } from "@/core/lib/structured-data"
import { Container } from "@/components/layout/container"
import { PageShell } from "@/components/layout/page-shell"
import { GuideRow } from "@/components/guides/guide-row"

export const Route = createFileRoute("/guides/")({
  head: () =>
    seo({
      title: guidesPage.title,
      description: guidesPage.description,
      path: "/guides",
      jsonLd: [
        breadcrumbs([
          { name: site.name, path: "/" },
          { name: guidesPage.heading, path: "/guides" },
        ]),
      ],
    }),
  component: GuidesIndex,
})

function GuidesIndex() {
  return (
    <PageShell>
      <Container className="pt-14 pb-10 sm:pt-20 lg:pt-28">
        <h1 className="fade-rise font-sans text-display-l font-bold">
          {guidesPage.heading}
        </h1>
        <p
          className="fade-rise mt-4 max-w-[52ch] text-paragraph-m text-foreground/85"
          style={{ "--d": "100ms" } as React.CSSProperties}
        >
          {guidesPage.description}
        </p>
      </Container>

      <Container className="pb-24 lg:pb-32">
        <ul
          className="fade-rise border-t border-border"
          style={{ "--d": "150ms" } as React.CSSProperties}
        >
          {allGuides().map((guide) => (
            <GuideRow key={guide.slug} guide={guide} summary />
          ))}
        </ul>
      </Container>
    </PageShell>
  )
}
