import { createFileRoute } from "@tanstack/react-router"

import { site } from "@/core/config/site"
import { allPosts, postsFor } from "@/core/config/news"
import { seo } from "@/core/lib/seo"
import { Container } from "@/components/layout/container"
import { PageShell } from "@/components/layout/page-shell"
import { KiloAnnouncement } from "@/components/home/kilo-announcement"
import { HeadlineWords } from "@/components/ui/headline-words"
import { Reveal, RevealItem } from "@/components/ui/reveal"
import { ReleaseCard } from "@/components/news/release-card"
import { NewsRow } from "@/components/news/news-row"

export const Route = createFileRoute("/")({
  head: () =>
    seo({ title: site.title, description: site.description, path: "/" }),
  component: Home,
})

function Home() {
  const latest = postsFor("Kilo").slice(0, 3)
  const more = allPosts().filter((post) => !latest.includes(post))

  return (
    <PageShell>
      <Container className="grid items-end gap-8 pt-14 pb-12 sm:pt-20 lg:grid-cols-12 lg:pt-28 lg:pb-20">
        <h1 className="font-sans text-display-xl font-bold lg:col-span-7">
          <HeadlineWords
            text={site.home.headline}
            links={site.home.headlineLinks}
          />
        </h1>
        <p
          className="fade-rise max-w-[40ch] text-paragraph-l lg:col-span-4 lg:col-start-9"
          style={{ "--d": "500ms" } as React.CSSProperties}
        >
          {site.home.intro}
        </p>
      </Container>

      <Container>
        <KiloAnnouncement />
      </Container>

      <Container className="py-20 lg:py-28">
        <Reveal>
          <h2 className="mb-6 font-sans text-display-s font-semibold">
            {site.home.latestHeading}
          </h2>
        </Reveal>
        <Reveal stagger className="grid gap-4 md:grid-cols-3">
          {latest.map((post) => (
            <RevealItem key={post.slug} className="flex">
              <ReleaseCard post={post} className="w-full" />
            </RevealItem>
          ))}
        </Reveal>
      </Container>

      <Container className="grid gap-10 pb-24 lg:grid-cols-12 lg:pb-32">
        <Reveal className="lg:col-span-5">
          <h2 className="mb-4 font-sans text-display-s font-semibold">
            {site.home.moreHeading}
          </h2>
          <p className="max-w-[30ch] text-paragraph-l">{site.home.statement}</p>
        </Reveal>
        <Reveal className="lg:col-span-7">
          <ul className="border-t border-border">
            {more.map((post) => (
              <NewsRow key={post.slug} post={post} />
            ))}
          </ul>
        </Reveal>
      </Container>
    </PageShell>
  )
}
