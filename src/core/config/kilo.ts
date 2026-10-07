// The Kilo page. Status labels must match the project's own ledger (kile's
// PHASES.md) — "Working" means it runs today, not that it's finished.

export type Status = "Working" | "In progress" | "Next"

export const kilo = {
  name: "Kilo",
  title: "Introducing Kilo",
  tagline: "Electrical design for building modules.",
  summary:
    "An electrical design tool for industrially built modules. The model is always on screen, and an assistant works through the same tools you do.",
  announcementSlug: "introducing-kilo",
  hero: {
    eyebrow: "A CodeVault project",
    heading: "Kilo",
    body: "Electrical design for building modules, with the model always on screen.",
    primary: "Read the announcement",
    note: "In development. Not yet available to download.",
  },

  principles: {
    heading: "How it works",
    items: [
      {
        title: "The model is the application",
        body: "Open a file and it's on screen, in plan and 3D. Settings and history are panels, never the landing page.",
      },
      {
        title: "Exact, and undoable",
        body: "Type exact values while you work. Every change is a revision you can undo, copy or reopen.",
      },
      {
        title: "An assistant in the workspace",
        body: "It uses the same commands you do. Its changes show up in the model, highlighted and reversible.",
      },
    ],
  },

  status: {
    heading: "Where it stands",
    rows: [
      { label: "Durable projects and recovery", status: "Working" },
      { label: "IFC models in plan and 3D", status: "Working" },
      { label: "Selection, isolation and clipping", status: "Working" },
      { label: "Component catalogue and placement", status: "Working" },
      { label: "Assistant in the workspace", status: "In progress" },
      { label: "Reading Revit files directly", status: "In progress" },
      { label: "Circuits, routing and outputs", status: "Next" },
    ] satisfies { label: string; status: Status }[],
  },

  facts: [
    { label: "Started", value: "October 5, 2026" },
    { label: "Platform", value: "Desktop (Tauri)" },
    { label: "Engine", value: "Rust" },
    { label: "Interface", value: "React" },
  ],

  newsHeading: "Kilo news",
} as const
