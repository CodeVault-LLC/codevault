import { Link } from "@tanstack/react-router"

import type { Post } from "@/core/config/news"
import { formatDate } from "@/core/config/news"
import { Arrow } from "@/components/ui/button-link"

/** One line in a news list: category and date above, title below. */
export function NewsRow({
  post,
  summary = false,
}: {
  post: Post
  summary?: boolean
}) {
  return (
    <li className="border-b border-border">
      <Link
        to="/news/$slug"
        params={{ slug: post.slug }}
        className="group/card flex items-start justify-between gap-6 py-5 sm:py-6"
      >
        <div className="min-w-0">
          <p className="mb-2 flex flex-wrap items-baseline gap-x-3 font-sans text-caption">
            <span className="font-medium">{post.category}</span>
            <time dateTime={post.date} className="text-muted-foreground">
              {formatDate(post.date, "short")}
            </time>
          </p>
          <h3 className="font-sans text-display-xs font-medium decoration-1 underline-offset-4 group-hover/card:underline">
            {post.title}
          </h3>
          {summary && (
            <p className="mt-2 max-w-[68ch] text-paragraph-s text-foreground/80">
              {post.summary}
            </p>
          )}
        </div>
        <Arrow className="mt-8 shrink-0 text-muted-foreground transition-colors group-hover/card:text-foreground" />
      </Link>
    </li>
  )
}
