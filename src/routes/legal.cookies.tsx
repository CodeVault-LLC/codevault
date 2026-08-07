import { createFileRoute } from "@tanstack/react-router"

import { Cookies } from "@/components/legal/cookies"
import { legalPages } from "@/core/config/legal"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/legal/cookies")({
  component: Cookies,
  head: () =>
    seo({
      title: "Cookies — CodeVault",
      description: legalPages.cookies.description,
      path: "/legal/cookies",
    }),
})
