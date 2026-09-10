import { createFileRoute, notFound } from "@tanstack/react-router"
import { ResearchArticle } from "@/components/research/research-article"
import { researchFindings, site } from "@/core/config/site"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/research/$slug")({
  loader: ({ params }) => {
    const finding = researchFindings.find((item) => item.slug === params.slug)
    if (!finding) throw notFound()
    return finding
  },
  component: ResearchArticleRoute,
  head: ({ loaderData }) =>
    loaderData
      ? seo({
          title: `${loaderData.title} | ${site.name}`,
          description: loaderData.summary,
          path: loaderData.path,
          type: "article",
        })
      : {},
})

function ResearchArticleRoute() {
  return <ResearchArticle finding={Route.useLoaderData()} />
}
