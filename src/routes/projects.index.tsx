import { createFileRoute } from "@tanstack/react-router"

import { ProjectsIndex } from "@/components/projects/projects-index"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/projects/")({
  component: ProjectsIndex,
  head: () =>
    seo({
      title: "Projects — CodeVault",
      description:
        "A running list of CodeVault projects — some shipped, some paused, some still moving. Each one is a trial we lived with and reacted to.",
      path: "/projects",
    }),
})
