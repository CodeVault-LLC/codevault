import { createFileRoute } from "@tanstack/react-router"

import { WhoWeAre } from "@/components/about/who-we-are"

export const Route = createFileRoute("/about/who-we-are")({
  component: WhoWeAre,
  head: () => ({
    meta: [
      { title: "Who we are — CodeVault" },
      {
        name: "description",
        content:
          "How we think about work: the problems we're drawn to, how a project starts, and the things we're honestly not very good at.",
      },
    ],
  }),
})
