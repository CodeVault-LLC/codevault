export const site = {
  name: "CodeVault",
  tagline: "Tools for the people who build software.",
  description:
    "CodeVault is a software platform that gives programmers one place to write, review, ship, and observe the code they care about.",
  url: "https://codevault.dev",
} as const

export type NavItem = {
  label: string
  href?: string
  description?: string
  sections?: { heading: string; links: { label: string; href: string }[] }[]
}

export const mainNav: NavItem[] = [
  {
    label: "Product",
    description: "A single surface for the modern software team.",
    sections: [
      {
        heading: "Workflows",
        links: [
          { label: "Code review", href: "#releases" },
          { label: "Continuous integration", href: "#releases" },
          { label: "Deploy previews", href: "#releases" },
          { label: "Observability", href: "#releases" },
        ],
      },
      {
        heading: "Foundations",
        links: [
          { label: "Security & compliance", href: "#about" },
          { label: "Audit log", href: "#about" },
          { label: "Self-hosted runners", href: "#about" },
        ],
      },
    ],
  },
  {
    label: "Solutions",
    description: "Built for the shape of real engineering teams.",
    sections: [
      {
        heading: "By team",
        links: [
          { label: "Platform engineering", href: "#about" },
          { label: "Infrastructure", href: "#about" },
          { label: "Open source maintainers", href: "#about" },
        ],
      },
      {
        heading: "By stage",
        links: [
          { label: "Early-stage startups", href: "#about" },
          { label: "Public companies", href: "#about" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    description: "Guides, references, and field notes.",
    sections: [
      {
        heading: "Read",
        links: [
          { label: "Documentation", href: "#docs" },
          { label: "Engineering blog", href: "#blog" },
          { label: "Changelog", href: "#releases" },
          { label: "Status", href: "#status" },
        ],
      },
    ],
  },
  {
    label: "Company",
    description: "Who we are and what we are working toward.",
    sections: [
      {
        heading: "About",
        links: [
          { label: "Our mission", href: "#about" },
          { label: "Careers", href: "#careers" },
          { label: "Press", href: "#press" },
          { label: "Contact", href: "#contact" },
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
    title: "Branching strategies, in CodeVault",
    description:
      "A new branching model that gives every team a sensible default, without locking anyone in.",
    date: "June 12, 2026",
    category: "Release",
    href: "#releases",
  },
  {
    title: "Faster code review, with fewer interruptions",
    description:
      "Reviewer suggestions, batched notifications, and a quieter inbox for the people reviewing your code.",
    date: "May 28, 2026",
    category: "Product update",
    href: "#releases",
  },
  {
    title: "Self-hosted runners are now generally available",
    description:
      "Run your builds on your own hardware, in your own VPC, with the same primitives we use in production.",
    date: "May 9, 2026",
    category: "Release",
    href: "#releases",
  },
]

export const footerNav = {
  Product: [
    { label: "Overview", href: "#about" },
    { label: "Code review", href: "#releases" },
    { label: "Continuous integration", href: "#releases" },
    { label: "Deploy previews", href: "#releases" },
    { label: "Observability", href: "#about" },
    { label: "Security & compliance", href: "#about" },
    { label: "Changelog", href: "#releases" },
  ],
  Resources: [
    { label: "Documentation", href: "#docs" },
    { label: "Engineering blog", href: "#blog" },
    { label: "Customer stories", href: "#about" },
    { label: "Open source", href: "#oss" },
    { label: "Community", href: "#community" },
    { label: "Status", href: "#status" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Careers", href: "#careers" },
    { label: "Press", href: "#press" },
    { label: "Brand", href: "#brand" },
    { label: "Contact", href: "#contact" },
  ],
  Legal: [
    { label: "Privacy", href: "#privacy" },
    { label: "Terms", href: "#terms" },
    { label: "Security", href: "#security" },
    { label: "DPA", href: "#dpa" },
    { label: "Cookies", href: "#cookies" },
  ],
} as const
