import { createFileRoute } from "@tanstack/react-router"

import { PlantPiLogPage } from "@/components/projects/plant-pi-log-page"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/projects/plant-pi_/log")({
  component: PlantPiLogPage,
  head: () =>
    seo({
      title: "The plant-watering Pi · Full log — CodeVault",
      description:
        "The full, unedited project log for the CodeVault plant-watering Pi — every entry, in order.",
      path: "/projects/plant-pi/log",
      type: "article",
    }),
})
