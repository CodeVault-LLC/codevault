import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import type { Project } from "@/core/config/projects"
import { projectPath } from "@/core/config/projects"
import { projectsPage } from "@/core/config/site"
import { ProjectVisual } from "@/components/projects/project-visuals"
import { cn } from "@/lib/utils"

export function ProjectCard({
  project,
  featured = false,
}: {
  project: Project
  featured?: boolean
}) {
  return (
    <article
      className={cn(
        "group",
        featured && "grid items-stretch lg:grid-cols-[1.5fr_1fr]"
      )}
    >
      <Link
        to={projectPath(project.slug)}
        aria-label={`${projectsPage.read}: ${project.name}`}
        className={cn(
          "group/visual focus-ring block min-w-0 overflow-hidden",
          featured ? "min-h-64 md:min-h-[24rem]" : "h-56 md:h-72"
        )}
      >
        <ProjectVisual project={project} />
      </Link>
      <div
        className={cn(
          "flex flex-col",
          featured ? "justify-center bg-secondary p-7 md:p-12 lg:p-14" : "pt-6"
        )}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-muted-foreground">
          <span>{project.field}</span>
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                project.status === "Paused" ? "bg-muted-foreground" : "bg-olive"
              )}
            />
            {project.status}
          </span>
        </div>
        <h3
          className={cn(
            "mt-5 font-normal text-balance",
            featured ? "text-display-l" : "text-display-s"
          )}
        >
          <Link
            to={projectPath(project.slug)}
            className="focus-ring underline-offset-8 hover:underline"
          >
            {project.name}
          </Link>
        </h3>
        <p className="mt-4 max-w-lg text-paragraph-m text-pretty text-muted-foreground">
          {project.summary}
        </p>
        <Link
          to={projectPath(project.slug)}
          className="editorial-link mt-8 w-fit"
        >
          {projectsPage.read}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  )
}
