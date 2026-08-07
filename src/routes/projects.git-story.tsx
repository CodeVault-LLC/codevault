import { createFileRoute } from "@tanstack/react-router"

import { GitStoryPage } from "@/components/projects/git-story-page"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/projects/git-story")({
  component: GitStoryPage,
  head: () =>
    seo({
      title: "git-story — CodeVault",
      description:
        "git-story — a CLI that reads your git log and tells it back as a readable narrative instead of a wall of hashes. Open source, MIT.",
      path: "/projects/git-story",
    }),
})
