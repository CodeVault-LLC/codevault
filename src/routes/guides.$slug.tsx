import { Link, createFileRoute, notFound } from "@tanstack/react-router"

import { electrical } from "@/core/config/electrical"
import { allGuides, findGuide } from "@/core/config/guides"
import { findPost, formatDate } from "@/core/config/news"
import { guidesPage } from "@/core/config/pages"
import { site } from "@/core/config/site"
import { seo } from "@/core/lib/seo"
import { breadcrumbs, guideArticle } from "@/core/lib/structured-data"
import { Container } from "@/components/layout/container"
import { PageShell } from "@/components/layout/page-shell"
import { GuideRow } from "@/components/guides/guide-row"
import { ArticleDetails } from "@/components/news/article-details"
import { BodyBlock, sectionsOf } from "@/components/news/body-block"
import { NewsRow } from "@/components/news/news-row"
import { ArcRule } from "@/components/ui/arc-rule"
import { ButtonLink } from "@/components/ui/button-link"
import { Reveal } from "@/components/ui/reveal"

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const guide = findGuide(params.slug)
    if (!guide) throw notFound()
    return guide
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo({
          title: `${loaderData.seoTitle} — ${site.name}`,
          description: loaderData.description,
          path: `/guides/${loaderData.slug}`,
          type: "article",
          image: guideImage(loaderData.slug),
          jsonLd: [
            guideArticle(loaderData, guideImage(loaderData.slug)),
            breadcrumbs([
              { name: site.name, path: "/" },
              { name: guidesPage.heading, path: "/guides" },
              { name: loaderData.title, path: `/guides/${loaderData.slug}` },
            ]),
          ],
        })
      : {},
  component: GuidePage,
})

/** Each guide's social card, made by `bun run og:images`. */
const guideImage = (slug: string) => `/og/guides/${slug}.png`

function GuidePage() {
  const guide = Route.useLoaderData()
  const posts = (guide.related.news ?? []).flatMap(
    (slug) => findPost(slug) ?? []
  )
  const guides = (guide.related.guides ?? []).flatMap(
    (slug) => findGuide(slug) ?? []
  )
  const others = allGuides().filter(
    (g) => g.slug !== guide.slug && !guides.includes(g)
  )

  return (
    <PageShell>
      <article>
        <Container className="pt-14 text-center sm:pt-20 lg:pt-24">
          <p className="fade-rise mb-6 font-sans text-caption font-medium">
            {guidesPage.eyebrow}
          </p>
          <h1
            className="fade-rise mx-auto max-w-[22ch] font-serif text-display-xl text-balance"
            style={{ "--d": "100ms" } as React.CSSProperties}
          >
            {guide.title}
          </h1>
          <ArcRule className="mx-auto mt-8 max-w-5xl" />
        </Container>

        <Container className="max-w-[63rem] pt-10">
          <ArticleDetails
            contentsLabel={guidesPage.contents}
            sections={sectionsOf(guide.body)}
            rows={[
              { label: guidesPage.appliesTo, value: guide.appliesTo },
              {
                label: guidesPage.updated,
                value: formatDate(guide.updated, "short"),
              },
            ]}
          />
        </Container>

        <Container className="max-w-[44rem] pt-12 pb-20 sm:pt-16">
          <p className="mb-10 text-paragraph-l">{guide.answer}</p>
          <div className="space-y-6 text-paragraph-s sm:text-paragraph-m">
            {guide.body.map((block, i) => (
              <BodyBlock key={i} block={block} />
            ))}
          </div>

          <section className="mt-14 rounded-2xl bg-surface p-6 sm:p-8">
            <h2 className="mb-3 font-sans text-display-xs font-semibold">
              {guidesPage.product}
            </h2>
            <p className="mb-6 text-paragraph-s">{guide.product}</p>
            <ButtonLink to={electrical.path}>
              {guidesPage.productLink}
            </ButtonLink>
          </section>
        </Container>
      </article>

      <Container className="max-w-[63rem] pb-24 lg:pb-32">
        <Reveal>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-sans text-display-s font-semibold">
              {guidesPage.related}
            </h2>
            <Link to="/guides" className="underline-quiet font-sans text-ui">
              {guidesPage.back}
            </Link>
          </div>
          <ul className="border-t border-border">
            {[...guides, ...others].map((g) => (
              <GuideRow key={g.slug} guide={g} />
            ))}
            {posts.map((post) => (
              <NewsRow key={post.slug} post={post} />
            ))}
          </ul>
        </Reveal>
      </Container>
    </PageShell>
  )
}
