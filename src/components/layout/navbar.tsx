import { Link } from "@tanstack/react-router"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ChevronDown, Menu, X } from "lucide-react"
import { useCallback, useEffect, useId, useRef, useState } from "react"

import { Container } from "@/components/layout/container"
import { LogoMark } from "@/components/brand/logo-mark"
import { mainNav } from "@/core/config/site"
import { cn } from "@/lib/utils"

// Hover intent. Opening is delayed so a cursor crossing the nav on its way
// somewhere else doesn't trip a panel, but once a panel is already open,
// moving between items swaps instantly — at that point the intent is proven.
const OPEN_DELAY = 100
const CLOSE_DELAY = 150

// One fixed-size panel that slides between triggers, rather than four panels
// that each size to their contents. Every menu opens at identical dimensions,
// so moving along the nav reads as a single object tracking the cursor instead
// of a box resizing under it. Kept in px because the slide distance is measured
// against the trigger's offsetLeft.
const PANEL_WIDTH = 384 // matches w-96 (24rem)
const VIEWPORT_MARGIN = 24 // matches Container's px-6

export function Navbar() {
  const panelId = `${useId()}-nav-panel`
  const reduceMotion = useReducedMotion() ?? false

  const [scrolled, setScrolled] = useState(false)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [panelX, setPanelX] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navRef = useRef<HTMLElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
  const openTimer = useRef<number | null>(null)
  const closeTimer = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
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

  // Align the panel's left edge to its trigger, then pull it back if a
  // fixed-width panel would otherwise run past the right edge of the viewport.
  const positionPanel = useCallback((i: number) => {
    const trigger = triggerRefs.current[i]
    const list = listRef.current
    if (!trigger || !list) return
    const available =
      window.innerWidth -
      VIEWPORT_MARGIN -
      list.getBoundingClientRect().left -
      PANEL_WIDTH
    setPanelX(Math.max(0, Math.min(trigger.offsetLeft, available)))
  }, [])

  useEffect(() => {
    if (openIndex === null) return
    const onResize = () => positionPanel(openIndex)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [openIndex, positionPanel])

  const clearTimers = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current)
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    openTimer.current = null
    closeTimer.current = null
  }

  useEffect(() => clearTimers, [])

  // Escape returns focus to the trigger; a pointer landing outside the nav
  // dismisses. Without the latter there is no way to close a panel on touch.
  useEffect(() => {
    if (openIndex === null) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      clearTimers()
      triggerRefs.current[openIndex]?.focus()
      setOpenIndex(null)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current?.contains(e.target as Node)) return
      clearTimers()
      setOpenIndex(null)
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [openIndex])

  const requestOpen = (i: number) => {
    clearTimers()
    positionPanel(i)
    if (openIndex !== null) {
      setOpenIndex(i)
      return
    }
    openTimer.current = window.setTimeout(() => setOpenIndex(i), OPEN_DELAY)
  }

  const requestClose = () => {
    clearTimers()
    closeTimer.current = window.setTimeout(
      () => setOpenIndex(null),
      CLOSE_DELAY
    )
  }

  const toggle = (i: number) => {
    clearTimers()
    positionPanel(i)
    setOpenIndex((current) => (current === i ? null : i))
  }

  const activeItem = openIndex === null ? null : mainNav[openIndex]
  const multiSection = (activeItem?.sections?.length ?? 0) > 1

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-background/75 backdrop-blur-md supports-backdrop-filter:bg-background/60"
          : "border-transparent bg-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="CodeVault home"
          >
            <LogoMark />
          </Link>

          <nav
            aria-label="Primary"
            ref={navRef}
            className="hidden items-center md:flex"
            onMouseLeave={requestClose}
          >
            <ul ref={listRef} className="relative flex items-center">
              {mainNav.map((item, i) => {
                const isOpen = openIndex === i

                return (
                  <li
                    key={item.label}
                    onMouseEnter={() => item.sections && requestOpen(i)}
                  >
                    {item.sections ? (
                      <button
                        type="button"
                        ref={(el) => {
                          triggerRefs.current[i] = el
                        }}
                        className={cn(
                          "group relative inline-flex items-center gap-1.5 rounded-sm px-3 py-2 font-serif text-[15px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                          isOpen
                            ? "text-foreground"
                            : "text-foreground/80 hover:text-foreground"
                        )}
                        aria-expanded={isOpen}
                        aria-haspopup="menu"
                        aria-controls={isOpen ? panelId : undefined}
                        onClick={() => toggle(i)}
                        onFocus={() => requestOpen(i)}
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            "size-3 text-foreground/40 transition-transform duration-200",
                            isOpen && "rotate-180"
                          )}
                        />
                        <span
                          aria-hidden
                          className={cn(
                            "pointer-events-none absolute inset-x-3 bottom-1 h-px bg-foreground/70 transition-transform duration-300 ease-out",
                            isOpen
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100"
                          )}
                        />
                      </button>
                    ) : (
                      <a
                        href={item.href ?? "#"}
                        className="group relative rounded-sm px-3 py-2 font-serif text-[15px] text-foreground/80 transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        {item.label}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-x-3 bottom-1 h-px scale-x-0 bg-foreground/70 transition-transform duration-300 ease-out group-hover:scale-x-100"
                        />
                      </a>
                    )}
                  </li>
                )
              })}

              <AnimatePresence>
                {activeItem?.sections && (
                  <motion.div
                    // A stable key: swapping menus must move this element, not
                    // remount it, or the slide never happens.
                    key="nav-panel"
                    initial={
                      reduceMotion
                        ? { opacity: 0, x: panelX }
                        : { opacity: 0, y: -4, x: panelX }
                    }
                    animate={{ opacity: 1, y: 0, x: panelX }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: -4, transition: { duration: 0.12 } }
                    }
                    transition={{
                      duration: 0.18,
                      ease: [0.22, 1, 0.36, 1],
                      x: reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                    }}
                    // pt-2 rather than mt-2: the gap has to stay inside the
                    // hover target so travelling from trigger to panel never
                    // crosses dead space.
                    className="absolute top-full left-0 pt-2"
                  >
                    <div
                      id={panelId}
                      // Fixed footprint: w-96 × min-h-44 is exactly the tallest
                      // menu's natural size (Projects, 175px), so every panel
                      // opens identical and none of them clip.
                      className="border-faded min-h-44 w-96 rounded-lg border bg-popover p-5 shadow-[0_8px_24px_-12px_rgba(20,20,19,0.12)]"
                    >
                      <motion.div
                        key={`sections-${openIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          "grid gap-x-8 gap-y-5",
                          multiSection ? "grid-cols-2" : "grid-cols-1"
                        )}
                      >
                        {activeItem.sections.map((section) => (
                          <div key={section.heading}>
                            <h3 className="text-faded text-detail-xs font-medium uppercase">
                              {section.heading}
                            </h3>
                            <ul
                              className={cn(
                                "mt-3",
                                // A menu with one section would otherwise leave
                                // the right half of a fixed-width panel empty,
                                // so its links flow into two columns instead.
                                multiSection ? "space-y-0.5" : "columns-2 gap-8"
                              )}
                            >
                              {section.links.map((link) => (
                                <li key={link.label}>
                                  <a
                                    href={link.href}
                                    className="group/link relative inline-block rounded-sm py-0.5 text-sm text-foreground/70 transition-colors duration-200 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                                  >
                                    {link.label}
                                    {/* Wipes in from the left on hover, echoing
                                        the underline already used on the nav
                                        triggers so both read as one gesture. */}
                                    <span
                                      aria-hidden
                                      className="pointer-events-none absolute inset-x-0 bottom-0.5 h-px origin-left scale-x-0 bg-foreground/40 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:scale-x-100 motion-reduce:transition-none"
                                    />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/about/contact"
            className="inline-flex h-8 items-center justify-center rounded-md bg-foreground px-3 text-sm font-medium text-background transition-colors outline-none hover:bg-slate-medium focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Get in touch
          </a>
          <button
            type="button"
            className="-mr-1 inline-flex size-9 items-center justify-center rounded-md text-foreground/80 transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
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
    </header>
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
          className="border-faded overflow-hidden border-b bg-background/95 backdrop-blur-md md:hidden"
        >
          <Container className="max-h-[calc(100svh-4rem)] overflow-y-auto py-6">
            <nav aria-label="Mobile" className="flex flex-col">
              {mainNav.map((item) => (
                <div
                  key={item.label}
                  className="border-faded border-b py-5 first:pt-0 last:border-b-0"
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      onClick={onClose}
                      className="font-serif text-[17px] text-foreground"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <p className="font-serif text-[17px] text-foreground">
                      {item.label}
                    </p>
                  )}

                  {item.sections?.map((section) => (
                    <div key={section.heading} className="mt-4">
                      <h3 className="text-faded text-detail-xs font-medium uppercase">
                        {section.heading}
                      </h3>
                      <div className="mt-2.5 grid grid-cols-2 gap-x-6 gap-y-2.5">
                        {section.links.map((link) => (
                          <a
                            key={link.label}
                            href={link.href}
                            onClick={onClose}
                            className="text-sm text-foreground/75 transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </nav>

            <div className="mt-6">
              <a
                href="/about/contact"
                onClick={onClose}
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-foreground px-3 text-sm font-medium text-background transition-colors hover:bg-slate-medium"
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
