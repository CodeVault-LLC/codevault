import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { motion, useReducedMotion } from "framer-motion"
import { Check, Fingerprint, Loader2 } from "lucide-react"

import type { AuthAside, AuthPanelProps, AuthStatus } from "./types"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/brand/logo-mark"
import { fadeUp, staggerContainer } from "@/core/lib/motion"
import { site } from "@/core/config/site"

// The door to the archive.
//
// A split screen rather than a lone centered card: the left half runs the
// passkey ceremony, the right half tells you what you are about to walk into.
// That aside is the point — an archive login should show you the archive, so
// arriving reads as arriving somewhere rather than being stopped at a gate.
//
// Deliberately not wrapped in `Container`: this surface is full-bleed by
// design, and a centered max-width would fight the split.
export function AuthPanel({
  eyebrow,
  heading,
  help,
  actionLabel,
  pendingLabel,
  doneLabel = "Opening the archive…",
  onAction,
  disabled = false,
  aside,
  footnote,
}: AuthPanelProps) {
  const [status, setStatus] = useState<AuthStatus>({ phase: "idle" })
  const reduceMotion = useReducedMotion()

  async function run() {
    if (!onAction) return
    setStatus({ phase: "working" })

    try {
      await onAction()
      setStatus({ phase: "done" })
    } catch (error) {
      setStatus({
        phase: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Try again.",
      })
    }
  }

  const working = status.phase === "working"
  const done = status.phase === "done"

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
      <div className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:min-h-0 lg:px-16">
        <Link
          to="/"
          aria-label={`${site.name} home`}
          className="self-start rounded-md opacity-80 transition-opacity hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <LogoMark />
        </Link>

        <main className="flex flex-1 items-center py-14">
          <motion.div
            variants={staggerContainer(0.07, 0.05)}
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            className="w-full max-w-md"
          >
            <motion.p
              variants={fadeUp}
              className="text-faded text-detail-xs font-medium uppercase"
            >
              {eyebrow}
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="mt-4 text-display-l text-balance"
            >
              {heading}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-paragraph-s text-pretty text-muted-foreground"
            >
              {help}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8">
              <Button
                // Taller than any `size` variant: this is the one thing on the
                // page to do, and it should read that way.
                className="h-11 w-full text-[0.9375rem]"
                disabled={disabled || working || done}
                onClick={() => void run()}
              >
                {working && <Loader2 className="animate-spin" />}
                {done && <Check />}
                {!working && !done && !disabled && <Fingerprint />}
                {working ? pendingLabel : done ? doneLabel : actionLabel}
              </Button>

              {/* Announced without stealing focus. */}
              <div aria-live="polite" className="mt-3 min-h-6">
                {status.phase === "error" && (
                  <p className="text-paragraph-s text-pretty text-destructive">
                    {status.message}
                  </p>
                )}
              </div>
            </motion.div>

            {footnote && (
              <motion.div
                variants={fadeUp}
                className="mt-6 border-t border-border pt-6"
              >
                <p className="text-faded text-paragraph-s text-pretty">
                  {footnote}
                </p>
              </motion.div>
            )}
          </motion.div>
        </main>

        <p className="text-faded text-detail-xs">
          © {site.name}. Internal systems.
        </p>
      </div>

      {/* Editorial, not essential — the ceremony on the left stands alone on a
          phone, so this is dropped rather than stacked. */}
      <AuthAsidePanel aside={aside} />
    </div>
  )
}

function AuthAsidePanel({ aside }: { aside: AuthAside }) {
  const reduceMotion = useReducedMotion()
  const List = aside.ordered ? "ol" : "ul"
  const overImage = Boolean(aside.image)

  return (
    <motion.aside
      aria-labelledby="auth-aside-title"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
      className="relative hidden flex-col justify-end overflow-hidden border-l border-border bg-muted px-14 py-12 lg:flex"
    >
      {aside.image && (
        <>
          <img
            src={aside.image.src}
            alt={aside.image.alt}
            className="absolute inset-0 size-full object-cover"
          />
          {/* Carries the copy over a photo whose top half is a pale sky. Fixed
              slate rather than a token: the scrim exists to make white text
              legible, so it must stay dark in both themes. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,var(--slate-dark)_0%,color-mix(in_srgb,var(--slate-dark)_70%,transparent)_35%,transparent_75%)]"
          />
        </>
      )}

      <div className={overImage ? "relative text-ivory-light" : "relative"}>
        <p
          id="auth-aside-title"
          className={
            overImage
              ? "text-detail-xs font-medium uppercase opacity-70"
              : "text-faded text-detail-xs font-medium uppercase"
          }
        >
          {aside.eyebrow}
        </p>

        <p className="mt-5 max-w-sm text-paragraph-m text-pretty">
          {aside.intro}
        </p>

        {aside.items && (
          <List className="mt-10 max-w-sm">
            {aside.items.map((item, index) => (
              <li
                key={item.label}
                className="border-t border-border py-5 last:pb-0"
              >
                <p className="flex items-baseline gap-2 font-mono text-detail-xs font-medium uppercase">
                  {aside.ordered && (
                    <span className="text-faded tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                  {item.label}
                </p>
                <p className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </List>
        )}

        <p
          className={
            overImage
              ? "mt-8 max-w-sm font-serif text-paragraph-s italic opacity-80"
              : "mt-8 max-w-sm font-serif text-paragraph-s text-muted-foreground italic"
          }
        >
          {aside.closing}
        </p>
      </div>
    </motion.aside>
  )
}
