import { Check, X } from "lucide-react"
import { motion } from "framer-motion"

import { AboutFooterLinks } from "@/components/about/about-footer-links"
import { AboutHero } from "@/components/about/about-hero"
import { AboutSection } from "@/components/about/about-section"
import { Container } from "@/components/layout/container"
import { LogoGlyph, LogoMark, Scout } from "@/components/brand"
import { brand } from "@/core/config/about"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

const reveal = {
  variants: staggerContainer(0.08, 0.05),
  initial: false,
  whileInView: "show",
  viewport: viewportOnce,
} as const

export function Brand() {
  return (
    <>
      <AboutHero
        eyebrow={brand.eyebrow}
        heading={brand.heading}
        lede={brand.lede}
      />

      <Container className="pb-20 md:pb-28">
        <div className="flex flex-col gap-14 md:gap-20">
          <AboutSection
            index={brand.mark.index}
            label={brand.mark.label}
            title={brand.mark.title}
            body={brand.mark.body}
          >
            <MarkSpecimens />
            <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
              {brand.mark.rules.map((rule) => (
                <li
                  key={rule.text}
                  className="flex items-start gap-2.5 text-paragraph-s text-pretty"
                >
                  {rule.do ? (
                    <Check
                      className="mt-1 size-4 shrink-0 text-olive"
                      aria-label="Do"
                    />
                  ) : (
                    <X
                      className="mt-1 size-4 shrink-0 text-muted-foreground"
                      aria-label="Don't"
                    />
                  )}
                  <span
                    className={rule.do ? undefined : "text-muted-foreground"}
                  >
                    {rule.text}
                  </span>
                </li>
              ))}
            </ul>
          </AboutSection>

          <AboutSection
            index={brand.scout.index}
            label={brand.scout.label}
            title={brand.scout.title}
            body={brand.scout.body}
          >
            <div className="border-faded mt-8 flex items-end justify-center gap-10 rounded-2xl border bg-muted px-6 py-12 sm:gap-16">
              <Scout className="size-10 text-foreground/80" />
              <Scout className="size-16 text-foreground/80" />
              <Scout className="size-24 text-foreground" />
            </div>
          </AboutSection>

          <AboutSection
            index={brand.color.index}
            label={brand.color.label}
            title={brand.color.title}
            body={brand.color.body}
          >
            <Swatches />
          </AboutSection>

          <AboutSection
            index={brand.type.index}
            label={brand.type.label}
            title={brand.type.title}
            body={brand.type.body}
          >
            <Specimens />
          </AboutSection>

          <AboutSection
            index={brand.voice.index}
            label={brand.voice.label}
            title={brand.voice.title}
          >
            <VoicePairs />
          </AboutSection>
        </div>
      </Container>

      <AboutFooterLinks
        links={[
          {
            label: "How we work",
            href: "/about",
            description: "The stance, the loop, and what we mean by a project.",
          },
          {
            label: "Get in touch",
            href: "/about/contact",
            description: "Questions about using the mark are welcome.",
          },
        ]}
      />
    </>
  )
}

/** The mark in the three places it actually appears. */
function MarkSpecimens() {
  return (
    <motion.ul {...reveal} className="mt-8 grid gap-4 sm:grid-cols-3">
      {[
        {
          caption: "Bare mark",
          node: <LogoGlyph className="size-12" />,
        },
        {
          caption: "Badge",
          node: <LogoGlyph variant="badge" className="size-12" />,
        },
        {
          caption: "Lockup",
          node: <LogoMark />,
        },
      ].map((item) => (
        <motion.li
          key={item.caption}
          variants={fadeUp}
          className="border-faded flex flex-col items-center gap-5 rounded-2xl border bg-muted px-6 py-10"
        >
          <div className="flex h-12 items-center">{item.node}</div>
          <span className="text-faded text-detail-xs font-medium uppercase">
            {item.caption}
          </span>
        </motion.li>
      ))}
    </motion.ul>
  )
}

/**
 * Palette chips.
 *
 * Each chip fills from `var(--token)` rather than the hex string beside it, so
 * the colour shown is the colour the site is actually using. The hex is a
 * caption for someone copying a value out, not the source of truth.
 */
function Swatches() {
  return (
    <div className="mt-8 flex flex-col gap-8">
      {brand.color.groups.map((group) => (
        <div key={group.heading}>
          <h3 className="text-faded text-detail-xs font-medium uppercase">
            {group.heading}
          </h3>

          <motion.ul
            {...reveal}
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {group.swatches.map((swatch) => (
              <motion.li
                key={swatch.token}
                variants={fadeUp}
                className="group border-faded overflow-hidden rounded-xl border"
              >
                <div
                  className="h-20 w-full origin-bottom transition-transform duration-500 ease-out group-hover:scale-y-110 motion-reduce:group-hover:scale-y-100"
                  style={{ backgroundColor: `var(${swatch.token})` }}
                />
                <div className="p-4">
                  <p className="text-paragraph-s font-medium">{swatch.name}</p>
                  <p className="text-faded mt-1 font-mono text-detail-xs">
                    {swatch.value}
                  </p>
                  <p className="mt-2 text-detail-xs text-muted-foreground">
                    {swatch.use}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      ))}
    </div>
  )
}

/** Type specimens, each set in the utility it names. */
function Specimens() {
  return (
    <motion.ul
      {...reveal}
      className="border-faded bg-faded mt-8 flex flex-col gap-px overflow-hidden rounded-2xl border"
    >
      {brand.type.specimens.map((specimen) => (
        <motion.li
          key={specimen.token}
          variants={fadeUp}
          className="bg-background p-6 md:p-7"
        >
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-faded text-detail-xs font-medium uppercase">
              {specimen.name}
            </span>
            <code className="text-faded font-mono text-detail-xs">
              {specimen.token}
            </code>
          </div>
          <p className={`mt-3 text-pretty ${specimen.token}`}>
            {specimen.sample}
          </p>
        </motion.li>
      ))}

      <motion.li variants={fadeUp} className="bg-background p-6 md:p-7">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-faded text-detail-xs font-medium uppercase">
            The accent word
          </span>
          <code className="text-faded font-mono text-detail-xs">
            font-serif italic
          </code>
        </div>
        <p className="mt-3 text-display-m font-semibold text-balance">
          We point ourselves at{" "}
          <span className="font-serif font-normal italic">tech</span>, and see
          what happens.
        </p>
      </motion.li>
    </motion.ul>
  )
}

/** Voice, shown as a swap rather than described in the abstract. */
function VoicePairs() {
  return (
    <motion.ul {...reveal} className="mt-8 flex flex-col gap-3">
      {brand.voice.pairs.map((pair) => (
        <motion.li
          key={pair.write}
          variants={fadeUp}
          className="border-faded bg-faded grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2"
        >
          <div className="bg-background p-5">
            <span className="text-faded flex items-center gap-2 text-detail-xs font-medium uppercase">
              <X className="size-3.5" />
              Not this
            </span>
            <p className="mt-2.5 text-paragraph-s text-pretty text-muted-foreground line-through decoration-muted-foreground/40">
              {pair.instead}
            </p>
          </div>
          <div className="bg-background p-5">
            <span className="flex items-center gap-2 text-detail-xs font-medium text-olive uppercase">
              <Check className="size-3.5" />
              This
            </span>
            <p className="mt-2.5 text-paragraph-s text-pretty">{pair.write}</p>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  )
}
