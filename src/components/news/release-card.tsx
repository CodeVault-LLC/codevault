import { Link } from "@tanstack/react-router"

import type { Post } from "@/core/config/news"
import { formatDate } from "@/core/config/news"
import { cn } from "@/lib/utils"
import { Arrow, buttonClass } from "@/components/ui/button-link"

/**
 * The oat release card: title and summary at the top, a mono details table
 * and the action at the bottom. The whole card is one link (the title's,
 * stretched), so there is a single stop for keyboard and screen reader users.
 */
export function ReleaseCard({
  post,
  className,
}: {
  post: Post
  className?: string
}) {
  const rows = [
    { label: "Date", value: formatDate(post.date) },
    { label: "Category", value: post.category },
    ...(post.project ? [{ label: "Project", value: post.project }] : []),
  ]

  return (
    <article
      className={cn(
        "group/card relative flex min-h-[28rem] flex-col rounded-2xl bg-card p-6 transition-colors duration-300 hover:bg-card-hover sm:p-8",
        className
      )}
    >
      <h3 className="mb-3 font-sans text-display-s font-semibold">
        <Link
          to="/news/$slug"
          params={{ slug: post.slug }}
          className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent"
        >
          {post.title}
        </Link>
      </h3>
      <p className="max-w-[34ch] text-paragraph-s text-foreground/85 sm:text-paragraph-m">
        {post.summary}
      </p>
      <div className="mt-auto pt-12">
        <dl className="mb-6 border-b border-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4 border-t border-border py-3"
            >
              <dt className="font-mono text-label text-muted-foreground uppercase">
                {row.label}
              </dt>
              <dd className="text-right font-sans text-caption">{row.value}</dd>
            </div>
          ))}
        </dl>
        <span aria-hidden className={buttonClass("primary")}>
          Read {post.category === "Announcements" ? "announcement" : "more"}
          <Arrow />
        </span>
      </div>
    </article>
  )
}
