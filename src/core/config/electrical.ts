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
    /** The scene's light, chosen by the visitor's own time of day. */
    light: {
      label: "Light",
      morning: "Morning",
      noon: "Noon",
      evening: "Evening",
    },
    credit: "Generated image, not a real project",
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

  // Four steps, shown beside a drawing that scrolling plays through. The
  // drawing has exactly these four stages, in this order.
  principles: {
    heading: "How it works",
    items: [
      {
        title: "Pick the devices",
        body: "Two for a single run, A to B. Or several, linked as a chain or as a tree.",
      },
      {
        title: "It suggests a route",
        body: "Right angles, room for every elbow, and as few bends as it can. Boxes in a wall are joined up, across and down.",
      },
      {
        title: "It checks the route",
        body: "Against everything set to Avoid, in the model and its links, using their real geometry. Walls, beams and ceilings it passes through are listed.",
      },
      {
        title: "You decide",
        body: "Add it as one undo step, or cancel and the model is left as it was.",
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

  // Beside two photographs of installed conduit. The photographs set the
  // scene; they aren't routes CodeVault Electrical made.
  layout: {
    heading: "Laid out the way it's installed",
    body: "Right angles, room for every elbow, and as few bends as it can. Boxes in a wall are joined up, across and down.",
  },

  // What IT and BIM managers ask before rolling it out. Each line is backed by
  // the repository's security policy, settings docs and changelog.
  rollout: {
    heading: "Before it goes on every machine",
    items: [
      {
        title: "Your models stay on your machines",
        body: "It makes no network calls. Logs record element IDs and timings, never model contents.",
      },
      {
        title: "Managed centrally",
        body: "A machine-wide settings file overrides each user's, and one switch turns every command off.",
      },
      {
        title: "Changes only what it adds",
        body: "Each route is one undo step, stamped with its ID and version. It never saves the project, and linked models are read only.",
      },
      {
        title: "Works with shared models",
        body: "It checks that elements are editable, and stops before changing anything if a link is unloaded or a workset is closed.",
      },
      {
        title: "No clashes with other add-ins",
        body: "It loads no third-party libraries into Revit.",
      },
    ],
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

  guidesHeading: "Guides",
  newsHeading: "Electrical news",
} as const
