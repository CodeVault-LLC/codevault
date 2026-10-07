import { ArrowUpRight, ArrowRight } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { TextReveal } from "@/components/editorial/text-reveal"
import { Container } from "@/components/layout/container"
import { homePage } from "@/core/config/site"
import { projectLoop } from "@/core/config/about"

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="section-space scroll-mt-24 bg-secondary"
    >
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <h2
              id="about-title"
              className="text-display-xl font-normal text-balance"
            >
              <TextReveal text={homePage.process.title} />
            </h2>
            <p className="mt-4 max-w-md text-paragraph-m text-pretty text-muted-foreground">
              {homePage.process.introduction}
            </p>
          </div>
          <Link to="/about" className="editorial-link">
            {homePage.process.action}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-10">
          {projectLoop.map((step, index) => (
            <li key={step.title} className="border-t border-foreground/20 pt-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-display-s font-normal">{step.title}</h3>
                <ArrowRight
                  aria-hidden="true"
                  className={
                    index === projectLoop.length - 1
                      ? "size-4 rotate-[-45deg] text-muted-foreground"
                      : "size-4 text-muted-foreground"
                  }
                />
              </div>
              <p className="mt-4 max-w-xs text-paragraph-s text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
