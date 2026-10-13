// The CodeVault Electrical page. Every claim and status label must be true of
// the product's own repository on the date shown (its changelog, plan and
// decision records). "Working" means it runs today, not that it's released.
// It is meant to be sold, so describe what it does, never what it's built
// with. Routes keep clear of what is set to Avoid; never call them
// "clash-free" — the product doesn't promise that, so neither do we.

import { company } from "./company"

export type Status = "Working" | "In progress" | "Next"

export const electrical = {
  name: "CodeVault Electrical",
  /** In the nav and anywhere the full name is too long. */
  short: "Electrical",
  path: "/electrical",
  tagline: "Conduit routing for Revit.",
  /** The page's <title>: the name, and what people search for. */
  seoTitle: "CodeVault Electrical — Conduit routing add-in for Revit",
  ogImage: "/og/electrical.png",
  summary:
    "A Revit add-in for electricians. Pick the devices, and it suggests a conduit route that keeps clear of what's in the way. In development, with early access open.",
  announcementSlug: "introducing-codevault-electrical",

  hero: {
    eyebrow: "A Revit add-in",
    body: "Pick two devices, or several, and get a conduit route that keeps clear of what's in the way.",
    secondary: "Read the announcement",
    note: "In development. Early access by application.",
  },

  access: {
    label: "Apply for early access",
    href: `mailto:${company.email}?subject=CodeVault%20Electrical%20early%20access`,
  },

  tools: {
    heading: "Two ways to connect",
    items: [
      {
        name: "Route A→B",
        diagram: "ab",
        body: "Pick two devices, or a device and an open conduit end, and get one run between them.",
      },
      {
        name: "Connect Devices",
        diagram: "network",
        body: "Select several, and they're linked as a chain or as a tree.",
      },
    ],
  },

  principles: {
    heading: "How it works",
    items: [
      {
        title: "Suggested, then added",
        doodle: "preview",
        body: "The route is shown before you accept it. Add it as one undo step, or cancel and the model is left as it was.",
      },
      {
        title: "Clear of what you set to Avoid",
        doodle: "avoid",
        body: "Ducts, pipes, columns, doors and windows by default, in the model and its links, checked against their real geometry. Walls, beams and ceilings may be passed through; each one is listed before you accept.",
      },
      {
        title: "Laid out the way it's installed",
        doodle: "elbow",
        body: "Right angles, room for every elbow, and as few bends as it can. Boxes in a wall are joined up, across and down.",
      },
    ],
  },

  status: {
    heading: "Where it stands",
    rows: [
      { label: "Route A→B", status: "Working" },
      { label: "Connect Devices, as a chain or a tree", status: "Working" },
      { label: "Avoid or Go through, per kind of element", status: "Working" },
      { label: "Final check against actual geometry", status: "Working" },
      { label: "First release", status: "In progress" },
      { label: "Drops to the nearest cable tray", status: "Next" },
    ] satisfies { label: string; status: Status }[],
  },

  facts: [
    { label: "Runs in", value: "Revit 2025 and 2026" },
    { label: "Stage", value: "In development" },
    { label: "Access", value: "Early access" },
  ],

  // Plain answers to what people (and the assistants they ask) want to know.
  // Shown on the page and given to search engines as an FAQ; keep both true.
  faq: {
    heading: "Questions",
    items: [
      {
        q: "What is CodeVault Electrical?",
        a: "A Revit add-in for electricians and electrical designers. It routes conduit: pick two devices, or several, and it suggests a route that keeps clear of what's in the way.",
      },
      {
        q: "Which versions of Revit does it work with?",
        a: "Revit 2025 and 2026, on Windows.",
      },
      {
        q: "Does it see linked models?",
        a: "Yes. Routes keep clear of what's in linked models as well as the host model, checked against their real geometry before you see the suggestion.",
      },
      {
        q: "Will it change my model without asking?",
        a: "No. Every route is shown first. Add it as one undo step, or cancel and nothing changes.",
      },
      {
        q: "Can I use it today?",
        a: "It's in development. Early access is open to a small group of electrical contractors and designers; apply by email.",
      },
      {
        q: "Who makes it?",
        a: "CodeVault, a Norwegian software company.",
      },
    ],
  },

  newsHeading: "Electrical news",
} as const
