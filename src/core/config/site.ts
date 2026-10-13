// Site-wide copy. Page components own structure; the words live here and in
// `news.ts` / `electrical.ts`.

import { electrical } from "./electrical"

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
  securityEmail: "security@codevault.no",

  nav: [
    { label: electrical.short, href: electrical.path },
    { label: "News", href: "/news" },
  ],
  cta: { label: "Early access", href: electrical.path },

  home: {
    // Words wrapped in `[]` are underlined links; see `HeadlineWords`.
    headline:
      "We build software for the problems large organisations have [learned to live with].",
    headlineLinks: [electrical.path],
    intro:
      "Right now that means CodeVault Electrical, a Revit add-in that routes conduit for electricians.",
    latestHeading: "Latest from Electrical",
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
          { label: "Brand", href: "/brand" },
          { label: "GitHub", href: "https://github.com/CodeVault-LLC" },
          {
            label: "Report a vulnerability",
            href: "mailto:security@codevault.no",
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
