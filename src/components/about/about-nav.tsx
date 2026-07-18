import { Link, useRouterState } from "@tanstack/react-router"
import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef } from "react"

import { Container } from "@/components/layout/container"
import { LogoGlyph } from "@/components/brand/logo-glyph"
import { aboutNav } from "@/core/config/about"
import { cn } from "@/lib/utils"

/**
 * Sub-navigation for the /about cluster, rendered once by the layout route.
 *
 * The four labels are wider than a phone, so the row scrolls horizontally with
 * a fade on the right edge — the only honest signal that there's more, since
 * the scrollbar is hidden. The active tab is scrolled into view on arrival so
 * you never land on a page whose own tab is off-screen.
 */
export function AboutNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const reduceMotion = useReducedMotion() ?? false
  const activeRef = useRef<HTMLAnchorElement | null>(null)

  // Trailing slashes aside, /about must not match /about/brand.
  const currentHref = pathname.replace(/\/$/, "")

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "nearest",
    })
  }, [currentHref, reduceMotion])

  return (
    <div className="border-faded relative border-b">
      <Container>
        <nav aria-label="About">
          {/* `-mx-6 px-6` lets the scroll area bleed to the container's padding
              so the first and last tabs sit flush with the page margin. */}
          <ul className="-mx-6 flex scrollbar-none items-center gap-1 overflow-x-auto px-6">
            {/* The way out. The navbar's logo also goes home, but that isn't
                obvious enough to be the only exit from a four-page detour.
                The aperture takes a quarter turn on hover — the same move the
                header lockup makes, so the two read as the same control. */}
            <li className="mr-1 flex shrink-0 items-center gap-1">
              <Link
                to="/"
                aria-label="CodeVault home"
                className="group inline-flex items-center rounded-sm px-2 py-4 text-foreground/60 transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <LogoGlyph className="size-5 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-90 motion-reduce:transition-none motion-reduce:group-hover:rotate-0" />
              </Link>
              <span aria-hidden className="h-4 w-px bg-border" />
            </li>

            {aboutNav.map((item) => {
              const current = currentHref === item.href

              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    to={item.href}
                    ref={current ? activeRef : undefined}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "relative inline-block rounded-sm px-3 py-4 text-sm whitespace-nowrap transition-colors outline-none",
                      "focus-visible:ring-2 focus-visible:ring-ring/50",
                      current
                        ? "text-foreground"
                        : "text-foreground/60 hover:text-foreground"
                    )}
                  >
                    {item.label}

                    {/* One element shared across tabs via `layoutId`, so moving
                        between pages slides the rule rather than cutting it.
                        Only possible because the layout route keeps this nav
                        mounted across navigations. */}
                    {current && (
                      <motion.span
                        aria-hidden
                        layoutId={
                          reduceMotion ? undefined : "about-nav-indicator"
                        }
                        transition={{
                          duration: 0.4,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="absolute inset-x-3 bottom-0 h-px bg-foreground"
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </Container>

      {/* Scroll affordance. Pointer-events-none so it never eats a tap, and
          hidden once the row fits without scrolling. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent sm:hidden"
      />
    </div>
  )
}
