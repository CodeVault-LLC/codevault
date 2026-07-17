import { Link } from "@tanstack/react-router"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ChevronDown, Menu, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Container } from "@/components/layout/container"
import { LogoMark } from "@/components/brand/logo-mark"
import { mainNav } from "@/core/config/site"
import type { NavItem } from "@/core/config/site"
import { cn } from "@/lib/utils"

export function Navbar() {
  const reduceMotion = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close the mobile menu when the viewport grows into the desktop layout,
  // so it can't get stranded open behind the desktop nav.
  useEffect(() => {
    if (!mobileOpen) return
    const mq = window.matchMedia("(min-width: 768px)")
    const onChange = () => mq.matches && setMobileOpen(false)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [mobileOpen])

  const open = (i: number) => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setOpenIndex(i)
  }
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpenIndex(null), 120)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled
          ? "border-faded border-b bg-ivory-light/75 backdrop-blur-md supports-[backdrop-filter]:bg-ivory-light/60"
          : "border-b border-transparent bg-transparent"
      )}
      onMouseLeave={scheduleClose}
    >
      <Container className="flex h-16 items-center justify-between md:h-[68px]">
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="CodeVault home"
          >
            <LogoMark />
          </Link>

          <nav aria-label="Primary" className="hidden items-center md:flex">
            <ul className="flex items-center">
              {mainNav.map((item, i) => (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.sections && open(i)}
                  onFocus={() => item.sections && open(i)}
                >
                  {item.sections ? (
                    <button
                      type="button"
                      className={cn(
                        "group inline-flex items-center gap-1 px-3 py-2 font-serif text-[15px] underline-offset-[6px] transition-colors",
                        openIndex === i
                          ? "text-foreground underline decoration-foreground/70"
                          : "text-foreground/80 hover:text-foreground"
                      )}
                      aria-expanded={openIndex === i}
                      aria-haspopup="true"
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "size-3.5 text-foreground/60 transition-transform duration-300",
                          openIndex === i && "rotate-180"
                        )}
                      />
                      <span
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute inset-x-3 bottom-1 h-px bg-foreground/70 transition-transform duration-300 ease-out",
                          openIndex === i
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        )}
                      />
                    </button>
                  ) : (
                    <a
                      href={item.href ?? "#"}
                      className="group relative px-3 py-2 font-serif text-[15px] text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-x-3 bottom-1 h-px scale-x-0 bg-foreground/70 transition-transform duration-300 ease-out group-hover:scale-x-100"
                      />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#writing"
            className="hidden rounded-md px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:text-foreground md:inline-block"
          >
            Writing
          </a>
          <a
            href="#contact"
            className="inline-flex h-8 items-center justify-center rounded-md bg-foreground px-3 text-sm font-medium text-ivory-light transition-colors hover:bg-slate-medium"
          >
            Get in touch
          </a>
          <button
            type="button"
            className="-mr-1 inline-flex size-9 items-center justify-center rounded-md text-foreground/80 transition-colors hover:text-foreground md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </Container>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <AnimatePresence>
        {openIndex !== null && mainNav[openIndex]?.sections && (
          <motion.div
            key={openIndex}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -8, clipPath: "inset(0 0 100% 0)" }
            }
            animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -4, clipPath: "inset(0 0 100% 0)" }
            }
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full"
            onMouseEnter={() => open(openIndex)}
            onMouseLeave={scheduleClose}
          >
            <Container className="pt-2">
              <DropdownPanel item={mainNav[openIndex]} />
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function DropdownPanel({ item }: { item: NavItem }) {
  return (
    <div className="border-faded overflow-hidden rounded-2xl border bg-ivory-light shadow-[0_16px_40px_-20px_rgba(20,20,19,0.18)]">
      <div className="grid grid-cols-1 gap-8 p-7 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-faded max-w-sm text-paragraph-s text-pretty">
            {item.description}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8">
          {item.sections?.map((s) => (
            <div key={s.heading}>
              <h3 className="text-faded text-detail-xs font-medium uppercase">
                {s.heading}
              </h3>
              <ul className="mt-3 space-y-2">
                {s.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-foreground/70"
                    >
                      <span className="border-b border-transparent transition-colors group-hover:border-foreground/30">
                        {l.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="border-faded overflow-hidden border-b bg-ivory-light/95 backdrop-blur-md md:hidden"
        >
          <Container className="max-h-[calc(100svh-4rem)] overflow-y-auto py-6">
            <nav aria-label="Mobile" className="flex flex-col">
              {mainNav.map((item) => (
                <div
                  key={item.label}
                  className="border-faded border-b py-5 first:pt-0 last:border-b-0"
                >
                  <p className="font-serif text-[17px] text-foreground">
                    {item.label}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5">
                    {item.sections
                      ?.flatMap((s) => s.links)
                      .map((l) => (
                        <a
                          key={l.label}
                          href={l.href}
                          onClick={onClose}
                          className="text-sm text-foreground/75 transition-colors hover:text-foreground"
                        >
                          {l.label}
                        </a>
                      ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href="#writing"
                onClick={onClose}
                className="rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:text-foreground"
              >
                Writing
              </a>
              <a
                href="#contact"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-3 text-sm font-medium text-ivory-light transition-colors hover:bg-slate-medium"
              >
                Get in touch
              </a>
            </div>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
