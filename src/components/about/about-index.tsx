import { AboutFooterLinks } from "@/components/about/about-footer-links"
import { AboutHero } from "@/components/about/about-hero"
import { AboutSection } from "@/components/about/about-section"
import { Container } from "@/components/layout/container"
import { aboutIndex, projectLoop } from "@/core/config/about"
import { homePage, site } from "@/core/config/site"

const [stance, , range, open] = aboutIndex.sections

export function AboutIndex() {
  return (
    <>
      <AboutHero
        eyebrow={aboutIndex.eyebrow}
        heading={aboutIndex.heading}
        lede={aboutIndex.lede}
      />
      <Container className="pb-20 md:pb-28">
        <div className="grid overflow-hidden bg-secondary lg:grid-cols-2">
          <img
            src={site.presentation.aboutImage.src}
            srcSet={site.presentation.aboutImage.srcSet}
            alt={site.presentation.aboutImage.alt}
            sizes="(min-width: 1024px) 50vw, 100vw"
            width={2000}
            height={1333}
            fetchPriority="high"
            className="h-full min-h-72 w-full object-cover"
          />
          <div className="flex flex-col justify-center p-8 md:p-14">
            <h2 className="text-display-l font-normal text-balance">
              {stance.title}
            </h2>
            {stance.body?.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-5 text-paragraph-m text-pretty text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Container>
      <section
        aria-labelledby="loop-title"
        className="border-y border-border bg-secondary py-16 md:py-24"
      >
        <Container>
          <h2
            id="loop-title"
            className="max-w-2xl text-display-xl font-normal text-balance"
          >
            {homePage.process.title}
          </h2>
          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {projectLoop.map((step) => (
              <li
                key={step.title}
                className="border-t border-foreground/25 pt-5"
              >
                <h3 className="text-display-m font-normal">{step.title}</h3>
                <p className="mt-4 max-w-xs text-paragraph-m text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <Container className="space-y-16 py-20 md:space-y-24 md:py-28">
        <AboutSection {...range} />
        <AboutSection {...open} />
      </Container>
      <AboutFooterLinks links={site.presentation.aboutNext} />
    </>
  )
}
