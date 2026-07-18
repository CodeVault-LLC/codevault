import { Link } from "@tanstack/react-router"
import type { LinkProps } from "@tanstack/react-router"
import { ChevronLeft, ChevronRight } from "lucide-react"

/**
 * Pagination for a dashboard table.
 *
 * Real anchors, like the public archive's, but for a different reason. There
 * the argument is crawlability (design §12); here it is that an operator can
 * middle-click page three into a new tab, and that the browser's back button
 * steps back through pages rather than out of the screen. Both fall out of the
 * state living in the URL.
 *
 * Reports the range as well as the page number. "41–80 of 412" answers "how far
 * in am I" and "should I page or should I filter", which "page 2 of 11" does
 * not.
 *
 * `linkTo` is a callback rather than a `to` string because TanStack types a
 * `search` reducer against one concrete route: passed a union of possible
 * routes it resolves the search shape to `never` and nothing typechecks.
 * Building the link at the call site, where the route *is* concrete, keeps the
 * search params properly checked instead of casting the type away here.
 */
export function AdminPagination({
  page,
  pageCount,
  pageSize,
  total,
  linkTo,
}: {
  page: number
  pageCount: number
  pageSize: number
  total: number
  linkTo: (page: number) => LinkProps
}) {
  if (total === 0) return null

  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 border-t border-border px-6 py-3"
    >
      <p className="text-ui-xs text-muted-foreground">
        <span className="font-mono">
          {first}–{last}
        </span>{" "}
        of <span className="font-mono">{total}</span>
      </p>

      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <PageLink props={linkTo(page - 1)} disabled={page <= 1} rel="prev">
            <ChevronLeft className="size-3.5" aria-hidden />
            Previous
          </PageLink>

          <span className="px-2 text-ui-xs text-muted-foreground">
            <span className="font-mono">{page}</span> / {pageCount}
          </span>

          <PageLink
            props={linkTo(page + 1)}
            disabled={page >= pageCount}
            rel="next"
          >
            Next
            <ChevronRight className="size-3.5" aria-hidden />
          </PageLink>
        </div>
      )}
    </nav>
  )
}

/**
 * A span rather than a disabled anchor at the ends.
 *
 * There is no such thing as a disabled link — `aria-disabled` on an `<a href>`
 * still navigates on Enter — so the honest rendering of "there is no previous
 * page" is not a link at all.
 */
function PageLink({
  props,
  disabled,
  rel,
  children,
}: {
  props: LinkProps
  disabled: boolean
  rel: string
  children: React.ReactNode
}) {
  const className =
    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-ui-xs transition-colors"

  if (disabled) {
    return (
      <span className={`${className} text-muted-foreground/40`} aria-hidden>
        {children}
      </span>
    )
  }

  return (
    <Link
      {...props}
      rel={rel}
      className={`${className} hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none`}
    >
      {children}
    </Link>
  )
}
