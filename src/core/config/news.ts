// News posts. Newest first is applied by `allPosts()`, not by the order here.
//
// Everything in these posts should be true of the project on the date given.
// Kilo's source of truth is its own repository (PHASES.md, the decision log and
// the job documents); when in doubt, say less.

export const categories = [
  "Announcements",
  "Kilo",
  "Engineering",
  "Notes",
] as const

export type Category = (typeof categories)[number]

/** Which illustration a post uses. See `components/news/post-art.tsx`. */
export type ArtKey =
  "kilo" | "assistant" | "viewport" | "revit" | "foundation" | "fresh"

/** Background swatch behind the illustration. */
export type Tone = "persimmon" | "oat" | "sky" | "olive" | "cactus" | "heather"

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "list"; items: string[] }
  | { type: "figure"; art: ArtKey; tone: Tone; caption: string }

export type Post = {
  slug: string
  title: string
  date: string // ISO, yyyy-mm-dd
  category: Category
  /** The project a post belongs to, shown in the card's details row. */
  project?: string
  summary: string
  lead: string
  art: ArtKey
  tone: Tone
  body: Block[]
}

const posts: Post[] = [
  {
    slug: "introducing-kilo",
    title: "Introducing Kilo",
    date: "2026-10-07",
    category: "Announcements",
    project: "Kilo",
    summary:
      "An electrical design tool for building modules. The model is always on screen, and an assistant works through the same tools you do.",
    lead: "Kilo is an electrical design tool for industrially built modules — rooms and units that leave the factory already wired. We started it on October 5th. This is what it is, what works today, and what doesn't yet.",
    art: "kilo",
    tone: "persimmon",
    body: [
      { type: "h2", id: "why", text: "Why we're building it" },
      {
        type: "p",
        text: "Electrical design for modular buildings mostly happens in large, general-purpose BIM tools. They can do the job, but the daily work is slow: a lot of the same steps, repeated across a lot of very similar modules.",
      },
      {
        type: "p",
        text: "Kilo's bet is that this work gets much faster when the model is the application. It's always on screen, frequent actions take a click or a keystroke, and exact values can be typed while you work.",
      },
      { type: "h2", id: "today", text: "What works today" },
      {
        type: "list",
        items: [
          "Durable projects that survive a crash, a copy and a move.",
          "Opening IFC models and showing them straight away, in plan and in 3D.",
          "Selecting, isolating and clipping reference models, with exact height ranges and box selection.",
          "A searchable component catalogue, with drag-and-drop placement, snapping and undo.",
        ],
      },
      {
        type: "figure",
        art: "viewport",
        tone: "oat",
        caption: "Plan and 3D views of the same model, sharing one selection.",
      },
      { type: "h2", id: "progress", text: "What's in progress" },
      {
        type: "p",
        text: "An assistant that works inside the workspace, using the same commands as the designer. We're also writing a reader that opens Revit files directly, without Revit. Both have their own posts.",
      },
      { type: "h2", id: "missing", text: "What isn't there yet" },
      {
        type: "p",
        text: "Circuits, routing, schedules and drawing outputs: the parts that turn a placed design into something a factory can build. They come next.",
      },
      { type: "h2", id: "availability", text: "Availability" },
      {
        type: "p",
        text: "Kilo is in development and isn't available to download yet. When that changes, we'll say so here.",
      },
    ],
  },
  {
    slug: "kilo-assistant",
    title: "An assistant that works in the model",
    date: "2026-10-07",
    category: "Kilo",
    project: "Kilo",
    summary:
      "Kilo's assistant uses the same typed commands as the designer, so every change it makes shows up in the model and can be undone.",
    lead: "Most AI features in design tools sit next to the work, in a chat window. In Kilo, the assistant works through the same commands the designer uses.",
    art: "assistant",
    tone: "heather",
    body: [
      { type: "h2", id: "same-tools", text: "Same tools, same rules" },
      {
        type: "p",
        text: "Every change in Kilo is a typed command. The assistant gets no special access: it calls those commands, and each one records who issued it. Its edits land as ordinary revisions, highlighted in the viewport and undoable like anything else.",
      },
      { type: "h2", id: "looking", text: "Looking before acting" },
      {
        type: "p",
        text: "Before it places anything, the assistant can probe the model. It can measure against reference geometry, check clearances, and find the wall frames a component would mount on. A designer answers these questions by eye. The assistant has to ask them out loud.",
      },
      {
        type: "figure",
        art: "assistant",
        tone: "heather",
        caption:
          "Suggestions appear in the model, not just in the conversation.",
      },
      { type: "h2", id: "status", text: "Status" },
      {
        type: "p",
        text: "This is early. The conversation, command provenance and geometry tools are in place. We're still working out how suggestions are shown, accepted and rejected. Underneath, it runs on Claude Code.",
      },
    ],
  },
  {
    slug: "opening-revit-files",
    title: "Opening Revit files without Revit",
    date: "2026-10-07",
    category: "Engineering",
    project: "Kilo",
    summary:
      "A Revit file is a container of compressed streams with its own schema inside. Here's what we found taking one apart.",
    lead: "Electrical designers have years of work in Revit's .rvt format. For Kilo to be useful, it has to read those files with our own code, and without Revit installed.",
    art: "revit",
    tone: "sky",
    body: [
      { type: "h2", id: "inside", text: "What's inside" },
      {
        type: "p",
        text: "An .rvt file is a Microsoft compound file: a small file system holding around fifteen named streams. A couple are plain text, like basic file information and transmission data. The rest are stored as DEFLATE-compressed chunks. The main partition of a mid-sized model inflates to several times its size on disk.",
      },
      { type: "h2", id: "schema", text: "A schema that describes itself" },
      {
        type: "p",
        text: "One stream holds a self-describing schema: about 6,000 class names, each with its fields. Electrical connectors, circuit paths, conduit runs, cable trays and geometry are all in there by name. That turns the job from guessing at bytes into reading a map.",
      },
      {
        type: "figure",
        art: "revit",
        tone: "sky",
        caption: "One file, many streams. Most of them are compressed.",
      },
      { type: "h2", id: "dependencies", text: "Dependencies hide in the data" },
      {
        type: "p",
        text: "Linked models aren't always listed in the obvious metadata. We found one cloud link recorded only inside a data partition. So detecting a missing dependency means reading the link elements themselves, not just the XML.",
      },
      { type: "h2", id: "status", text: "Where it stands" },
      {
        type: "p",
        text: "The reader accounts for every byte in the files we've tested and reads the class schema. Next, it has to interpret elements into Kilo's own model.",
      },
    ],
  },
  {
    slug: "viewport-first",
    title: "Viewport first",
    date: "2026-10-06",
    category: "Kilo",
    project: "Kilo",
    summary:
      "Opening a file should show it. A change of direction on Kilo's second day, and what it took out of the way.",
    lead: "On day two we changed direction. Kilo had been growing confirmation steps between the designer and the model: previews, coordinate acceptance, review gates. We moved them out of the way.",
    art: "viewport",
    tone: "olive",
    body: [
      {
        type: "h2",
        id: "application",
        text: "The model is the application",
      },
      {
        type: "p",
        text: "Opening a project lands in the workspace, and the plan and 3D viewport is by far the largest thing on screen. Settings, inputs and history are panels, never the landing screen. Opening a file shows it.",
      },
      { type: "h2", id: "background", text: "Checks run in the background" },
      {
        type: "p",
        text: "Unit and coordinate problems still get found. They appear as warnings in the workspace, and only interrupt when a model can't be used at all. Aligning coordinates became a tool you reach for, not a gate you pass through.",
      },
      { type: "h2", id: "precision", text: "Precision stays underneath" },
      {
        type: "p",
        text: "Exact units, durable revisions, undo and recovery are still hard rules. The core enforces them, and the interface shows them as a small status rather than as ceremony.",
      },
    ],
  },
  {
    slug: "a-fresh-start",
    title: "A fresh start for this site",
    date: "2026-10-07",
    category: "Notes",
    summary: "We stripped codevault.no down to two things: news, and Kilo.",
    lead: "This site used to hold a report archive, sign-in, project dossiers and a research section. That was more machinery than anyone needed to read a few pages.",
    art: "fresh",
    tone: "cactus",
    body: [
      {
        type: "p",
        text: "So we started over. No database, no accounts, no storage — just pages. News is where we write about what we're doing. Kilo has a page of its own because, right now, it's most of what we're doing.",
      },
      {
        type: "p",
        text: "The old work isn't gone. It lives in the repository history, and the projects worth writing about will come back as posts.",
      },
    ],
  },
  {
    slug: "projects-that-survive",
    title: "Day one: projects that survive",
    date: "2026-10-05",
    category: "Kilo",
    project: "Kilo",
    summary:
      "Before Kilo could draw anything, it had to be able to keep it. The first day went into durable projects.",
    lead: "A design tool that loses work is not a design tool. So Kilo's first day went into the part nobody sees.",
    art: "foundation",
    tone: "oat",
    body: [
      { type: "h2", id: "means", text: "What that means" },
      {
        type: "list",
        items: [
          "Projects keep the original files they were made from, untouched.",
          "Every change is a revision, so a project can be copied, moved and reopened exactly.",
          "An interrupted save recovers instead of corrupting.",
        ],
      },
      { type: "h2", id: "built", text: "How it's built" },
      {
        type: "p",
        text: "Kilo is a desktop app built on Tauri. The design engine is written in Rust and the interface in React. The engine owns the design state, and the interface asks it for things.",
      },
    ],
  },
]

/** Every post, newest first. Same-day posts keep their order above. */
export function allPosts(): Post[] {
  return posts
    .map((post, index) => ({ post, index }))
    .sort((a, b) => b.post.date.localeCompare(a.post.date) || a.index - b.index)
    .map(({ post }) => post)
}

export function findPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}

export function postsFor(project: string): Post[] {
  return allPosts().filter((post) => post.project === project)
}

export function isCategory(value: unknown): value is Category {
  return categories.includes(value as Category)
}

const longDate = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
})

const shortDate = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})

export function formatDate(iso: string, style: "long" | "short" = "long") {
  const date = new Date(`${iso}T00:00:00Z`)
  return (style === "long" ? longDate : shortDate).format(date)
}
