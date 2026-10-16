// The CodeVault Electrical page. Every claim and status label must be true of
// the product's own repository on the date shown (its changelog, plan and
// decision records). "Working" means it runs today, not that it's released.
// It is meant to be sold, so describe what it does, never what it's built
// with. Routes keep clear of what is set to Avoid; never call them
// "clash-free" — the product doesn't promise that, so neither do we.

import { company } from "./company"

export type Status = "Working" | "In progress" | "Next"

/** The drawings in src/components/electrical/tool-diagram.tsx. */
export type Diagram = "ab" | "network" | "tray" | "batch" | "watch"

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
    "A Revit add-in for electricians. Pick the devices, and it suggests a conduit route between them, or down to the nearest cable tray, that keeps clear of what's in the way. In development, with early access open.",
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

  // One row per tool, each beside a drawing of what it does. The drawing's
  // frame is sized for a short screen recording to take its place later.
  features: {
    heading: "What it does",
    items: [
      {
        name: "Route A→B",
        diagram: "ab",
        status: "Working",
        body: "Pick two devices, or a device and the open end of a conduit, and it suggests one run between them.",
        details: [
          "Right angles, room for every elbow, and as few bends as it can.",
          "No more than 360° of bends in a run where a route allows it, and a warning where none does.",
          "A run that continues existing conduit keeps its type, size and Service Type.",
        ],
      },
      {
        name: "Connect Devices",
        diagram: "network",
        status: "Working",
        body: "Select several devices and they're linked as a chain or as a tree, planned together so an early run never boxes in a later one.",
        details: [
          "Click devices in the view, or draw a box around them. Only devices are added.",
          "The same devices give the same network, whatever order they're picked in.",
          "Nothing is drawn unless every link can be planned.",
        ],
      },
      {
        name: "Drop to Tray",
        diagram: "tray",
        status: "Working",
        body: "Select a device, and it drops conduit into the bottom or side of the nearest cable tray it can reach, in the model or a linked one.",
        details: [
          "It names the tray it used, and says why a nearer one wasn't.",
          "The tray itself is never changed.",
          "Straight, horizontal trays for now.",
        ],
      },
      {
        name: "Up to 50 drops at once",
        diagram: "batch",
        status: "Working",
        body: "Select a room's worth of devices, and each gets its own drop to tray, in one review and one undo step.",
        details: [
          "Drops keep clear of each other as well as the model.",
          "The review lists each device's tray, with the total length and elbows.",
          "If one device can't be routed, nothing is added and the message names it.",
        ],
      },
      {
        name: "Watching routes",
        diagram: "watch",
        status: "Next",
        body: "When a device moves, or a duct is moved into a route, it will notice, say what happened and offer a fix to review. It never changes a route on its own.",
        details: [
          "Working today: Re-route plans a route again after the model changes, and swaps it in one undo step.",
          "Select Routes and Remove Routes act on a whole route at once, and leave the devices as they are.",
        ],
      },
    ],
  } satisfies {
    heading: string
    items: {
      name: string
      diagram: Diagram
      status: Status
      body: string
      details: string[]
    }[]
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
      {
        label: "Drop to Tray, up to 50 devices at once",
        status: "Working",
      },
      { label: "Select, Remove and Re-route", status: "Working" },
      { label: "Avoid or Go through, per kind of element", status: "Working" },
      { label: "Final check against actual geometry", status: "Working" },
      { label: "First release", status: "In progress" },
      { label: "Watching routes after the model changes", status: "Next" },
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
        body: "Nothing from a model leaves the machine. The licence check sends an activation code, a random ID for the PC and the version. Logs record element IDs and timings, never model contents.",
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
    { label: "Built for", value: "Revit 2025 and 2026" },
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
        a: "A Revit add-in for electricians and electrical designers. It routes conduit: pick two devices, or several, and it suggests a route that keeps clear of what's in the way. It can also drop conduit from devices to the nearest cable tray.",
      },
      {
        q: "Which versions of Revit does it work with?",
        a: "It's built for Revit 2025 and 2026, on Windows. So far it has been tested in 2026.",
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
