import { Link, createFileRoute, notFound } from "@tanstack/react-router"

import { findGuide } from "@/core/config/guides"
import { allPosts, findPost, formatDate } from "@/core/config/news"
import { guidesPage, news } from "@/core/config/pages"
import { site } from "@/core/config/site"
import { seo } from "@/core/lib/seo"
import { article, breadcrumbs } from "@/core/lib/structured-data"
import { Container } from "@/components/layout/container"
import { PageShell } from "@/components/layout/page-shell"
import { GuideRow } from "@/components/guides/guide-row"
import { ArticleDetails } from "@/components/news/article-details"
import { BodyBlock, sectionsOf } from "@/components/news/body-block"
import { NewsRow } from "@/components/news/news-row"
import { PostArt } from "@/components/news/post-art"
import { ArcRule } from "@/components/ui/arc-rule"
import { Reveal } from "@/components/ui/reveal"

export const Route = createFileRoute("/news/$slug")({
  loader: ({ params }) => {
    const post = findPost(params.slug)
    if (!post) throw notFound()
    return post
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo({
          title: `${loaderData.title} — ${site.name}`,
          description: loaderData.summary,
          path: `/news/${loaderData.slug}`,
          type: "article",
          image: postImage(loaderData.slug),
          article: {
            published: loaderData.date,
            section: loaderData.category,
          },
          jsonLd: [
            article(loaderData, postImage(loaderData.slug)),
            breadcrumbs([
              { name: site.name, path: "/" },
              { name: news.heading, path: "/news" },
              { name: loaderData.title, path: `/news/${loaderData.slug}` },
            ]),
          ],
        })
      : {},
  component: Article,
})

/** Each post's social card, made by `bun run og:images`. */
const postImage = (slug: string) => `/og/news/${slug}.png`

function Article() {
  const post = Route.useLoaderData()
  const sections = sectionsOf(post.body)
  const guides = (post.guides ?? []).flatMap((slug) => findGuide(slug) ?? [])
  const more = allPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3)

  return (
    <PageShell>
      <article>
        <Container className="pt-14 text-center sm:pt-20 lg:pt-24">
          <p className="fade-rise mb-6 font-sans text-caption font-medium">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </p>
          <h1
            className="fade-rise mx-auto max-w-[16ch] font-serif text-display-xxl"
            style={{ "--d": "100ms" } as React.CSSProperties}
          >
            {post.title}
          </h1>
          <ArcRule className="mx-auto mt-8 max-w-5xl" />
        </Container>

        <Container className="max-w-[63rem] pt-10">
          <ArticleDetails
            contentsLabel={news.contents}
            sections={sections}
            rows={[
              { label: "Category", value: post.category },
              ...(post.project
                ? [{ label: "Project", value: post.project }]
                : []),
              { label: "Published", value: formatDate(post.date, "short") },
            ]}
          />
        </Container>

        <Container className="max-w-[63rem] py-12 sm:py-16">
          <PostArt
            art={post.art}
            tone={post.tone}
            className="aspect-[16/9] rounded-2xl"
          />
        </Container>

        <Container className="max-w-[44rem] pb-20">
          <p className="mb-10 text-paragraph-l">{post.lead}</p>
          <div className="space-y-6 text-paragraph-s sm:text-paragraph-m">
            {post.body.map((block, i) => (
              <BodyBlock key={i} block={block} />
            ))}
          </div>
          {guides.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-2 font-sans text-display-xs font-semibold">
                {guidesPage.relatedGuides}
              </h2>
              <ul className="border-t border-border">
                {guides.map((guide) => (
                  <GuideRow key={guide.slug} guide={guide} />
                ))}
              </ul>
            </div>
          )}
        </Container>
      </article>

      <Container className="max-w-[63rem] pb-24 lg:pb-32">
        <Reveal>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-sans text-display-s font-semibold">
              {news.more}
            </h2>
            <Link to="/news" className="underline-quiet font-sans text-ui">
              {news.back}
            </Link>
          </div>
          <ul className="border-t border-border">
            {more.map((p) => (
              <NewsRow key={p.slug} post={p} />
            ))}
          </ul>
        </Reveal>
      </Container>
    </PageShell>
  )
}
