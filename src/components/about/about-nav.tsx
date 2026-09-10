import { Link, useRouterState } from "@tanstack/react-router"
import { Container } from "@/components/layout/container"
import { LogoGlyph } from "@/components/brand/logo-glyph"
import { aboutNav } from "@/core/config/about"
import { site, legalPresentation } from "@/core/config/site"
import { cn } from "@/lib/utils"

export function AboutNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const currentHref = pathname.replace(/\/$/, "")

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container>
        <div className="flex flex-col sm:min-h-20 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <Link
            to="/"
            aria-label={legalPresentation.homeLabel}
            className="flex min-h-16 w-fit items-center gap-3 text-display-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogoGlyph aria-hidden="true" className="size-6" />
            {site.name}
          </Link>
          <nav
            aria-label={site.presentation.aboutNavigation}
            className="-mx-6 min-w-0 overflow-x-auto px-6 sm:mx-0 sm:px-0"
          >
            <ul className="flex min-w-max items-center gap-5 sm:gap-6">
              {aboutNav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    aria-current={
                      currentHref === item.href ? "page" : undefined
                    }
                    className={cn(
                      "flex min-h-12 items-center border-b-2 text-paragraph-s transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-20",
                      currentHref === item.href
                        ? "border-olive text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  )
}
