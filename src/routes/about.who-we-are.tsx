import { createFileRoute } from "@tanstack/react-router"

import { WhoWeAre } from "@/components/about/who-we-are"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/about/who-we-are")({
  component: WhoWeAre,
  head: () =>
    seo({
      title: "Who we are — CodeVault",
      description:
        "How we think about work: the problems we're drawn to, how a project starts, and the things we're honestly not very good at.",
      path: "/about/who-we-are",
    }),
})
