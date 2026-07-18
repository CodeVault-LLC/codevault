import { AboutFooterLinks } from "@/components/about/about-footer-links"
import { AboutHero } from "@/components/about/about-hero"
import { AboutSection } from "@/components/about/about-section"
import { Container } from "@/components/layout/container"
import { Plate } from "@/components/about/plate"
import { whoWeAre } from "@/core/config/about"

const [drawnTo, howWeStart, honestly, constant] = whoWeAre.sections

export function WhoWeAre() {
  return (
    <>
      <AboutHero
        eyebrow={whoWeAre.eyebrow}
        heading={whoWeAre.heading}
        lede={whoWeAre.lede}
      />

      {/* Unsplash photo-1519389950473-47ba0277781c — Unsplash License,
          attribution not required. Overhead and hands-only on purpose: this
          page is about how the work happens, not who is in the room. */}
      <Plate
        bleed
        src="/stock/hands-desk-laptops-overhead.avif"
        alt="A wooden table seen from above, covered with laptops, notebooks, cables and cups, with several pairs of hands working."
        aspect="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
      />

      <Container className="py-20 md:py-28">
        <div className="flex flex-col gap-14 md:gap-20">
          <AboutSection {...drawnTo} />
          <AboutSection {...howWeStart} />
        </div>
      </Container>

      {/* Unsplash photo-1518770660439-4636190af475 — Unsplash License,
          attribution not required. */}
      <Plate
        src="/stock/circuit-board-macro.avif"
        alt="A close, shallow-focus photograph of a circuit board, its components receding out of focus."
        aspect="aspect-[16/10] md:aspect-[21/9]"
        caption="Hardware wasn't our field, so we made it one for a month."
      />

      <Container className="py-20 md:py-28">
        <div className="flex flex-col gap-14 md:gap-20">
          <AboutSection {...honestly} />
          <AboutSection {...constant} />
        </div>
      </Container>

      <AboutFooterLinks
        links={[
          {
            label: "How we work",
            href: "/about",
            description: "The stance, and the loop every project runs.",
          },
          {
            label: "Get in touch",
            href: "/about/contact",
            description: "Two ways to reach us.",
          },
        ]}
      />
    </>
  )
}
