import { createFileRoute } from "@tanstack/react-router"

import { OrbitPage } from "@/components/projects/orbit-page"

export const Route = createFileRoute("/projects/orbit")({
  component: OrbitPage,
  head: () => ({
    meta: [
      { title: "Orbit — CodeVault" },
      {
        name: "description",
        content:
          "Orbit — a browser game about keeping a sky full of satellites from colliding, built over one weekend. A CodeVault mission dossier.",
      },
    ],
  }),
})
