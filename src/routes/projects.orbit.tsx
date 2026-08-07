import { createFileRoute } from "@tanstack/react-router"

import { OrbitPage } from "@/components/projects/orbit-page"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/projects/orbit")({
  component: OrbitPage,
  head: () =>
    seo({
      title: "Orbit — CodeVault",
      description:
        "Orbit — a browser game about keeping a sky full of satellites from colliding, built over one weekend. A CodeVault mission dossier.",
      path: "/projects/orbit",
    }),
})
