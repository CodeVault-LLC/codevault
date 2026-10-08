import { createFileRoute } from "@tanstack/react-router"

import type { Status } from "@/core/config/kilo"
import { kilo } from "@/core/config/kilo"
import { postsFor } from "@/core/config/news"
import { site } from "@/core/config/site"
import { seo } from "@/core/lib/seo"
import { cn } from "@/lib/utils"
import { Orbit } from "@/components/brand/orbit"
import { Container } from "@/components/layout/container"
import { PageShell } from "@/components/layout/page-shell"
import { KiloLogo } from "@/components/kilo/kilo-logo"
import { KiloScene } from "@/components/kilo/kilo-scene"
import { NewsRow } from "@/components/news/news-row"
import { ButtonLink } from "@/components/ui/button-link"
import { Reveal, RevealItem } from "@/components/ui/reveal"

export const Route = createFileRoute("/kilo")({
  head: () =>
    seo({
      title: `Kilo — ${site.name}`,
      description: kilo.summary,
      path: "/kilo",
      image: "/kilo/kilo-social.png",
    }),
  component: KiloPage,
})

function KiloPage() {
  return (
    <PageShell>
      <Container className="flex flex-col items-center pt-14 pb-12 text-center sm:pt-20 lg:pt-24">
        <Orbit className="mb-4 size-28 sm:size-32" />
        <p className="fade-rise mb-5 font-mono text-label text-muted-foreground uppercase">
          {kilo.hero.eyebrow}
        </p>
        <h1
          className="fade-rise"
          style={{ "--d": "80ms" } as React.CSSProperties}
        >
          <span className="sr-only">{kilo.hero.heading}</span>
          <KiloLogo className="h-14 sm:h-20" />
        </h1>
        <p
          className="fade-rise mt-6 max-w-[28ch] text-paragraph-l"
          style={{ "--d": "160ms" } as React.CSSProperties}
        >
          {kilo.hero.body}
        </p>
        <div
          className="fade-rise mt-8 flex flex-col items-center gap-3"
          style={{ "--d": "240ms" } as React.CSSProperties}
        >
          <ButtonLink to={`/news/${kilo.announcementSlug}`}>
            {kilo.hero.primary}
          </ButtonLink>
          <p className="font-sans text-caption text-muted-foreground">
            {kilo.hero.note}
          </p>
        </div>
      </Container>

      <Container>
        <div
          className="fade-rise relative h-[clamp(22rem,42vw,36rem)] overflow-hidden rounded-3xl bg-surface"
          style={{ "--d": "300ms" } as React.CSSProperties}
        >
          <KiloScene />
        </div>
      </Container>

      <Container className="py-20 lg:py-28">
        <Reveal>
          <h2 className="mb-10 font-sans text-display-s font-semibold">
            {kilo.principles.heading}
          </h2>
        </Reveal>
        <Reveal stagger className="grid gap-10 md:grid-cols-3 md:gap-8">
          {kilo.principles.items.map((item, i) => (
            <RevealItem
              key={item.title}
              className="border-t border-border-strong pt-5"
            >
              <p className="mb-6 font-mono text-label text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mb-2 font-sans text-display-xs font-semibold">
                {item.title}
              </h3>
              <p className="text-paragraph-s text-foreground/85">{item.body}</p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>

      <Container className="grid gap-12 pb-20 lg:grid-cols-12 lg:pb-28">
        <Reveal className="lg:col-span-4">
          <h2 className="mb-6 font-sans text-display-s font-semibold">
            {kilo.status.heading}
          </h2>
          <dl>
            {kilo.facts.map((fact) => (
              <div
                key={fact.label}
                className="flex justify-between gap-4 border-t border-border py-3"
              >
                <dt className="font-mono text-label text-muted-foreground uppercase">
                  {fact.label}
                </dt>
                <dd className="font-sans text-caption">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal className="lg:col-span-7 lg:col-start-6">
          <ul className="rounded-2xl bg-surface px-5 sm:px-8">
            {kilo.status.rows.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0"
              >
                <span className="text-paragraph-s">{row.label}</span>
                <StatusChip status={row.status} />
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>

      <Container className="pb-24 lg:pb-32">
        <Reveal>
          <h2 className="mb-4 font-sans text-display-s font-semibold">
            {kilo.newsHeading}
          </h2>
          <ul className="border-t border-border">
            {postsFor("Kilo").map((post) => (
              <NewsRow key={post.slug} post={post} />
            ))}
          </ul>
        </Reveal>
      </Container>
    </PageShell>
  )
}

const statusDot: Record<Status, string> = {
  Working: "bg-olive",
  "In progress": "bg-persimmon",
  Next: "ring-1 ring-faint ring-inset",
}

function StatusChip({ status }: { status: Status }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 font-sans text-caption text-muted-foreground">
      <span
        aria-hidden
        className={cn("size-2 rounded-full", statusDot[status])}
      />
      {status}
    </span>
  )
}
