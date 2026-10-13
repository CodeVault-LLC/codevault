import type { Block } from "@/core/config/news"
import { PostArt } from "@/components/news/post-art"
import { Arrow, buttonClass } from "@/components/ui/button-link"

/** One block of an article's body: a news post or a guide. */
export function BodyBlock({ block }: { block: Block }) {
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
                className="absolute top-[0.7em] left-0 size-1.5 rounded-full bg-persimmon"
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
    case "cta":
      return (
        <div className="rounded-2xl bg-surface p-6 sm:p-8">
          <p className="mb-6">{block.text}</p>
          <a href={block.href} className={buttonClass()}>
            {block.label}
            <Arrow />
          </a>
        </div>
      )
  }
}

/** The section headings of a body, for its contents list. */
export function sectionsOf(body: Block[]) {
  return body.filter(
    (block): block is Extract<Block, { type: "h2" }> => block.type === "h2"
  )
}
