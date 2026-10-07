import { useMemo, useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"

import type { Category } from "@/core/config/news"
import {
  allPosts,
  categories,
  formatDate,
  isCategory,
} from "@/core/config/news"
import { news } from "@/core/config/pages"
import { seo } from "@/core/lib/seo"
import { cn } from "@/lib/utils"
import { Container } from "@/components/layout/container"
import { PageShell } from "@/components/layout/page-shell"
import { NewsRow } from "@/components/news/news-row"
import { PostArt } from "@/components/news/post-art"
import { Reveal } from "@/components/ui/reveal"

export const Route = createFileRoute("/news/")({
  validateSearch: (search: Record<string, unknown>): { category?: Category } =>
    isCategory(search.category) ? { category: search.category } : {},
  head: () =>
    seo({ title: news.title, description: news.description, path: "/news" }),
  component: NewsIndex,
})

function NewsIndex() {
  const { category } = Route.useSearch()
  const [query, setQuery] = useState("")
  const posts = allPosts()
  const featured =
    posts.find((post) => post.category === "Announcements") ?? posts[0]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter(
      (post) =>
        (!category || post.category === category) &&
        (!q || `${post.title} ${post.summary}`.toLowerCase().includes(q))
    )
  }, [posts, category, query])

  return (
    <PageShell>
      <Container className="pt-14 pb-10 sm:pt-20 lg:pt-28">
        <h1 className="fade-rise font-sans text-display-l font-bold">
          {news.heading}
        </h1>
      </Container>

      <Container className="pb-20 lg:pb-28">
        <Link
          to="/news/$slug"
          params={{ slug: featured.slug }}
          className="group/card fade-rise grid gap-6 lg:grid-cols-12 lg:gap-10"
          style={{ "--d": "150ms" } as React.CSSProperties}
        >
          <div className="overflow-hidden rounded-2xl lg:col-span-8">
            <PostArt
              art={featured.art}
              tone={featured.tone}
              className="aspect-[16/9] transition-transform duration-700 ease-out-soft group-hover/card:scale-[1.02]"
            />
          </div>
          <div className="flex flex-col justify-end lg:col-span-4">
            <p className="mb-3 flex gap-3 font-sans text-caption">
              <span className="font-medium">{featured.category}</span>
              <time dateTime={featured.date} className="text-muted-foreground">
                {formatDate(featured.date, "short")}
              </time>
            </p>
            <h2 className="mb-3 font-sans text-display-m font-semibold decoration-2 underline-offset-4 group-hover/card:underline">
              {featured.title}
            </h2>
            <p className="text-paragraph-m text-foreground/85">
              {featured.summary}
            </p>
          </div>
        </Link>
      </Container>

      <Container className="pb-24 lg:pb-32">
        <Reveal>
          <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-sans text-display-s font-semibold">
              {news.allHeading}
            </h2>
            <label className="relative block sm:w-72">
              <span className="sr-only">{news.searchLabel}</span>
              <Search
                aria-hidden
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={news.searchLabel}
                className="h-10 w-full rounded-lg bg-transparent pr-3 pl-9 font-sans text-ui ring-1 ring-border-strong outline-none ring-inset placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground"
              />
            </label>
          </div>

          <nav
            aria-label={news.filterLabel}
            className="mb-2 flex flex-wrap gap-2"
          >
            {[undefined, ...categories].map((c) => {
              const active = c === category
              return (
                <Link
                  key={c ?? "all"}
                  to="/news"
                  search={c ? { category: c } : {}}
                  resetScroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 font-sans text-caption transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "bg-surface text-foreground/80 hover:bg-card"
                  )}
                >
                  {c ?? news.allLabel}
                </Link>
              )
            })}
          </nav>

          {filtered.length > 0 ? (
            <ul className="border-t border-border">
              {filtered.map((post) => (
                <NewsRow key={post.slug} post={post} summary />
              ))}
            </ul>
          ) : (
            <p className="border-t border-border py-10 text-paragraph-m text-muted-foreground">
              {news.empty}
            </p>
          )}
        </Reveal>
      </Container>
    </PageShell>
  )
}
