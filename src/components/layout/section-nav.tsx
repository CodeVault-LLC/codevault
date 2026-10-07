import { Link, useRouterState } from "@tanstack/react-router"
import { Container } from "@/components/layout/container"
import { cn } from "@/lib/utils"

type SectionNavProps = {
  label: string
  links: readonly { label: string; href: string }[]
}

export function SectionNav({ label, links }: SectionNavProps) {
  const pathname = useRouterState({
    select: (s) => s.location.pathname.replace(/\/$/, ""),
  })
  return (
    <nav aria-label={label} className="border-b border-border bg-background">
      <Container className="flex items-center gap-10">
        <span className="hidden shrink-0 font-mono text-detail-xs text-muted-foreground lg:block">
          {label}
        </span>
        <ul className="flex min-w-0 gap-6 overflow-x-auto">
          {links.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link
                to={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "focus-ring flex min-h-14 items-center border-b-2 text-paragraph-s",
                  pathname === link.href
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  )
}
