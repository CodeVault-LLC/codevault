// Copy for the Contact and Privacy pages. The business facts themselves live
// in `company.ts`.
//
// The privacy notice must stay true of how the site actually runs: no cookies,
// no analytics, no forms, hosted on Vercel with no logging of our own. Adding
// any of those, or another service provider, means updating this first, and
// bumping `updated`.

import { company } from "./company"

export const contact = {
  title: "Contact — CodeVault",
  description: `How to reach ${company.name}.`,
  heading: "Contact",
  labels: {
    email: "Email",
    security: "Security",
    business: "Business",
    orgNumber: "Organisation number",
    address: "Address",
  },
}

export type PrivacySection = {
  id: string
  heading: string
  body: (string | string[])[]
}

export const privacy = {
  title: "Privacy — CodeVault",
  description:
    "What personal data this site processes, why, and what you can ask us to do about it.",
  heading: "Privacy",
  updated: "2026-10-13",
  updatedLabel: "Last updated",
  lead: "This site sets no cookies of its own, runs no analytics and has no forms. The personal data it touches is what every website has to handle, and any email you choose to send us.",
  sections: [
    {
      id: "who",
      heading: "Who is responsible",
      body: [
        `${company.name} is an ${company.form.toLowerCase()} run by ${company.owner}, who is the controller for the personal data described here. Write to ${company.email} about anything on this page.`,
      ],
    },
    {
      id: "what",
      heading: "What we process, and why",
      body: [
        [
          "When you visit, your browser sends your IP address, the page you asked for and a description of your browser. Vercel, which hosts the site, uses these to deliver the page and keep it secure, and keeps short-lived request logs. We add no logging of our own.",
          "When you email us, we get your address, your name if you give it, and what you write. We use it to answer you and for nothing else.",
        ],
        "The legal basis for both is our legitimate interest in running a secure site and replying to messages (GDPR article 6(1)(f)).",
      ],
    },
    {
      id: "who-else",
      heading: "Who else sees it",
      body: [
        "Vercel Inc. hosts the site and processes visit data on our behalf under its data processing addendum. It is a US company, so data may be transferred to the United States under the EU–US Data Privacy Framework, under which Vercel is certified, and the EU standard contractual clauses. Email passes through our email provider in the same role.",
        "We don't sell personal data or share it with anyone else unless the law requires it.",
      ],
    },
    {
      id: "cookies",
      heading: "Cookies",
      body: ["We set none, and neither does our host."],
    },
    {
      id: "how-long",
      heading: "How long we keep it",
      body: [
        "Vercel keeps request logs only as long as it needs to run and protect the service. We delete email correspondence within 12 months of the last message, unless we have to keep it longer by law, for example for accounting.",
      ],
    },
    {
      id: "rights",
      heading: "Your rights",
      body: [
        `You can ask to see the data we hold about you, have it corrected or deleted, restrict how we use it, or object to our using it. Write to ${company.email} and we'll answer within a month.`,
        "If you think we've handled your data wrongly, you can complain to Datatilsynet, the Norwegian Data Protection Authority, at https://www.datatilsynet.no.",
      ],
    },
  ] satisfies PrivacySection[],
} as const

export const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Contact", href: "/contact" },
] as const
