import { useState } from "react"
import { Search } from "lucide-react"
import { TextReveal } from "@/components/editorial/text-reveal"
import { Container } from "@/components/layout/container"
import { ProjectShell } from "@/components/projects/project-shell"
import { ProjectCard } from "@/components/projects/project-card"
import { getProject, projects } from "@/core/config/projects"
import { projectsPage } from "@/core/config/site"

const fields = Array.from(new Set(projects.map((project) => project.field)))
const statuses = Array.from(new Set(projects.map((project) => project.status)))

export function ProjectsIndex() {
  const [query, setQuery] = useState("")
  const [field, setField] = useState("")
  const [status, setStatus] = useState("")
  const filtered = projects.filter(
    (project) =>
      (!field || project.field === field) &&
      (!status || project.status === status) &&
      `${project.name} ${project.summary} ${project.field}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
  )
  const reset = () => {
    setQuery("")
    setField("")
    setStatus("")
  }

  return (
    <ProjectShell>
      <section aria-labelledby="projects-title">
        <Container className="pt-14 pb-14 md:pt-24 md:pb-20">
          <div className="grid items-start gap-8 md:grid-cols-[1.3fr_1fr] md:gap-20">
            <h1 id="projects-title" className="text-display-xxl font-medium">
              <TextReveal text={projectsPage.title} />
            </h1>
            <p className="max-w-md pb-2 text-paragraph-l text-pretty text-muted-foreground">
              {projectsPage.introduction}
            </p>
          </div>
        </Container>
      </section>
      <Container>
        <ProjectCard
          project={getProject(projectsPage.featuredSlug)!}
          featured
        />
      </Container>
      <section aria-labelledby="project-index-title" className="section-space">
        <Container>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="project-index-title" className="text-display-l font-normal">
              {projectsPage.collection}
            </h2>
            <p
              role="status"
              aria-live="polite"
              className="font-mono text-detail-xs text-muted-foreground"
            >
              {filtered.length} / {projects.length} {projectsPage.countLabel}
            </p>
          </div>
          <div className="mt-8 grid gap-4 border-y border-border py-5 md:grid-cols-[1.5fr_1fr_1fr]">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={projectsPage.searchLabel}
                placeholder={projectsPage.searchPlaceholder}
                className="focus-ring min-h-11 w-full bg-secondary py-2 pr-3 pl-10 text-paragraph-s placeholder:text-muted-foreground"
              />
            </div>
            <select
              value={field}
              onChange={(event) => setField(event.target.value)}
              aria-label={projectsPage.fieldLabel}
              className="focus-ring min-h-11 min-w-0 bg-background px-3 text-paragraph-s"
            >
              <option value="">{projectsPage.allFields}</option>
              {fields.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label={projectsPage.statusLabel}
              className="focus-ring min-h-11 min-w-0 bg-background px-3 text-paragraph-s"
            >
              <option value="">{projectsPage.allStatuses}</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          {filtered.length ? (
            <ul className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:gap-x-12 lg:gap-y-20">
              {filtered.map((project) => (
                <li key={project.slug}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-20">
              <p className="text-paragraph-m text-muted-foreground">
                {projectsPage.empty}
              </p>
              <button
                type="button"
                onClick={reset}
                className="editorial-link mt-5"
              >
                {projectsPage.reset}
              </button>
            </div>
          )}
        </Container>
      </section>
    </ProjectShell>
  )
}
