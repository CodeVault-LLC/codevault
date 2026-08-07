import { createFileRoute } from "@tanstack/react-router"

import { Contact } from "@/components/about/contact"
import { seo } from "@/core/lib/seo"

export const Route = createFileRoute("/about/contact")({
  component: Contact,
  head: () =>
    seo({
      title: "Get in touch — CodeVault",
      description:
        "Two ways to reach CodeVault — email and GitHub — both read by a person. No form, no ticket queue.",
      path: "/about/contact",
    }),
})
