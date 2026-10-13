// Site-wide copy. Page components own structure; the words live here and in
// `news.ts` / `electrical.ts`.

import { company } from "./company"
import { electrical } from "./electrical"

// TEMPORARY: security@codevault.no can't receive mail yet (no mail server on
// the domain), so security reports go to the company address. See TODO.md.
const securityEmail = company.email

export const site = {
  name: "CodeVault",
  // The address the site is served from. The bare domain redirects here, so
  // canonicals, the sitemap and structured data all point at this one.
  url: "https://www.codevault.no",
  title: "CodeVault — Software for problems organisations live with",
  description:
    "CodeVault builds software for problems large organisations have learned to live with. Right now that means CodeVault Electrical, conduit routing for Revit.",
  ogImage: "/og/site.png",
  github: "https://github.com/CodeVault-LLC",
  securityEmail,

  nav: [
    { label: electrical.short, href: electrical.path },
    { label: "News", href: "/news" },
  ],
  cta: { label: "Early access", href: electrical.path },

  home: {
    headline: "Software for the problems large organisations live with.",
    intro:
      "Right now that means CodeVault Electrical, a Revit add-in that routes conduit for electricians.",
    // What a visitor can actually get, said plainly, next to a photograph.
    product: {
      body: "A Revit add-in that routes conduit. Pick the devices, and it suggests a run that keeps clear of what's set to Avoid, checked against the model's real geometry. Nothing is added until you accept it.",
      more: "How it works",
    },
    approach: {
      heading: "What we look for",
      statement:
        "Every large organisation has a problem it stopped calling a problem. Someone keeps a spreadsheet for it, or loses an afternoon to it every week. We go looking for those, and write the software that ends them.",
      items: [
        {
          title: "There's a workaround",
          body: "A spreadsheet, a macro, or one person who knows how. The problem is real, and nobody has fixed it.",
        },
        {
          title: "It's done by hand, often",
          body: "Too small to escalate, too frequent to ignore.",
        },
        {
          title: "It fits what people already use",
          body: "Trying it should take an afternoon.",
        },
      ],
    },
    latestHeading: "News",
    allNews: "All news",
    moreHeading: "More from CodeVault",
    statement: "What we're building, what we've decided, and why.",
  },

  footer: {
    columns: [
      {
        heading: electrical.short,
        links: [
          { label: "Overview", href: electrical.path },
          {
            label: "Introducing CodeVault Electrical",
            href: `/news/${electrical.announcementSlug}`,
          },
          { label: "Guides", href: "/guides" },
        ],
      },
      {
        heading: "News",
        links: [
          { label: "All news", href: "/news" },
          { label: "Announcements", href: "/news", category: "Announcements" },
          { label: "Engineering", href: "/news", category: "Engineering" },
          { label: "Electrical", href: "/news", category: "Electrical" },
        ],
      },
      {
        heading: "CodeVault",
        links: [
          { label: "About", href: "/about" },
          { label: "Brand", href: "/brand" },
          { label: "GitHub", href: "https://github.com/CodeVault-LLC" },
          {
            label: "Report a vulnerability",
            href: `mailto:${securityEmail}`,
          },
        ],
      },
    ],
    copyright: "© 2026 CodeVault",
  },

  notFound: {
    title: "Page not found",
    description: "This page may have moved, or it was never here.",
    action: "Back to home",
  },
} as const
