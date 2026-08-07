import { createFileRoute } from "@tanstack/react-router"

import { Brand } from "@/components/about/brand"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/about/brand")({
  component: Brand,
  head: () =>
    seo({
      title: "Brand — CodeVault",
      description:
        "The CodeVault aperture, Scout, the palette, the type scale, and the voice — rendered from the same tokens the rest of the site uses.",
      path: "/about/brand",
    }),
})
