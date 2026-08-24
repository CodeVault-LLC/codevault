import { Link } from "@tanstack/react-router"

import { Container } from "@/components/layout/container"
import { ProjectShell } from "@/components/projects/project-shell"
import { ProjectVisual } from "@/components/projects/project-visuals"
import { projectPath, projects } from "@/core/config/projects"
import { projectsPage } from "@/core/config/site"
import { cn } from "@/lib/utils"

/*
THESIS: Projects are bodies of work, not equal items in a product grid.
OWN-WORLD: Ivory editorial ground, slate ink, olive notation, square visual
fields, and project-specific diagrams with no card chrome.
STORY: The reader sees what each project is and one visual expression of the
work before choosing what to open.
FIRST VIEWPORT: A compact split introduction followed by Orbit and the opening
of Plant Pi, each pairing text with a substantial visual field.
FORM: Project chapters, the delegated choice from seed ce4e42ae.
FINISH: The page is checked at desktop and mobile widths; its diagrams are
code-native, so there are no shipping raster assets to track.
*/
export function ProjectsIndex() {
  return (
    <ProjectShell>
      <section
        aria-labelledby="projects-title"
        className="border-faded border-b"
        data-impeccable-seed="ce4e42ae"
      >
        <Container className="grid min-w-0 gap-10 py-20 md:grid-cols-2 md:items-end md:py-28">
          <h1
            id="projects-title"
            className="text-display-xxl font-medium text-balance"
          >
            {projectsPage.title}
          </h1>
          <p className="max-w-md text-paragraph-l text-pretty text-foreground/75 md:justify-self-end">
            {projectsPage.introduction}
          </p>
        </Container>
      </section>

      <ul className="border-faded min-w-0 overflow-hidden border-b">
        {projects.map((project, index) => {
          const visualFirst = index % 2 === 1

          return (
            <li
              key={project.slug}
              className="border-faded min-w-0 overflow-hidden border-t first:border-t-0"
            >
              <Container className="min-w-0 px-0 sm:px-6">
                <article
                  aria-labelledby={`project-${project.slug}`}
                  className={cn(
                    "grid min-h-[32rem] min-w-0",
                    visualFirst
                      ? "lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.72fr)]"
                      : "lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.55fr)]"
                  )}
                >
                  <div
                    className={cn(
                      "flex min-w-0 flex-col justify-center px-6 py-14 sm:px-0 sm:py-20 lg:px-10 lg:py-24",
                      visualFirst && "lg:order-2"
                    )}
                  >
                    <h2
                      id={`project-${project.slug}`}
                      className="text-display-l font-medium text-balance"
                    >
                      <Link
                        to={projectPath(project.slug)}
                        className="transition-colors outline-none hover:text-olive focus-visible:text-olive focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        {project.name}
                      </Link>
                    </h2>
                    <p className="mt-6 max-w-sm text-paragraph-m text-pretty text-foreground/70">
                      {project.summary}
                    </p>
                  </div>

                  <Link
                    to={projectPath(project.slug)}
                    aria-label={project.name}
                    className={cn(
                      "group/visual border-faded min-h-80 min-w-0 overflow-hidden border-t outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset sm:min-h-96 lg:min-h-full lg:border-t-0 lg:border-l",
                      visualFirst && "lg:order-1 lg:border-r lg:border-l-0"
                    )}
                  >
                    <ProjectVisual project={project} />
                  </Link>
                </article>
              </Container>
            </li>
          )
        })}
      </ul>
    </ProjectShell>
  )
}
