import { useEffect, useState } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { ArrowUpRight, Menu, X } from "lucide-react"

import { site } from "@/core/config/site"
import { cn } from "@/lib/utils"
import { LogoGlyph } from "@/components/brand/logo-glyph"
import { ButtonLink } from "@/components/ui/button-link"
import { Container } from "./container"

/**
 * The top bar. At the top of the page it shows the full wordmark; once the
 * page scrolls it settles onto a solid background and the wordmark folds
 * away to the mark, the way Anthropic's does.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close the menu on navigation, and let Escape close it.
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        scrolled || open
          ? "bg-background/90 shadow-[0_1px_0_var(--border)] backdrop-blur-md"
          : "bg-background"
      )}
    >
      <a
        href="#main"
        className="sr-only rounded-md bg-foreground px-3 py-2 font-sans text-ui text-background focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Container className="flex h-16 items-center justify-between lg:h-[4.5rem]">
        <Link
          to="/"
          aria-label={`${site.name} home`}
          className="flex items-center gap-2 font-sans"
        >
          <LogoGlyph className="size-6" />
          <span
            className={cn(
              "overflow-hidden text-display-xs font-semibold whitespace-nowrap transition-[max-width,opacity] duration-500 ease-out-soft",
              scrolled ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
            )}
          >
            {site.name}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="font-sans text-ui text-foreground/80 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={site.github}
            className="inline-flex items-center gap-1 font-sans text-ui text-foreground/80 transition-colors hover:text-foreground"
          >
            GitHub
            <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={1.75} />
          </a>
          <ButtonLink to={site.cta.href}>{site.cta.label}</ButtonLink>
        </nav>

        <button
          type="button"
          className="-mr-2 inline-flex size-10 items-center justify-center rounded-lg md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </Container>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="fixed inset-x-0 top-16 bottom-0 bg-background md:hidden"
        >
          <Container className="flex flex-col pt-4">
            {site.nav.map((item, i) => (
              <Link
                key={item.href}
                to={item.href}
                style={{ "--d": `${i * 50}ms` } as React.CSSProperties}
                className="fade-rise border-b border-border py-5 font-sans text-display-m font-semibold"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={site.github}
              style={{ "--d": "100ms" } as React.CSSProperties}
              className="fade-rise flex items-center gap-2 border-b border-border py-5 font-sans text-display-m font-semibold"
            >
              GitHub <ArrowUpRight aria-hidden className="size-5" />
            </a>
            <ButtonLink to={site.cta.href} className="mt-8 h-12 justify-center">
              {site.cta.label}
            </ButtonLink>
          </Container>
        </nav>
      )}
    </header>
  )
}
