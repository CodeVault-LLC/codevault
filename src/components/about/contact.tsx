import { ArrowUpRight, Check, Copy, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

import { AboutFooterLinks } from "@/components/about/about-footer-links"
import { AboutHero } from "@/components/about/about-hero"
import { Container } from "@/components/layout/container"
import { contact } from "@/core/config/about"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

/** The GitHub mark. Also drawn inline in the site footer. */
function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.08 3.29 9.39 7.86 10.92.58.11.79-.25.79-.56v-2.16c-3.2.7-3.87-1.37-3.87-1.37-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.02 1.76 2.68 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.08 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.18c0 .31.21.68.8.56C20.22 21.4 23.5 17.1 23.5 12.02 23.5 5.66 18.35.5 12 .5Z" />
    </svg>
  )
}

export function Contact() {
  return (
    <>
      <AboutHero
        eyebrow={contact.eyebrow}
        heading={contact.heading}
        lede={contact.lede}
      />

      <Container className="pb-20 md:pb-28">
        <motion.ul
          variants={staggerContainer(0.1, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-4 md:grid-cols-2"
        >
          {contact.channels.map((channel) => (
            <motion.li
              key={channel.kind}
              variants={fadeUp}
              className="border-faded flex flex-col rounded-2xl border p-7 transition-colors hover:bg-muted/60 md:p-8"
            >
              <span className="text-faded flex items-center gap-2 text-detail-xs font-medium uppercase">
                {channel.kind === "email" ? (
                  <Mail className="size-3.5" />
                ) : (
                  <GithubMark className="size-3.5" />
                )}
                {channel.label}
              </span>

              {channel.kind === "email" ? (
                <EmailValue value={channel.value} href={channel.href} />
              ) : (
                <a
                  href={channel.href}
                  className="group mt-4 inline-flex w-fit items-baseline gap-1.5 text-display-s font-medium transition-colors outline-none hover:text-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <span className="border-b border-transparent transition-colors group-hover:border-foreground/30">
                    {channel.value}
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 self-center transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}

              <p className="mt-3 text-paragraph-s text-pretty text-muted-foreground">
                {channel.description}
              </p>
            </motion.li>
          ))}
        </motion.ul>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="text-faded mt-8 max-w-lg text-paragraph-s text-pretty"
        >
          {contact.footnote}
        </motion.p>
      </Container>

      <AboutFooterLinks
        links={[
          {
            label: "How we work",
            href: "/about",
            description: "The stance, and the loop every project runs.",
          },
          {
            label: "Brand",
            href: "/about/brand",
            description: "The mark, the palette, the type.",
          },
        ]}
      />
    </>
  )
}

/**
 * The address as a mailto link, with copy-to-clipboard beside it.
 *
 * Plenty of people don't have a mail client wired to `mailto:`, and for them a
 * link that opens nothing is worse than no link — so the address is always
 * copyable regardless of what the click does.
 */
function EmailValue({ value, href }: { value: string; href: string }) {
  const [copied, setCopied] = useState(false)

  // Reset on a timer, cleaned up so unmounting mid-countdown doesn't set state
  // on a gone component.
  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(id)
  }, [copied])

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      <a
        href={href}
        className="group inline-flex w-fit items-baseline text-display-s font-medium transition-colors outline-none hover:text-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <span className="border-b border-transparent transition-colors group-hover:border-foreground/30">
          {value}
        </span>
      </a>

      <button
        type="button"
        onClick={() => {
          navigator.clipboard
            .writeText(value)
            .then(() => setCopied(true))
            // A blocked clipboard permission shouldn't throw into the console;
            // the address is visible and selectable either way.
            .catch(() => undefined)
        }}
        className="border-faded text-faded inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-detail-xs transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <motion.span
          key={copied ? "copied" : "idle"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-1.5"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </motion.span>
      </button>

      {/* Announced politely so the confirmation isn't only a colour/icon change. */}
      <span aria-live="polite" className="sr-only">
        {copied ? `${value} copied to clipboard` : ""}
      </span>
    </div>
  )
}
