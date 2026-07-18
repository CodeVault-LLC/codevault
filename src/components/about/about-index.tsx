import { motion } from "framer-motion"

import { AboutFooterLinks } from "@/components/about/about-footer-links"
import { AboutHero } from "@/components/about/about-hero"
import { AboutSection } from "@/components/about/about-section"
import { Container } from "@/components/layout/container"
import { Plate } from "@/components/about/plate"
import { aboutIndex, projectLoop } from "@/core/config/about"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

const [stance, loop, range, open] = aboutIndex.sections

export function AboutIndex() {
  return (
    <>
      <AboutHero
        eyebrow={aboutIndex.eyebrow}
        heading={aboutIndex.heading}
        lede={aboutIndex.lede}
      />

      {/* Unsplash photo-1446776877081-d282a0f896e2 — Unsplash License,
          attribution not required. Chosen for the rhyme: windows in radial
          symmetry looking out at something, which is the logo. */}
      <Plate
        bleed
        src="/stock/aperture-earth-from-orbit-window.avif"
        alt="The cupola of a spacecraft, its windows arranged in a ring around a central pane, looking down at the Earth below."
        aspect="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
      />

      <Container className="py-20 md:py-28">
        <div className="flex flex-col gap-14 md:gap-20">
          <AboutSection {...stance} />

          <AboutSection {...loop}>
            <motion.ol
              variants={staggerContainer(0.08, 0.1)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="border-faded bg-faded mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-2"
            >
              {projectLoop.map((step, i) => (
                <motion.li
                  key={step.title}
                  variants={fadeUp}
                  className="bg-background p-6"
                >
                  <span className="text-faded font-mono text-detail-xs tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-display-xs font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                    {step.body}
                  </p>
                </motion.li>
              ))}
            </motion.ol>
          </AboutSection>

          <AboutSection {...range} />
        </div>
      </Container>

      {/* Unsplash photo-1470071459604-3b5ec3a7fe05 — Unsplash License,
          attribution not required. */}
      <Plate
        src="/stock/valley-road-morning-light.avif"
        alt="A single road winding through green hills at sunrise, with low cloud sitting in the valley."
        aspect="aspect-[16/10] md:aspect-[21/9]"
      />

      <Container className="py-20 md:py-28">
        <AboutSection {...open} />
      </Container>

      <AboutFooterLinks
        links={[
          {
            label: "Who we are",
            href: "/about/who-we-are",
            description: "How we think about the work.",
          },
          {
            label: "Projects",
            href: "/projects",
            description: "What we're building and breaking.",
          },
        ]}
      />
    </>
  )
}
