import { createFileRoute } from "@tanstack/react-router"

import { PlantPiLogPage } from "@/components/projects/plant-pi-log-page"

export const Route = createFileRoute("/projects/plant-pi_/log")({
  component: PlantPiLogPage,
  head: () => ({
    meta: [
      { title: "The plant-watering Pi · Full log — CodeVault" },
      {
        name: "description",
        content:
          "The full, unedited project log for the CodeVault plant-watering Pi — every entry, in order.",
      },
    ],
  }),
})
