import { Link } from "@tanstack/react-router"

import { Container } from "@/components/layout/container"
import { LogoMark } from "@/components/brand/logo-mark"
import { reportsArchive } from "@/core/config/reports"

// A separate component from the marketing `Navbar`, not `Navbar` with an
// `isAdmin` prop. That coupling is exactly what this structure exists to
// prevent: the archive's chrome — and later its Sign in link — cannot appear on
// a consumer page, because the consumer pages do not render this file
// (design §3).
//
// Denser than the marketing nav and mono-forward, with no serif-italic accent.
// Dropping that accent is the clearest signal you have entered a different room
// without leaving the design system (design §13).
export function ReportsNavbar() {
  return (
    <header className="border-faded border-b">
      <Container className="flex h-14 items-center justify-between gap-6">
        <Link
          to="/reports"
          className="flex items-center gap-3 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <LogoMark />
          <span className="text-faded hidden font-mono text-detail-xs tracking-wide uppercase sm:inline">
            {reportsArchive.name}
          </span>
        </Link>

        <nav>
          <Link
            to="/"
            className="text-faded rounded-sm text-detail-xs transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            codevault.dev
          </Link>
        </nav>
      </Container>
    </header>
  )
}
