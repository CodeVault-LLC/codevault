import { createFileRoute } from "@tanstack/react-router"

import { Brand } from "@/components/about/brand"

export const Route = createFileRoute("/about/brand")({
  component: Brand,
  head: () => ({
    meta: [
      { title: "Brand — CodeVault" },
      {
        name: "description",
        content:
          "The CodeVault aperture, Scout, the palette, the type scale, and the voice — rendered from the same tokens the rest of the site uses.",
      },
    ],
  }),
})
