import { Fragment } from "react"
import { Link } from "@tanstack/react-router"

/**
 * A headline that rises in word by word. Words wrapped in `[` `]` become
 * underlined links, in order, to `links`.
 *
 * Each word is its own inline-block (so it can move), and text decoration
 * doesn't reach into inline-blocks — so linked words carry the underline
 * themselves, and the spaces between them stay inside the link.
 */
export function HeadlineWords({
  text,
  links = [],
  delay = 0,
}: {
  text: string
  links?: readonly string[]
  delay?: number
}) {
  const parts = text.split(/(\[[^\]]+\])/).filter(Boolean)
  let index = 0
  let linkIndex = 0

  const word = (w: string, underline: boolean) => (
    <span
      key={index}
      className={underline ? "word-rise underline-display" : "word-rise"}
      style={{ "--i": index++, "--d": `${delay}ms` } as React.CSSProperties}
    >
      {w}
    </span>
  )

  return (
    <>
      <span className="sr-only">{text.replace(/[[\]]/g, "")}</span>
      <span aria-hidden>
        {parts.map((part, p) => {
          const linked = part.startsWith("[")
          const words = (linked ? part.slice(1, -1) : part).split(/(\s+)/)
          const rendered = words.map((w, i) =>
            /^\s+$/.test(w) ? (
              <Fragment key={`s${p}-${i}`}>{w}</Fragment>
            ) : w ? (
              word(w, linked)
            ) : null
          )
          if (!linked) return <Fragment key={p}>{rendered}</Fragment>
          const href = links[linkIndex++] ?? "/"
          return (
            <Link
              key={p}
              to={href}
              tabIndex={-1}
              className="transition-opacity hover:opacity-70"
            >
              {rendered}
            </Link>
          )
        })}
      </span>
    </>
  )
}
