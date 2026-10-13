import { Link } from "@tanstack/react-router"

import type { Guide } from "@/core/config/guides"
import { Arrow } from "@/components/ui/button-link"

/** One line in a list of guides: the title, and the answer under it. */
export function GuideRow({
  guide,
  summary = false,
}: {
  guide: Guide
  summary?: boolean
}) {
  return (
    <li className="border-b border-border">
      <Link
        to="/guides/$slug"
        params={{ slug: guide.slug }}
        className="group/card flex items-start justify-between gap-6 py-5 sm:py-6"
      >
        <div className="min-w-0">
          <h3 className="font-sans text-display-xs font-medium decoration-1 underline-offset-4 group-hover/card:underline">
            {guide.title}
          </h3>
          {summary && (
            <p className="mt-2 max-w-[68ch] text-paragraph-s text-foreground/80">
              {guide.description}
            </p>
          )}
        </div>
        <Arrow className="mt-1 shrink-0 text-muted-foreground transition-colors group-hover/card:text-foreground" />
      </Link>
    </li>
  )
}
