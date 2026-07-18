import { createFileRoute } from "@tanstack/react-router"

import { PlantPiPage } from "@/components/projects/plant-pi-page"

export const Route = createFileRoute("/projects/plant-pi")({
  component: PlantPiPage,
  head: () => ({
    meta: [
      { title: "The plant-watering Pi — CodeVault" },
      {
        name: "description",
        content:
          "A month spent teaching a Raspberry Pi to keep our office plants alive. A CodeVault field journal — honest about what broke.",
      },
    ],
  }),
})
