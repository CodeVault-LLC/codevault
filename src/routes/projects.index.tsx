import { createFileRoute } from "@tanstack/react-router"

import { ProjectsIndex } from "@/components/projects/projects-index"

export const Route = createFileRoute("/projects/")({
  component: ProjectsIndex,
  head: () => ({
    meta: [
      { title: "Projects — CodeVault" },
      {
        name: "description",
        content:
          "A running list of CodeVault projects — some shipped, some paused, some still moving. Each one is a trial we lived with and reacted to.",
      },
    ],
  }),
})
