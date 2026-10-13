import { createFileRoute } from "@tanstack/react-router"

import { about, aboutFacts } from "@/core/config/about"
import { electrical } from "@/core/config/electrical"
import { images } from "@/core/config/images"
import { site } from "@/core/config/site"
import { seo } from "@/core/lib/seo"
import { aboutPage, breadcrumbs } from "@/core/lib/structured-data"
import { Container } from "@/components/layout/container"
import { PageShell } from "@/components/layout/page-shell"
import { ElectricalMark } from "@/components/electrical/electrical-mark"
import { ButtonLink } from "@/components/ui/button-link"
import { HeadlineWords } from "@/components/ui/headline-words"
import { Photo } from "@/components/ui/photo"
import { Reveal, RevealItem } from "@/components/ui/reveal"

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      title: about.title,
      description: about.description,
      path: "/about",
      image: "/og/about.png",
      jsonLd: [
        aboutPage(),
        breadcrumbs([
          { name: site.name, path: "/" },
          { name: about.heading, path: "/about" },
        ]),
      ],
    }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <PageShell>
      <Container className="pt-14 pb-16 sm:pt-20 lg:pt-28 lg:pb-24">
        <h1 className="mb-6 font-sans text-display-l font-semibold">
          <HeadlineWords text={about.heading} />
        </h1>
        <p
          className="fade-rise max-w-[36ch] text-paragraph-l"
          style={{ "--d": "120ms" } as React.CSSProperties}
        >
          {about.lead}
        </p>
      </Container>

      <Container className="pb-20 lg:pb-28">
        <Photo
          image={images.exterior}
          sizes="(min-width: 1280px) 1200px, 100vw"
          className="aspect-[16/9] sm:aspect-[21/9]"
        />
      </Container>

      <Container className="pb-20 lg:pb-28">
        <Reveal className="grid gap-8 rounded-3xl bg-surface p-6 sm:p-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-sans text-display-s font-semibold">
              {about.product.heading}
            </h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <ElectricalMark className="mb-6 size-10" />
            <p className="mb-8 text-paragraph-m">{about.product.body}</p>
            <ButtonLink to={electrical.path}>{about.product.link}</ButtonLink>
          </div>
        </Reveal>
      </Container>

      <Container className="pb-20 lg:pb-28">
        <Reveal>
          <h2 className="mb-10 font-sans text-display-s font-semibold">
            {about.approach.heading}
          </h2>
        </Reveal>
        <Reveal stagger className="grid gap-10 md:grid-cols-2 md:gap-8">
          {about.approach.items.map((item) => (
            <RevealItem
              key={item.title}
              className="border-t border-border-strong pt-5"
            >
              <h3 className="mb-2 font-sans text-display-xs font-semibold">
                {item.title}
              </h3>
              <p className="max-w-[44ch] text-paragraph-s text-foreground/85">
                {item.body}
              </p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>

      <Container className="grid gap-10 pb-24 lg:grid-cols-12 lg:pb-32">
        <Reveal className="lg:col-span-4">
          <h2 className="font-sans text-display-s font-semibold">
            {about.factsHeading}
          </h2>
        </Reveal>
        <Reveal className="lg:col-span-7 lg:col-start-6">
          <dl className="border-t border-border">
            {aboutFacts().map((fact) => (
              <div
                key={fact.label}
                className="grid gap-1 border-b border-border py-4 sm:grid-cols-3 sm:gap-6"
              >
                <dt className="font-mono text-label text-muted-foreground uppercase sm:pt-1">
                  {fact.label}
                </dt>
                <dd className="font-sans text-paragraph-s sm:col-span-2">
                  {fact.href ? (
                    <a href={fact.href} className="underline-quiet">
                      {fact.value}
                    </a>
                  ) : (
                    fact.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </PageShell>
  )
}
