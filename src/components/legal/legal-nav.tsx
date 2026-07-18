import { Link, useRouterState } from "@tanstack/react-router"
import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef } from "react"

import { Container } from "@/components/layout/container"
import { LogoGlyph } from "@/components/brand/logo-glyph"
import { cn } from "@/lib/utils"
import { legalNav } from "@/core/config/legal"

/**
 * Sub-navigation for the /legal cluster, rendered once by the layout route.
 *
 * Deliberately the same furniture as `AboutNav` — someone who arrives here
 * from the footer should recognise where they are without re-learning the
 * page. Five labels don't fit a phone, so the row scrolls with a fade on the
 * right edge and the active tab is scrolled into view on arrival.
 */
export function LegalNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const reduceMotion = useReducedMotion() ?? false
  const activeRef = useRef<HTMLAnchorElement | null>(null)

  // Trailing slashes aside, /legal must not match /legal/privacy.
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
        <nav aria-label="Legal">
          <ul className="-mx-6 flex scrollbar-none items-center gap-1 overflow-x-auto px-6">
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

            {legalNav.map((item) => {
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

                    {current && (
                      <motion.span
                        aria-hidden
                        layoutId={
                          reduceMotion ? undefined : "legal-nav-indicator"
                        }
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent sm:hidden"
      />
    </div>
  )
}
