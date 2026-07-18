import { Link } from "@tanstack/react-router"

import type { AdminShellProps } from "./types"
import { Container } from "@/components/layout/container"
import { LogoMark } from "@/components/brand/logo-mark"

// Denser than either the marketing site or the archive, no olive except on
// status, and no motion (design §13). A third sibling layout branch, so admin
// chrome cannot appear anywhere else.
export function AdminShell({ children, userName }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-faded border-b">
        <Container className="flex h-12 items-center justify-between gap-6">
          <Link to="/admin" className="flex items-center gap-3">
            <LogoMark withWordmark={false} />
            <span className="text-faded font-mono text-detail-xs tracking-wide uppercase">
              Dashboard
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/admin/deposit"
              className="text-faded text-detail-xs transition-colors hover:text-foreground"
            >
              Deposit
            </Link>
            <Link
              to="/reports"
              className="text-faded text-detail-xs transition-colors hover:text-foreground"
            >
              Archive
            </Link>
            <span className="text-faded font-mono text-detail-xs">
              {userName}
            </span>
          </div>
        </Container>
      </header>

      <main>{children}</main>
    </div>
  )
}
