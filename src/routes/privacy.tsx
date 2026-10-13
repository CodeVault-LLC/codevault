import { createFileRoute } from "@tanstack/react-router"

import { formatDate } from "@/core/config/news"
import { privacy } from "@/core/config/legal"
import { seo } from "@/core/lib/seo"
import { Container } from "@/components/layout/container"
import { PageShell } from "@/components/layout/page-shell"
import { ArcRule } from "@/components/ui/arc-rule"

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo({
      title: privacy.title,
      description: privacy.description,
      path: "/privacy",
    }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <PageShell>
      <article>
        <Container className="pt-14 text-center sm:pt-20 lg:pt-24">
          <p className="fade-rise mb-6 font-sans text-caption font-medium">
            {privacy.updatedLabel}{" "}
            <time dateTime={privacy.updated}>
              {formatDate(privacy.updated)}
            </time>
          </p>
          <h1
            className="fade-rise mx-auto max-w-[16ch] font-serif text-display-xxl"
            style={{ "--d": "100ms" } as React.CSSProperties}
          >
            {privacy.heading}
          </h1>
          <ArcRule className="mx-auto mt-8 max-w-5xl" />
        </Container>

        <Container className="max-w-[44rem] pt-10 pb-24 lg:pb-32">
          <p className="mb-10 text-paragraph-l">{privacy.lead}</p>
          <div className="space-y-6 text-paragraph-s sm:text-paragraph-m">
            {privacy.sections.map((section) => (
              <section key={section.id} aria-labelledby={section.id}>
                <h2
                  id={section.id}
                  className="scroll-mt-28 pt-8 pb-6 font-serif text-display-m font-medium"
                >
                  {section.heading}
                </h2>
                <div className="space-y-6">
                  {section.body.map((block, i) =>
                    typeof block === "string" ? (
                      <p key={i}>
                        <Linked text={block} />
                      </p>
                    ) : (
                      <ul key={i} className="space-y-3">
                        {block.map((item) => (
                          <li key={item} className="relative pl-6">
                            <span
                              aria-hidden
                              className="absolute top-[0.7em] left-0 size-1.5 rounded-full bg-persimmon"
                            />
                            <Linked text={item} />
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </article>
    </PageShell>
  )
}

// Email addresses and https URLs in the copy become links, so the copy can
// stay plain strings.
const LINKABLE = /([\w.+-]+@[\w-]+\.[\w.]+\w|https:\/\/[^\s]+\w)/g

function Linked({ text }: { text: string }) {
  return text.split(LINKABLE).map((part, i) => {
    if (i % 2 === 0) return part
    const href = part.startsWith("https://") ? part : `mailto:${part}`
    const label = part.replace(/^https:\/\/(www\.)?/, "")
    return (
      <a key={i} href={href} className="underline underline-offset-4">
        {label}
      </a>
    )
  })
}
