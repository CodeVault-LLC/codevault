import { Link, createFileRoute, notFound } from "@tanstack/react-router"

import type { Block, Post } from "@/core/config/news"
import { allPosts, findPost, formatDate } from "@/core/config/news"
import { news } from "@/core/config/pages"
import { site } from "@/core/config/site"
import { seo } from "@/core/lib/seo"
import { Container } from "@/components/layout/container"
import { PageShell } from "@/components/layout/page-shell"
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
          image:
            loaderData.project === "Kilo" ? "/kilo/kilo-social.png" : undefined,
        })
      : {},
  component: Article,
})

function Article() {
  const post = Route.useLoaderData()
  const sections = post.body.filter(
    (block): block is Extract<Block, { type: "h2" }> => block.type === "h2"
  )
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
          <Details post={post} sections={sections} />
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

function Details({
  post,
  sections,
}: {
  post: Post
  sections: { id: string; text: string }[]
}) {
  const rows = [
    { label: "Category", value: post.category },
    ...(post.project ? [{ label: "Project", value: post.project }] : []),
    { label: "Published", value: formatDate(post.date, "short") },
  ]
  return (
    <div className="grid gap-8 border-y border-border py-6 sm:grid-cols-2 sm:gap-12">
      {sections.length > 0 ? (
        <nav aria-label={news.contents}>
          <p className="mb-3 font-mono text-label text-muted-foreground uppercase">
            {news.contents}
          </p>
          <ol className="space-y-2 font-sans text-caption">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="group inline-flex gap-2">
                  <span className="text-muted-foreground tabular-nums">
                    ({i + 1})
                  </span>
                  <span className="decoration-1 underline-offset-4 group-hover:underline">
                    {s.text}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : (
        <div />
      )}
      <dl>
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 first:pt-0 last:border-0"
          >
            <dt className="font-mono text-label text-muted-foreground uppercase">
              {row.label}
            </dt>
            <dd className="font-sans text-caption">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function BodyBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p>{block.text}</p>
    case "h2":
      return (
        <h2
          id={block.id}
          className="scroll-mt-28 pt-8 font-serif text-display-m font-medium"
        >
          {block.text}
        </h2>
      )
    case "list":
      return (
        <ul className="space-y-3">
          {block.items.map((item) => (
            <li key={item} className="relative pl-6">
              <span
                aria-hidden
                className="absolute top-[0.7em] left-0 size-1.5 rounded-full bg-clay"
              />
              {item}
            </li>
          ))}
        </ul>
      )
    case "figure":
      return (
        <figure className="py-6 lg:-mx-24">
          <PostArt
            art={block.art}
            tone={block.tone}
            className="aspect-[16/9] rounded-2xl"
          />
          <figcaption className="mt-3 font-sans text-caption text-muted-foreground">
            {block.caption}
          </figcaption>
        </figure>
      )
  }
}
