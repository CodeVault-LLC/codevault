import { createFileRoute } from "@tanstack/react-router"

import { GitStoryPage } from "@/components/projects/git-story-page"

export const Route = createFileRoute("/projects/git-story")({
  component: GitStoryPage,
  head: () => ({
    meta: [
      { title: "git-story — CodeVault" },
      {
        name: "description",
        content:
          "git-story — a CLI that reads your git log and tells it back as a readable narrative instead of a wall of hashes. Open source, MIT.",
      },
    ],
  }),
})
