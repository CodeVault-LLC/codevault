export const site = {
  name: "CodeVault",
  tagline: "We point ourselves at tech, and see what happens.",
  description:
    "CodeVault isn't a product company. We run projects across everything in tech — trials, experiments, and the occasional small thing we push to GitHub. Built in the open, shared as they are.",
  url: "https://codevault.no",
} as const

export type NavItem = {
  label: string
  href?: string
  description?: string
  sections?: { heading: string; links: { label: string; href: string }[] }[]
}

export const mainNav: NavItem[] = [
  {
    label: "Projects",
    description: "The things we're building, breaking, and learning from.",
    sections: [
      {
        heading: "Recent",
        links: [
          { label: "Orbit", href: "/projects/orbit" },
          { label: "git-story", href: "/projects/git-story" },
          { label: "The plant-watering Pi", href: "/projects/plant-pi" },
          { label: "All projects", href: "/projects" },
        ],
      },
      {
        heading: "In the open",
        links: [
          { label: "GitHub", href: "https://github.com/CodeVault-LLC" },
          { label: "Experiments", href: "/projects" },
          { label: "Changelog", href: "/projects/git-story" },
        ],
      },
    ],
  },
  {
    label: "About",
    description: "Who we are and how we work.",
    sections: [
      {
        heading: "CodeVault",
        links: [
          { label: "How we work", href: "/about" },
          { label: "Who we are", href: "/about/who-we-are" },
          { label: "Get in touch", href: "/about/contact" },
          { label: "Brand", href: "/about/brand" },
        ],
      },
    ],
  },
]

export const releases: {
  title: string
  description: string
  date: string
  category: string
  href: string
}[] = [
  {
    title: "Orbit — a tiny game we built in a weekend",
    description:
      "A browser game about keeping satellites from colliding. It does a few basic things, and we learned a lot shipping it.",
    date: "June 12, 2026",
    category: "Experiment",
    href: "/projects/orbit",
  },
  {
    title: "A CLI that turns your git log into a story",
    description:
      "We wanted our commit history to read better, so we made a small tool. Now it's on GitHub for anyone who wants it.",
    date: "May 28, 2026",
    category: "Open source",
    href: "/projects/git-story",
  },
  {
    title: "Teaching a Raspberry Pi to water our plants",
    description:
      "Hardware wasn't our field, so we made it one for a month. Sensors, a pump, and a lot of trial and error.",
    date: "May 9, 2026",
    category: "Project log",
    href: "/projects/plant-pi",
  },
]

export const footerNav = {
  Projects: [
    { label: "All projects", href: "/projects" },
    { label: "Orbit", href: "/projects/orbit" },
    { label: "git-story", href: "/projects/git-story" },
    { label: "The plant-watering Pi", href: "/projects/plant-pi" },
    { label: "GitHub", href: "https://github.com/CodeVault-LLC" },
  ],
  Writing: [
    { label: "Blog", href: "#blog" },
    { label: "Project logs", href: "#releases" },
    { label: "Notes", href: "#blog" },
    { label: "Changelog", href: "#releases" },
    { label: "Community", href: "#community" },
  ],
  About: [
    { label: "How we work", href: "/about" },
    { label: "Who we are", href: "/about/who-we-are" },
    { label: "Get in touch", href: "/about/contact" },
    { label: "Brand", href: "/about/brand" },
  ],
  Legal: [
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
    { label: "Cookies", href: "/legal/cookies" },
    { label: "Security", href: "/legal/security" },
  ],
} as const
