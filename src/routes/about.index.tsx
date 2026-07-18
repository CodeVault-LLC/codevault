import { createFileRoute } from "@tanstack/react-router"

import { AboutIndex } from "@/components/about/about-index"

export const Route = createFileRoute("/about/")({
  component: AboutIndex,
  head: () => ({
    meta: [
      { title: "About — CodeVault" },
      {
        name: "description",
        content:
          "CodeVault isn't a product company. We run projects — a trial, an experience, an adjustment, a result — and share the trial as well as the result.",
      },
    ],
  }),
})
