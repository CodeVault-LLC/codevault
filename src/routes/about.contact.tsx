import { createFileRoute } from "@tanstack/react-router"

import { Contact } from "@/components/about/contact"

export const Route = createFileRoute("/about/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Get in touch — CodeVault" },
      {
        name: "description",
        content:
          "Two ways to reach CodeVault — email and GitHub — both read by a person. No form, no ticket queue.",
      },
    ],
  }),
})
