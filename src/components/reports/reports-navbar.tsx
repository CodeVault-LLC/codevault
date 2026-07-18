import { Link, useRouterState } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"

import { Container } from "@/components/layout/container"
import { LogoMark } from "@/components/brand/logo-mark"
import { reportsArchive } from "@/core/config/reports"
import { cn } from "@/lib/utils"

// A separate component from the marketing `Navbar`, not `Navbar` with an
// `isAdmin` prop. That coupling is exactly what this structure exists to
// prevent: the archive's chrome — and later its Sign in link — cannot appear on
// a consumer page, because the consumer pages do not render this file
// (design §3).
//
// Shaped as a catalogue masthead rather than a topbar: institution, hairline,
// series designator on the left; the archive's own two destinations on the
// right. The active section's rule is 2px and sits *over* the header's bottom
// border, so the tab notches into the masthead rule the way a card catalogue
// divider stands proud of its drawer. That notch is the only flourish here —
// everything else stays quiet (design-rules §Principles 1).
//
// Set in Inter, not mono. `--font-mono` on public routes names three faces that
// are only loaded under `.admin-surface`, so `font-mono` out here silently
// falls through to the browser's default monospace; and mono is the admin
// surface's typeface regardless (design-rules §Surfaces).
export function ReportsNavbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  // A record page belongs to the records section, so anything that is not the
  // browse index marks `Records` as current.
  const onBrowse = pathname.startsWith("/reports/browse")

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70">
      <Container className="flex h-14 items-center justify-between gap-4">
        {/* `exact` for the same reason as the nav items below: without it the
            masthead announces itself as the current page from every record and
            from the browse index, none of which it is. */}
        <Link
          to="/reports"
          activeOptions={{ exact: true }}
          className="flex items-center gap-3 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <LogoMark />
          {/* The series designator, ruled off from the institution mark. */}
          <span aria-hidden className="hidden h-4 w-px bg-border sm:block" />
          <span className="text-faded hidden text-detail-xs leading-none uppercase sm:inline">
            {reportsArchive.name}
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <nav
            aria-label="Archive"
            className="flex items-center gap-4 sm:gap-6"
          >
            <ArchiveLink to="/reports" current={!onBrowse}>
              {reportsArchive.nav.records}
            </ArchiveLink>
            <ArchiveLink to="/reports/browse" current={onBrowse}>
              {reportsArchive.nav.browse}
            </ArchiveLink>
          </nav>

          <span aria-hidden className="h-4 w-px bg-border" />

          {/* The way out. The arrow is the only thing saying this link leaves
              the archive for a different surface, so it stays even when the
              label is dropped on narrow viewports. */}
          <Link
            to="/"
            aria-label={reportsArchive.nav.exitLabel}
            className="text-faded group inline-flex items-center gap-1.5 rounded-sm text-detail-xs leading-none uppercase transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="hidden sm:inline">{reportsArchive.nav.exit}</span>
            <ArrowUpRight
              aria-hidden
              className="size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-px group-hover:-translate-y-px motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
            />
          </Link>
        </div>
      </Container>
    </header>
  )
}

type ArchiveLinkProps = {
  to: "/reports" | "/reports/browse"
  current: boolean
  children: React.ReactNode
}

// Full header height so the underline can reach the masthead rule; `-bottom-px`
// lands it on top of the header's own border rather than beneath it.
function ArchiveLink({ to, current, children }: ArchiveLinkProps) {
  return (
    <Link
      to={to}
      // `/reports` is a prefix of every record URL, so the router's default
      // fuzzy match would light up `Records` on the browse index too. The
      // current section is decided by the caller, not by prefix.
      activeOptions={{ exact: true }}
      aria-current={current ? "page" : undefined}
      className={cn(
        "relative inline-flex h-14 items-center text-detail-xs leading-none uppercase transition-colors",
        "after:absolute after:inset-x-0 after:-bottom-px after:transition-colors",
        "focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "motion-reduce:transition-none motion-reduce:after:transition-none",
        current
          ? "text-foreground after:h-0.5 after:bg-foreground"
          : "text-faded after:h-px after:bg-transparent hover:text-foreground hover:after:bg-cloud-dark"
      )}
    >
      {children}
    </Link>
  )
}
