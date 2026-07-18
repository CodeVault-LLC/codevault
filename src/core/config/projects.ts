// Structured content for the mock Project pages. Content lives in config (see
// docs/code-rules.md); the three detail views render this same model in three
// deliberately different styles. User-facing strings belong here — page
// components own only structure and presentation.

export type ProjectStatus = "Shipped" | "In progress" | "Paused"

// Which detail treatment renders this project.
export type ProjectStyle = "dossier" | "journal" | "readme"

export type LoopPhase = "Trial" | "Experience" | "Adjustment" | "Result"

export type LoopStep = {
  phase: LoopPhase
  body: string
}

export type LogEntry = {
  date: string
  title: string
  body: string
  // A short honest label: "shipped", "setback", "note"…
  tag?: string
}

export type ProjectLink = {
  label: string
  href: string
  kind: "repo" | "demo" | "writeup"
}

export type Fact = {
  label: string
  value: string
}

export type Project = {
  slug: string
  style: ProjectStyle
  name: string
  // One accent word, rendered serif-italic in the hero heading.
  accent: string
  summary: string
  status: ProjectStatus
  field: string
  // Ordered metadata shown in the facts panel / telemetry rail.
  facts: Fact[]
  stack: string[]
  links: ProjectLink[]
  // The CodeVault loop, filled with this project's real story.
  loop: LoopStep[]
  log: LogEntry[]
  // Short editorial reflection. Each paragraph is an entry.
  notes: string[]
}

export const projects: Project[] = [
  {
    slug: "orbit",
    style: "dossier",
    name: "Orbit",
    accent: "collide",
    summary:
      "A browser game about keeping a sky full of satellites from colliding — built over one long weekend.",
    status: "Shipped",
    field: "Games",
    facts: [
      { label: "Designation", value: "ORB-01" },
      { label: "Status", value: "Shipped" },
      { label: "Field", value: "Games" },
      { label: "Trial began", value: "2026-06-06" },
      { label: "Shipped", value: "2026-06-12" },
      { label: "Duration", value: "6 days" },
      { label: "Crew", value: "2" },
      { label: "License", value: "MIT" },
    ],
    stack: ["TypeScript", "Canvas 2D", "Vite", "Web Audio"],
    links: [
      { label: "Play in the browser", href: "/projects/orbit", kind: "demo" },
      {
        label: "github.com/codevault/orbit",
        href: "/projects/orbit",
        kind: "repo",
      },
    ],
    loop: [
      {
        phase: "Trial",
        body: "We wanted to see whether a whole screen of moving satellites could feel tense without any art. One weekend, one canvas, a few hundred dots and some orbital math.",
      },
      {
        phase: "Experience",
        body: "The first playable was oddly calm. Dots drifted, nothing felt at stake. The tension we imagined only appeared when two orbits nearly crossed — and that moment was over too fast to enjoy.",
      },
      {
        phase: "Adjustment",
        body: "So we stopped simulating real gravity and started tuning for the near-miss. Slower closing speeds, a warning ring, a held breath before impact. The physics got less correct and the game got much better.",
      },
      {
        phase: "Result",
        body: "A small game that does a few things well: nudge orbits, avoid collisions, watch the debris field grow when you fail. Shipped to the browser, MIT on GitHub. We learned more about feel than about orbits.",
      },
    ],
    log: [
      {
        date: "2026-06-06",
        title: "First canvas, first drift",
        tag: "trial",
        body: "Got a few hundred satellites drifting on elliptical paths. Beautiful, completely un-fun. No sense of risk.",
      },
      {
        date: "2026-06-08",
        title: "Collisions felt wrong",
        tag: "setback",
        body: "Real-ish gravity meant collisions were either impossible or instantaneous. Spent a day fighting the simulation before admitting the simulation was the problem.",
      },
      {
        date: "2026-06-09",
        title: "Tuned for the near-miss",
        tag: "note",
        body: "Threw out accurate physics. Added a warning ring and slowed closing speeds so a near-miss lasts about a second. Suddenly tense.",
      },
      {
        date: "2026-06-11",
        title: "Debris makes failure legible",
        tag: "note",
        body: "A failed collision now leaves a spreading debris field that threatens the next pass. Losing tells a story instead of just ending.",
      },
      {
        date: "2026-06-12",
        title: "Shipped",
        tag: "shipped",
        body: "Pushed to the browser and to GitHub under MIT. Six days, two people, no art budget. Calling it done.",
      },
    ],
    notes: [
      "The whole project turned on giving up on accuracy. We came in wanting real orbital mechanics and left having learned that a game about satellites doesn't need real satellites — it needs a good near-miss.",
      "If we came back to it, we'd add a slow campaign of increasingly crowded skies. But we probably won't come back to it, and that's fine. It did its job: it was a trial, and we reacted to it.",
    ],
  },
  {
    slug: "plant-pi",
    style: "journal",
    name: "The plant-watering Pi",
    accent: "alive",
    summary:
      "A month of teaching a Raspberry Pi to keep our office plants alive. Hardware wasn't our field, so we made it one for a while.",
    status: "Paused",
    field: "Hardware & tinkering",
    facts: [
      { label: "Status", value: "Paused" },
      { label: "Field", value: "Hardware & tinkering" },
      { label: "Started", value: "May 9, 2026" },
      { label: "Paused", value: "June 4, 2026" },
      { label: "Plants under care", value: "3" },
      { label: "Casualties", value: "1" },
      { label: "Crew", value: "2" },
    ],
    stack: [
      "Raspberry Pi Zero 2 W",
      "Python",
      "Soil moisture sensor",
      "Peristaltic pump",
      "A relay we were slightly afraid of",
    ],
    links: [
      {
        label: "github.com/codevault/plant-pi",
        href: "/projects/plant-pi",
        kind: "repo",
      },
      {
        label: "Read the full log",
        href: "/projects/plant-pi/log",
        kind: "writeup",
      },
    ],
    loop: [
      {
        phase: "Trial",
        body: "None of us had wired anything to a Pi before. That was the whole point. We bought a moisture sensor, a small pump, and a relay, and pointed all of it at a very patient pothos.",
      },
      {
        phase: "Experience",
        body: "Software we could reason about. The physical world we could not. Sensors drifted, the pump back-siphoned, and one over-eager watering routine drowned a basil plant we'd grown fond of.",
      },
      {
        phase: "Adjustment",
        body: "We stopped trusting a single reading and started averaging over hours. We added a hard daily cap on water. We accepted that a plant is a slow system and a script that reacts fast is usually a script that does harm.",
      },
      {
        phase: "Result",
        body: "It kept two of three plants alive for three weeks unattended. Then we paused it — not because it failed, but because we'd learned what we came to learn. The rig is on a shelf, documented, ready to restart.",
      },
    ],
    log: [
      {
        date: "May 9",
        title: "Everything arrived in one box",
        tag: "trial",
        body: "A Pi Zero, a sensor, a pump, a relay, and a bag of jumper wires. We had no idea which end of the relay was which. Spent the evening reading and not plugging anything in.",
      },
      {
        date: "May 12",
        title: "First reading, wildly wrong",
        tag: "setback",
        body: "The moisture sensor swore a bone-dry pot was soaking. Turns out capacitive sensors need calibrating against your actual soil. Noted, calibrated, tried again.",
      },
      {
        date: "May 15",
        title: "The pump worked. Too well.",
        tag: "setback",
        body: "A loop that watered whenever the soil read dry, checked every thirty seconds, emptied the reservoir into one pot overnight. We lost the basil. A genuinely sad morning.",
      },
      {
        date: "May 18",
        title: "Slowing everything down",
        tag: "note",
        body: "Rewrote the logic: average moisture over three hours, water at most once a day, never more than 40ml. A plant is slow. The code should be slower.",
      },
      {
        date: "May 24",
        title: "Three weeks, unattended",
        tag: "note",
        body: "Left it running over a trip. Came back to two healthy plants and a spreadsheet of moisture curves that are, honestly, lovely to look at.",
      },
      {
        date: "June 4",
        title: "Pausing on purpose",
        tag: "paused",
        body: "We set out to learn hardware, not to run a nursery. We know how now. Rig documented and shelved — easy to bring back if a project needs it.",
      },
    ],
    notes: [
      "The lesson wasn't electrical, it was temporal. Everything we got wrong came from a script reacting faster than a plant can change. The fix was almost always to wait longer before doing anything.",
      "We're calling this paused rather than finished, and paused rather than failed. It did what a CodeVault trial is supposed to do: it taught us a field we didn't have, and it left something real on a shelf.",
      'For the record: the basil is memorialized in the commit history. Commit a9f21c3, "stop drowning things."',
    ],
  },
  {
    slug: "git-story",
    style: "readme",
    name: "git-story",
    accent: "story",
    summary:
      "A command-line tool that reads your git log and tells it back to you as a readable narrative instead of a wall of hashes.",
    status: "In progress",
    field: "Developer tooling",
    facts: [
      { label: "Status", value: "In progress" },
      { label: "Field", value: "Developer tooling" },
      { label: "Started", value: "May 28, 2026" },
      { label: "Latest", value: "v0.4.1" },
      { label: "Language", value: "TypeScript" },
      { label: "License", value: "MIT" },
    ],
    stack: ["TypeScript", "Node 20", "simple-git", "Commander"],
    links: [
      {
        label: "github.com/codevault/git-story",
        href: "/projects/git-story",
        kind: "repo",
      },
      {
        label: "Read the design notes",
        href: "/projects/git-story",
        kind: "writeup",
      },
    ],
    loop: [
      {
        phase: "Trial",
        body: "Our commit history read like a stack trace. We wanted to skim a repo's month the way you'd skim a changelog, so we wrote a quick script that grouped commits into a plain-English summary.",
      },
      {
        phase: "Experience",
        body: "The naive version summarised every commit equally, which meant a typo fix got the same weight as a rewrite. Reading it was as tedious as reading the raw log — just longer.",
      },
      {
        phase: "Adjustment",
        body: "We started scoring commits by how much they actually changed, folding the trivial ones into the ones that mattered. The output got shorter and, for the first time, worth reading.",
      },
      {
        phase: "Result",
        body: "A small CLI that turns `git log` into a narrative you can hand to someone. It's on npm at v0.4.1, still moving, still MIT. Not finished — but useful enough that we use it on our own repos.",
      },
    ],
    log: [
      {
        date: "2026-05-28",
        title: "v0.1 — the naive summary",
        tag: "trial",
        body: "One paragraph per commit. Technically a narrative, practically a wall. Shipped it anyway to react to it.",
      },
      {
        date: "2026-06-03",
        title: "v0.2 — weighting commits",
        tag: "note",
        body: "Score each commit by diff size and touched surface. Fold trivial commits into their neighbours. First output we actually enjoyed reading.",
      },
      {
        date: "2026-06-19",
        title: "v0.3 — grouping by theme",
        tag: "note",
        body: "Cluster related commits into themes across a range, so a week of work reads as two or three threads rather than forty lines.",
      },
      {
        date: "2026-07-10",
        title: "v0.4.1 — ranges and fixes",
        tag: "shipped",
        body: "Arbitrary revision ranges, a --since flag, and a fix for repos with no tags. Current release.",
      },
    ],
    notes: [
      "The interesting problem was never parsing git — it was deciding what to leave out. A good summary is mostly omission, and teaching a tool to omit well is harder than teaching it to read.",
      "It's marked in progress on purpose. There's an obvious next step — grouping by intent rather than by file — and we'd rather ship it honest and unfinished than pretend v0.4 is the end.",
    ],
  },
]

// Typed slug → route path, so router `Link`s stay type-safe against the
// generated route tree instead of passing a widened string.
export const projectPaths = {
  orbit: "/projects/orbit",
  "plant-pi": "/projects/plant-pi",
  "git-story": "/projects/git-story",
} as const

export type ProjectSlug = keyof typeof projectPaths

export function projectPath(slug: string) {
  return projectPaths[slug as ProjectSlug]
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

// The next project in the list, wrapping around — for the "next project"
// pointer at the foot of each detail page.
export function nextProject(slug: string): Project {
  const i = projects.findIndex((p) => p.slug === slug)
  return projects[(i + 1) % projects.length]
}
