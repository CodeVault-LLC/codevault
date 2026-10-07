import { Link, useRouterState } from "@tanstack/react-router"
import { Menu, Moon, Sun, X, ArrowUpRight } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

import { Container } from "@/components/layout/container"
import { LogoMark } from "@/components/brand/logo-mark"
import { navigation } from "@/core/config/site"
import { cn } from "@/lib/utils"

export function Navbar({
  allowThemeSwitch = true,
}: {
  allowThemeSwitch?: boolean
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const media = window.matchMedia("(min-width: 1024px)")
    const onResize = () => {
      if (media.matches) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    media.addEventListener("change", onResize)
    return () => {
      document.removeEventListener("keydown", onKey)
      media.removeEventListener("change", onResize)
    }
  }, [open])

  const changeTheme = () => {
    const next = !document.documentElement.classList.contains("dark")
    document.documentElement.classList.toggle("dark", next)
    setDark(next)
    try {
      localStorage.setItem("codevault-theme", next ? "dark" : "light")
    } catch {
      /* Storage may be blocked. The theme still works for this visit. */
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <a href="#main-content" className="skip-link">
        {navigation.skip}
      </a>
      <Container className="flex h-16 items-center gap-5 lg:h-[4.25rem]">
        <Link to="/" aria-label={navigation.home} className="focus-ring">
          <LogoMark />
        </Link>
        <nav aria-label={navigation.label} className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-6">
            {navigation.links.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  aria-current={
                    pathname.startsWith(item.href) ? "page" : undefined
                  }
                  className={cn(
                    "nav-link focus-ring",
                    pathname.startsWith(item.href) && "nav-link-current"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-3 lg:ml-2">
          {allowThemeSwitch && (
            <button
              type="button"
              onClick={changeTheme}
              aria-label={navigation.theme}
              aria-pressed={dark}
              className="focus-ring inline-flex size-11 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {dark ? (
                <Sun aria-hidden="true" className="size-4" />
              ) : (
                <Moon aria-hidden="true" className="size-4" />
              )}
            </button>
          )}
          <Link
            to="/about/contact"
            className="editorial-button hidden min-h-9 gap-3 px-4 py-2 text-navigation sm:inline-flex"
          >
            {navigation.contact}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? navigation.close : navigation.open}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen(!open)}
            className="focus-ring inline-flex size-11 items-center justify-center lg:hidden"
          >
            {open ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </Container>
      <nav
        id={panelId}
        hidden={!open}
        aria-label={navigation.label}
        className="border-t border-border bg-background lg:hidden"
      >
        <Container className="max-h-[calc(100svh-4rem)] overflow-y-auto py-6">
          <ul>
            {navigation.links.map((item) => (
              <li key={item.href} className="border-b border-border">
                <Link
                  to={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={
                    pathname.startsWith(item.href) ? "page" : undefined
                  }
                  className="focus-ring flex items-baseline gap-5 py-5 text-display-m font-normal"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/about/contact"
            onClick={() => setOpen(false)}
            className="editorial-link mt-6"
          >
            {navigation.contact}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </Container>
      </nav>
    </header>
  )
}
