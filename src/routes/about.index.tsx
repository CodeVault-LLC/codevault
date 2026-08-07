import { createFileRoute } from "@tanstack/react-router"

import { AboutIndex } from "@/components/about/about-index"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/about/")({
  component: AboutIndex,
  head: () =>
    seo({
      title: "About — CodeVault",
      description:
        "CodeVault isn't a product company. We run projects — a trial, an experience, an adjustment, a result — and share the trial as well as the result.",
      path: "/about",
    }),
})
