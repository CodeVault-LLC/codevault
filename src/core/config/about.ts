// The About page: who CodeVault is, in the plainest terms. It's the page
// search engines and AI assistants use to answer "what is CodeVault?", and the
// name is shared with unrelated companies elsewhere, so it says where we are
// and what we make, up front. Business facts come from `company.ts`.

import { company } from "./company"
import { electrical } from "./electrical"

export const about = {
  title: "About CodeVault — Software company in Norway",
  description: `${company.name} is a Norwegian software company. We build software for problems large organisations have learned to live with. Our first product is ${electrical.name}, a Revit add-in that routes conduit.`,
  heading: "About CodeVault",
  lead: `${company.name} is a software company in Norway. We build software for problems large organisations have learned to live with, and we write down how the work is going.`,

  product: {
    heading: "What we make",
    body: `${electrical.name}, a Revit add-in for electricians and electrical designers. It routes conduit: pick two devices, or several, and it suggests a route that keeps clear of what's in the way. It's in development, with early access open.`,
    link: `More about ${electrical.name}`,
  },

  approach: {
    heading: "How we work",
    items: [
      {
        title: "Honest about where things stand",
        body: "We say what our software does for the people using it, and what state it's in. Working means it runs today.",
      },
      {
        title: "Written down",
        body: "What we build, what we decide and what we learn goes in the news, dated, so you can see how the work is going.",
      },
    ],
  },

  factsHeading: "Company",
} as const

/** The facts the About page lists, skipping what isn't known yet. */
export function aboutFacts(): {
  label: string
  value: string
  href?: string
}[] {
  return [
    { label: "Name", value: company.legalName ?? company.name },
    { label: "Company form", value: company.form },
    { label: "Country", value: "Norway" },
    ...(company.orgNumber
      ? [{ label: "Organisation number", value: company.orgNumber }]
      : []),
    { label: "Email", value: company.email, href: `mailto:${company.email}` },
  ]
}
