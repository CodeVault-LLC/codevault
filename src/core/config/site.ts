// Site-wide copy. Page components own structure; the words live here and in
// `news.ts` / `kilo.ts`.

export const site = {
  name: "CodeVault",
  url: "https://codevault.no",
  title: "CodeVault",
  description:
    "CodeVault builds projects across tech and writes down how they went. Right now that mostly means Kilo.",
  ogImage: "/og-image.png",
  github: "https://github.com/CodeVault-LLC",
  securityEmail: "security@codevault.no",

  nav: [
    { label: "Kilo", href: "/kilo" },
    { label: "News", href: "/news" },
  ],
  cta: { label: "Meet Kilo", href: "/kilo" },

  home: {
    // Words wrapped in `[]` are underlined links; see `HeadlineWords`.
    headline: "We build [projects] across tech and write down [what happens].",
    headlineLinks: ["/kilo", "/news"],
    intro:
      "Some of it ships, some of it doesn't. Either way, the notes end up here.",
    latestHeading: "Latest from Kilo",
    moreHeading: "More from CodeVault",
    statement:
      "We try things across tech — tools, games, hardware, research — and keep honest notes on what we learn.",
  },

  footer: {
    columns: [
      {
        heading: "Kilo",
        links: [
          { label: "Overview", href: "/kilo" },
          { label: "Introducing Kilo", href: "/news/introducing-kilo" },
        ],
      },
      {
        heading: "News",
        links: [
          { label: "All news", href: "/news" },
          { label: "Announcements", href: "/news", category: "Announcements" },
          { label: "Engineering", href: "/news", category: "Engineering" },
          { label: "Notes", href: "/news", category: "Notes" },
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
