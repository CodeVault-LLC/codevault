import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { TextReveal } from "@/components/editorial/text-reveal"
import { Container } from "@/components/layout/container"
import { ProjectCard } from "@/components/projects/project-card"
import { homePage } from "@/core/config/site"
import { getProject } from "@/core/config/projects"

export function LatestReleases() {
  const selected = homePage.recent.selected.map((slug) => getProject(slug)!)
  return (
    <section
      id="releases"
      aria-labelledby="releases-title"
      className="home-projects section-space scroll-mt-24 border-t border-border"
    >
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            id="releases-title"
            className="max-w-2xl text-display-xl font-normal text-balance"
          >
            <TextReveal text={homePage.recent.title} />
          </h2>
          <Link to="/projects" className="editorial-link">
            {homePage.recent.action}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-12 md:grid-cols-3 md:gap-6 lg:mt-12 lg:gap-8">
          {selected.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Container>
    </section>
  )
}
