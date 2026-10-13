import { createFileRoute } from "@tanstack/react-router"

import { electrical } from "@/core/config/electrical"
import { images } from "@/core/config/images"
import { site } from "@/core/config/site"
import { allPosts } from "@/core/config/news"
import { seo } from "@/core/lib/seo"
import { organization, website } from "@/core/lib/structured-data"
import { Container } from "@/components/layout/container"
import { PageShell } from "@/components/layout/page-shell"
import { ElectricalAnnouncement } from "@/components/home/electrical-announcement"
import { Arrow, ButtonLink, buttonClass } from "@/components/ui/button-link"
import { HeadlineWords } from "@/components/ui/headline-words"
import { InkText } from "@/components/ui/ink-text"
import { Photo } from "@/components/ui/photo"
import { Reveal, RevealItem } from "@/components/ui/reveal"
import { ReleaseCard } from "@/components/news/release-card"
import { NewsRow } from "@/components/news/news-row"

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: site.title,
      description: site.description,
      path: "/",
      jsonLd: [organization(), website()],
    }),
  component: Home,
})

function Home() {
  const posts = allPosts()
  const latest = posts.slice(0, 3)
  const more = posts.slice(3)

  return (
    <PageShell>
      <Container className="grid items-end gap-8 pt-14 pb-12 sm:pt-20 lg:grid-cols-12 lg:pt-28 lg:pb-20">
        <h1 className="font-sans text-display-l font-bold lg:col-span-7">
          <HeadlineWords text={site.home.headline} />
        </h1>
        <p
          className="fade-rise max-w-[40ch] text-paragraph-l lg:col-span-4 lg:col-start-9"
          style={{ "--d": "500ms" } as React.CSSProperties}
        >
          {site.home.intro}
        </p>
      </Container>

      <Container>
        <ElectricalAnnouncement />
      </Container>

      <Container className="grid items-center gap-10 pt-20 lg:grid-cols-12 lg:gap-12 lg:pt-28">
        <Photo
          image={images.ceilingVoid}
          sizes="(min-width: 1024px) 720px, 100vw"
          className="aspect-[4/3] lg:col-span-7"
        />
        <Reveal className="lg:col-span-5">
          <h2 className="mb-4 font-sans text-display-m font-semibold">
            {electrical.name}
          </h2>
          <p className="mb-8 max-w-[44ch] text-paragraph-m text-foreground/85">
            {site.home.product.body}
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={electrical.access.href} className={buttonClass()}>
              {electrical.access.label}
              <Arrow />
            </a>
            <ButtonLink to={electrical.path} variant="secondary">
              {site.home.product.more}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>

      <Container className="grid gap-10 pt-20 lg:grid-cols-12 lg:pt-28">
        <Reveal className="lg:col-span-4">
          <h2 className="font-sans text-display-s font-semibold">
            {site.home.approach.heading}
          </h2>
        </Reveal>
        <div className="lg:col-span-7 lg:col-start-6">
          <InkText
            text={site.home.approach.statement}
            className="font-sans text-display-m font-medium text-balance"
          />
          <Reveal stagger className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {site.home.approach.items.map((item) => (
              <RevealItem
                key={item.title}
                className="border-t border-border pt-4"
              >
                <h3 className="mb-2 font-sans text-display-xs font-semibold">
                  {item.title}
                </h3>
                <p className="text-paragraph-s text-foreground/85">
                  {item.body}
                </p>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </Container>

      <Container className="grid gap-10 pt-20 lg:grid-cols-12 lg:pt-28">
        <div className="lg:col-span-4">
          <Reveal>
            <h2 className="font-sans text-display-s font-semibold">
              {electrical.rollout.heading}
            </h2>
          </Reveal>
          <Photo
            image={images.electricalRoom}
            sizes="400px"
            className="mt-8 hidden aspect-[4/5] lg:block"
          />
        </div>
        <Reveal className="lg:col-span-7 lg:col-start-6">
          <dl className="border-t border-border">
            {electrical.rollout.items.map((item) => (
              <div
                key={item.title}
                className="grid gap-2 border-b border-border py-6 sm:grid-cols-5 sm:gap-8"
              >
                <dt className="font-sans text-display-xs font-semibold sm:col-span-2">
                  {item.title}
                </dt>
                <dd className="text-paragraph-s text-foreground/85 sm:col-span-3">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>

      <Container className="py-20 lg:py-28">
        <Reveal className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-sans text-display-s font-semibold">
            {site.home.latestHeading}
          </h2>
          <ButtonLink to="/news" variant="secondary">
            {site.home.allNews}
          </ButtonLink>
        </Reveal>
        <Reveal stagger className="grid gap-4 md:grid-cols-3">
          {latest.map((post) => (
            <RevealItem key={post.slug} className="flex">
              <ReleaseCard post={post} className="w-full" />
            </RevealItem>
          ))}
        </Reveal>
      </Container>

      {more.length > 0 && (
        <Container className="grid gap-10 pb-24 lg:grid-cols-12 lg:pb-32">
          <Reveal className="lg:col-span-5">
            <h2 className="mb-4 font-sans text-display-s font-semibold">
              {site.home.moreHeading}
            </h2>
            <p className="max-w-[30ch] text-paragraph-l">
              {site.home.statement}
            </p>
          </Reveal>
          <Reveal className="lg:col-span-7">
            <ul className="border-t border-border">
              {more.map((post) => (
                <NewsRow key={post.slug} post={post} />
              ))}
            </ul>
          </Reveal>
        </Container>
      )}
    </PageShell>
  )
}
