import { createFileRoute } from "@tanstack/react-router"

import { ProjectsIndex } from "@/components/projects/projects-index"
import { projectsPage } from "@/core/config/site"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/projects/")({
  component: ProjectsIndex,
  head: () =>
    seo({
      title: "Projects — CodeVault",
      description: projectsPage.metaDescription,
      path: "/projects",
    }),
})
