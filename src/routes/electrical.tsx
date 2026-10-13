import { createFileRoute } from "@tanstack/react-router"

import type { Status } from "@/core/config/electrical"
import { electrical } from "@/core/config/electrical"
import { images } from "@/core/config/images"
import { allGuides } from "@/core/config/guides"
import { postsFor } from "@/core/config/news"
import { site } from "@/core/config/site"
import { seo } from "@/core/lib/seo"
import { breadcrumbs, faq, software } from "@/core/lib/structured-data"
import { cn } from "@/lib/utils"
import { Container } from "@/components/layout/container"
import { PageShell } from "@/components/layout/page-shell"
import { ElectricalMark } from "@/components/electrical/electrical-mark"
import { ElectricalHero } from "@/components/electrical/electrical-hero"
import { HowItWorks } from "@/components/electrical/how-it-works"
import { ToolDiagram } from "@/components/electrical/tool-diagram"
import { GuideRow } from "@/components/guides/guide-row"
import { NewsRow } from "@/components/news/news-row"
import { Arrow, ButtonLink, buttonClass } from "@/components/ui/button-link"
import { Photo } from "@/components/ui/photo"
import { Reveal, RevealItem } from "@/components/ui/reveal"

export const Route = createFileRoute("/electrical")({
  head: () =>
    seo({
      title: electrical.seoTitle,
      description: electrical.summary,
      path: electrical.path,
      image: electrical.ogImage,
      imageAlt: `${electrical.name}: ${electrical.tagline}`,
      jsonLd: [
        software(),
        faq(electrical.faq.items),
        breadcrumbs([
          { name: site.name, path: "/" },
          { name: electrical.name, path: electrical.path },
        ]),
      ],
    }),
  component: ElectricalPage,
})

function ElectricalPage() {
  return (
    <PageShell>
      <ElectricalHero />

      <Container className="grid gap-8 pt-16 sm:pt-20 lg:grid-cols-12 lg:items-end lg:pt-24">
        <Reveal className="lg:col-span-7">
          <ElectricalMark className="mb-6 size-10" />
          <p className="max-w-[30ch] font-sans text-display-m font-medium text-balance">
            {electrical.hero.body}
          </p>
        </Reveal>
        <Reveal className="flex flex-col gap-3 lg:col-span-4 lg:col-start-9 lg:items-end">
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a href={electrical.access.href} className={buttonClass()}>
              {electrical.access.label}
              <Arrow />
            </a>
            <ButtonLink
              to={`/news/${electrical.announcementSlug}`}
              variant="secondary"
            >
              {electrical.hero.secondary}
            </ButtonLink>
          </div>
          <p className="font-sans text-caption text-muted-foreground">
            {electrical.hero.note}
          </p>
        </Reveal>
      </Container>

      <Container id="tools" className="scroll-mt-24 pt-20 lg:pt-28">
        <Reveal>
          <h2 className="mb-10 font-sans text-display-s font-semibold">
            {electrical.tools.heading}
          </h2>
        </Reveal>
        <Reveal stagger className="grid gap-4 md:grid-cols-2">
          {electrical.tools.items.map((tool) => (
            <RevealItem
              key={tool.name}
              className="flex flex-col rounded-2xl bg-surface p-6 sm:p-8"
            >
              <ToolDiagram
                diagram={tool.diagram}
                className="mx-auto mb-8 max-w-sm"
              />
              <h3 className="mb-2 font-sans text-display-xs font-semibold">
                {tool.name}
              </h3>
              <p className="max-w-[40ch] text-paragraph-s text-foreground/85">
                {tool.body}
              </p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>

      <HowItWorks />

      <Container className="pb-20 lg:pb-28">
        <Reveal className="mb-10 grid gap-4 lg:grid-cols-12">
          <h2 className="font-sans text-display-s font-semibold lg:col-span-4">
            {electrical.layout.heading}
          </h2>
          <p className="max-w-[48ch] text-paragraph-m text-foreground/85 lg:col-span-7 lg:col-start-6">
            {electrical.layout.body}
          </p>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          <Photo
            image={images.studWall}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[3/2]"
          />
          <Photo
            image={images.conduitBends}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[3/2]"
          />
        </div>
      </Container>

      <Container
        id="status"
        className="grid scroll-mt-24 gap-12 pb-20 lg:grid-cols-12 lg:pb-28"
      >
        <Reveal className="lg:col-span-4">
          <h2 className="font-sans text-display-s font-semibold">
            {electrical.status.heading}
          </h2>
        </Reveal>
        <Reveal className="lg:col-span-7 lg:col-start-6">
          <ul className="rounded-2xl bg-surface px-5 sm:px-8">
            {electrical.status.rows.map((row) => (
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

      <Container
        id="questions"
        className="grid scroll-mt-24 gap-10 pb-20 lg:grid-cols-12 lg:pb-28"
      >
        <Reveal className="lg:col-span-4">
          <h2 className="font-sans text-display-s font-semibold">
            {electrical.faq.heading}
          </h2>
        </Reveal>
        <Reveal className="lg:col-span-7 lg:col-start-6">
          <dl className="border-t border-border">
            {electrical.faq.items.map((item) => (
              <div key={item.q} className="border-b border-border py-6">
                <dt className="mb-2 font-sans text-display-xs font-semibold">
                  {item.q}
                </dt>
                <dd className="text-paragraph-s text-foreground/85">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>

      <Container className="pb-20 lg:pb-28">
        <Reveal>
          <h2 className="mb-4 font-sans text-display-s font-semibold">
            {electrical.guidesHeading}
          </h2>
          <ul className="border-t border-border">
            {allGuides().map((guide) => (
              <GuideRow key={guide.slug} guide={guide} />
            ))}
          </ul>
        </Reveal>
      </Container>

      <Container className="pb-24 lg:pb-32">
        <Reveal>
          <h2 className="mb-4 font-sans text-display-s font-semibold">
            {electrical.newsHeading}
          </h2>
          <ul className="border-t border-border">
            {postsFor(electrical.name).map((post) => (
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
  "In progress": "bg-persimmon pulse-dot",
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
