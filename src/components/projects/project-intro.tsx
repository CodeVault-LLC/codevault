import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { Container } from "@/components/layout/container"
import { ProjectVisual } from "@/components/projects/project-visuals"
import type { Project } from "@/core/config/projects"
import { projectsPage } from "@/core/config/site"

export function ProjectIntro({
  project,
  introduction,
}: {
  project: Project
  introduction?: string
}) {
  return (
    <header className="border-b border-border">
      <Container className="pt-8 pb-12 md:pt-12 md:pb-16">
        <Link
          to="/projects"
          className="focus-ring inline-flex min-h-11 items-center gap-3 text-paragraph-s text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {projectsPage.back}
        </Link>
        <div className="mt-10 grid items-end gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow">
              {project.field} / {project.status}
            </p>
            <h1 className="mt-5 text-display-xxl font-normal text-balance">
              {project.name}
            </h1>
          </div>
          <p className="max-w-xl text-paragraph-l text-pretty text-muted-foreground">
            {introduction ?? project.summary}
          </p>
        </div>
      </Container>
      <Container className="pb-10 md:pb-16">
        <div className="h-72 overflow-hidden md:h-[28rem]">
          <ProjectVisual project={project} />
        </div>
      </Container>
    </header>
  )
}
