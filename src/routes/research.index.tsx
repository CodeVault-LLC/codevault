import { createFileRoute } from "@tanstack/react-router"
import { ResearchIndex } from "@/components/research/research-index"
import { researchPage, site } from "@/core/config/site"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/research/")({
  component: ResearchIndex,
  head: () =>
    seo({
      title: `${researchPage.title} | ${site.name}`,
      description: researchPage.description,
      path: researchPage.path,
    }),
})
