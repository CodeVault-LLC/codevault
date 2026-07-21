import { createFileRoute } from "@tanstack/react-router"

import { SeamarkPage } from "@/components/projects/seamark-page"

export const Route = createFileRoute("/projects/seamark")({
  component: SeamarkPage,
  head: () => ({
    meta: [
      { title: "Seamark — CodeVault" },
      {
        name: "description",
        content:
          "Seamark — reading public AIS traffic across the North Sea and Skagerrak to find the few tracks that stop making sense near a shipping lane or a seabed cable, and putting them in front of a person.",
      },
    ],
  }),
})
