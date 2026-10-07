import { Link, useRouterState } from "@tanstack/react-router"
import { Navbar } from "@/components/layout/navbar"
import { Container } from "@/components/layout/container"
import { reportsArchive } from "@/core/config/reports"
import { cn } from "@/lib/utils"

export function ReportsNavbar() {
  const onBrowse = useRouterState({
    select: (s) => s.location.pathname.startsWith("/reports/browse"),
  })
  return (
    <>
      <Navbar />
      <nav aria-label={reportsArchive.name} className="border-b border-border">
        <Container className="flex items-center gap-8">
          <span className="eyebrow hidden sm:block">{reportsArchive.name}</span>
          <Link
            to="/reports"
            aria-current={!onBrowse ? "page" : undefined}
            className={cn(
              "focus-ring flex min-h-14 items-center border-b-2 text-paragraph-s",
              !onBrowse
                ? "border-foreground"
                : "border-transparent text-muted-foreground"
            )}
          >
            {reportsArchive.nav.records}
          </Link>
          <Link
            to="/reports/browse"
            aria-current={onBrowse ? "page" : undefined}
            className={cn(
              "focus-ring flex min-h-14 items-center border-b-2 text-paragraph-s",
              onBrowse
                ? "border-foreground"
                : "border-transparent text-muted-foreground"
            )}
          >
            {reportsArchive.nav.browse}
          </Link>
        </Container>
      </nav>
    </>
  )
}
