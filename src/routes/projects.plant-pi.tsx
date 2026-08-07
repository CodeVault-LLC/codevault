import { createFileRoute } from "@tanstack/react-router"

import { PlantPiPage } from "@/components/projects/plant-pi-page"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/projects/plant-pi")({
  component: PlantPiPage,
  head: () =>
    seo({
      title: "The plant-watering Pi — CodeVault",
      description:
        "A month spent teaching a Raspberry Pi to keep our office plants alive. A CodeVault field journal — honest about what broke.",
      path: "/projects/plant-pi",
    }),
})
