import { Link } from "@tanstack/react-router"
import { Navbar } from "@/components/layout/navbar"
import { Container } from "@/components/layout/container"
import { LogoMark } from "@/components/brand/logo-mark"
import { researchPage as page } from "@/core/config/site"

export const researchLink =
  "inline-flex items-center gap-2 text-paragraph-s font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
export const researchButton =
  "inline-flex min-h-10 items-center justify-center gap-3 bg-foreground px-4 py-2 text-paragraph-s font-medium text-background transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"

export function ResearchShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="research-surface flex min-h-svh flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-faded border-t">
        <Container className="flex flex-wrap items-center justify-between gap-6 py-8">
          <Link
            to="/"
            aria-label={page.homeLabel}
            className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <LogoMark />
          </Link>
          <nav aria-label={page.footerLabel} className="flex flex-wrap gap-6">
            <Link to="/research" className={researchLink}>
              {page.title}
            </Link>
            <Link to="/legal/security" className={researchLink}>
              {page.disclosureLabel}
            </Link>
            <Link to="/about/contact" className={researchLink}>
              {page.contactLabel}
            </Link>
          </nav>
        </Container>
      </footer>
    </div>
  )
}
