// Structured content for the mock Project pages. Content lives in config (see
// docs/code-rules.md); the detail views render this same model in deliberately
// different styles. User-facing strings belong here — page components own only
// structure and presentation.
//
// Seamark and TeX carry more material than this model holds (detectors,
// pipeline stages, a worked case; build steps, diagnostics, a benchmark
// corpus); that lives alongside it in `seamark.ts` and `tex.ts`.

export type ProjectStatus = "Shipped" | "In progress" | "Paused"

// Which detail treatment renders this project.
export type ProjectStyle =
  "dossier" | "journal" | "readme" | "chart" | "specimen"

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

// Where a project ends up once it leaves here — the channel it's out in the
// world through, plus a point on the hero globe to hang it off.
//
// `lon`/`lat` are placement, not a claim: we don't know where a project's users
// are, and the label deliberately says how it's reachable rather than naming a
// place. Omit `reach` and the project simply gets no node on the globe.
export type Reach = {
  label: string
  lon: number
  lat: number
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
  // Optional node on the hero globe. See `Reach`.
  reach?: Reach
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
    reach: { label: "In the browser", lon: -122.42, lat: 37.77 },
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
    reach: { label: "On a shelf, on GitHub", lon: 151.21, lat: -33.87 },
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
    reach: { label: "On npm", lon: 77.59, lat: 12.97 },
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
  {
    slug: "seamark",
    style: "chart",
    name: "Seamark",
    accent: "sense",
    summary:
      "Reading a month of public AIS traffic across the North Sea and Skagerrak to find the few tracks that stop making sense near a shipping lane or a seabed cable — and putting them in front of a person.",
    status: "In progress",
    field: "Maritime domain awareness",
    reach: { label: "Watching the Skagerrak", lon: 9.5, lat: 58.2 },
    facts: [
      { label: "Designation", value: "SMK-01" },
      { label: "Status", value: "In progress" },
      { label: "Field", value: "Maritime domain awareness" },
      { label: "Trial began", value: "2026-06-24" },
      { label: "Area", value: "North Sea · Skagerrak" },
      { label: "Input", value: "Kystverket open AIS" },
      { label: "Messages / day", value: "3.8 M" },
      { label: "Tracks / day", value: "11,400" },
      { label: "Cases / day", value: "23" },
      { label: "Detectors", value: "6" },
      { label: "Crew", value: "3" },
      { label: "License", value: "MIT" },
    ],
    stack: [
      "TypeScript",
      "Rust (NMEA decoder)",
      "PostgreSQL + PostGIS",
      "DuckDB",
      "Kystverket open AIS",
    ],
    links: [
      {
        label: "github.com/codevault/seamark",
        href: "/projects/seamark",
        kind: "repo",
      },
      {
        label: "Detector notes and confounders",
        href: "/projects/seamark",
        kind: "writeup",
      },
    ],
    loop: [
      {
        phase: "Trial",
        body: "AIS is public, high-volume and famously unreliable, which made it the kind of dataset we wanted to sit with. The trial was narrow on purpose: one month of Norwegian coastal traffic, one question — can a machine pick out the handful of tracks a person should look at near a cable corridor?",
      },
      {
        phase: "Experience",
        body: "The first version found hundreds of anomalies a day, and it was right about almost none of them. Nearly every transmission gap was a receiver we could not hear from, and nearly every loitering vessel was fishing. An alert list nobody can finish is the same as no alert list.",
      },
      {
        phase: "Adjustment",
        body: "So we stopped tuning detectors and started modelling the absence of data — a per-cell reception model, so a gap is scored against how likely we were to have heard anything there at all. Then we capped the queue at what one person can actually read in a shift, and made every case explain itself in under two minutes.",
      },
      {
        phase: "Result",
        body: "Twenty-three cases a day instead of hundreds, roughly six in ten of which an analyst thinks were worth surfacing. It is not a watch floor and it does not decide anything. It reads a very noisy broadcast, ranks what it cannot explain, and stops — which turned out to be the hard part.",
      },
    ],
    log: [
      {
        date: "2026-06-24",
        title: "First decode",
        tag: "trial",
        body: "Kystverket's feed into a Rust NMEA decoder and straight into Postgres. Four hours of traffic, and the first surprise: 8% of sentences are malformed, and the malformed rate varies by receiver in a way that turns out to be useful later.",
      },
      {
        date: "2026-06-28",
        title: "Everything is an anomaly",
        tag: "setback",
        body: "Naive gap and loitering rules over one day produced 640 alerts. We read a hundred of them by hand. Six were interesting. The rest were coverage holes and trawlers doing their jobs.",
      },
      {
        date: "2026-07-02",
        title: "Modelling what we cannot hear",
        tag: "note",
        body: "Built a reception model per grid cell from historical message density and receiver uptime, so a gap is scored against the probability of hearing anything there at all. Alerts fell by two thirds overnight and the ones left got better.",
      },
      {
        date: "2026-07-06",
        title: "Corridors, not coordinates",
        tag: "note",
        body: "Charted cable and pipeline corridors as PostGIS polygons. Behaviour only gets scored where it means something — the same slow circle is unremarkable offshore and worth a look over SK-2.",
      },
      {
        date: "2026-07-09",
        title: "The queue gets a ceiling",
        tag: "note",
        body: "Cut the queue to 25 cases per shift, ranked. Not a confidence threshold — a stated capacity. A list longer than the person reading it is a list with an invisible cutoff instead of an honest one.",
      },
      {
        date: "2026-07-14",
        title: "SMK-2026-0714-018",
        tag: "note",
        body: "The first case where three detectors fired independently on one track over a cable corridor. Still the case we use to explain what the whole thing is for.",
      },
      {
        date: "2026-07-17",
        title: "Two analysts, sixty cases, blind",
        tag: "note",
        body: "Agreement of 0.71. Where they disagreed was almost entirely rendezvous and route deviation — which is a fair description of the two detectors we trust least.",
      },
    ],
    notes: [
      "The useful work was not detection. It was modelling the shape of our own ignorance: which cells we can hear, when, and how confidently. Once a gap was scored against the odds of hearing anything at all, most of the noise stopped being noise and started being coverage — which is a thing you can state plainly instead of alerting on.",
      "We kept a person in the middle because the last step is a judgement about context, and the system does not have the context. It knows a vessel slowed and went quiet over a cable. It does not know the sea state that hour, or that this operator always bunkers here. Handing that call to a threshold would produce answers, and we would have no way of knowing they were wrong.",
      "It stays in progress. There is an obvious next input — SAR imagery, to see the vessels that never transmit at all — and until that exists, the honest description of this project is a system that is good at noticing when the one sensor it has has stopped telling it anything.",
    ],
  },
  {
    slug: "tex",
    style: "specimen",
    name: "TeX",
    accent: "readable",
    summary:
      "An editor for LaTeX that parses the document instead of matching text, rebuilds only what a save could have changed, and says what went wrong in a sentence rather than a transcript.",
    status: "In progress",
    field: "Authoring & typesetting tools",
    reach: { label: "Wherever a deadline is", lon: 8.54, lat: 47.37 },
    facts: [
      { label: "Designation", value: "TEX-01" },
      { label: "Status", value: "In progress" },
      { label: "Field", value: "Authoring & typesetting tools" },
      { label: "Trial began", value: "2026-03-02" },
      { label: "Latest", value: "v0.5.0" },
      { label: "Engines driven", value: "4" },
      { label: "Cold → save", value: "41.2 s → 0.91 s" },
      { label: "Diagnostic rules", value: "191" },
      { label: "Benchmark corpus", value: "12 documents" },
      { label: "Platforms", value: "macOS · Linux" },
      { label: "Crew", value: "3" },
      { label: "License", value: "MIT" },
    ],
    stack: [
      "Rust (build daemon)",
      "TypeScript",
      "Tauri 2",
      "CodeMirror 6",
      "tree-sitter-latex",
      "MuPDF",
      "TeX Live 2025 · Tectonic",
    ],
    links: [
      {
        label: "github.com/lukasolsen/TeX",
        href: "https://github.com/lukasolsen/TeX",
        kind: "repo",
      },
      {
        label: "Build pipeline notes",
        href: "/projects/tex",
        kind: "writeup",
      },
    ],
    loop: [
      {
        phase: "Trial",
        body: "One of us was writing a thesis and losing whole afternoons to a compile-and-scroll loop, so we built the smallest thing that could be wrong: a text pane, a PDF pane, and a shell-out to pdfTeX. It took forty-one seconds to tell us what we already knew.",
      },
      {
        phase: "Experience",
        body: "Speed turned out not to be one problem. Some of it was the engine, some of it was rebuilding forty-one unchanged figures every time, and a surprising amount of it was the twenty seconds a person spends finding the real error in a log. Fixing only the first would have left the loop roughly as long.",
      },
      {
        phase: "Adjustment",
        body: "So we stopped optimising the compile and started modelling the document — a parse on every keystroke, a content-addressed build graph, and a translation layer over the log. The cache we shipped first keyed on timestamps, served a stale PDF, and had to be thrown away; the replacement hashes every input including the engine binary.",
      },
      {
        phase: "Result",
        body: "A save on a 182-page thesis now shows the corrected page in under a second, and the problem list has two lines in it instead of two thousand nine hundred. It is v0.5.0, it is honest about what it does not do, and it is the tool we write in.",
      },
    ],
    log: [
      {
        date: "2026-03-02",
        title: "A text pane and a PDF pane",
        tag: "trial",
        body: "CodeMirror, a shell-out to pdfTeX, and a viewer that reloaded the whole file. 41 seconds per save on the thesis. Useful only as a thing to be annoyed by, which was the point.",
      },
      {
        date: "2026-03-11",
        title: "Regex was never going to work",
        tag: "setback",
        body: "Three weeks of features built on pattern matching, and every one of them was wrong inside a \\newcommand. Threw out the lot and put tree-sitter underneath. Everything since depends on that week.",
      },
      {
        date: "2026-03-24",
        title: "The cache served a stale PDF",
        tag: "setback",
        body: "Keyed on modification time. A file restored from git kept its old mtime, the build was skipped, and someone read a page that no longer existed in the source. Worst bug of the project — a wrong answer delivered fast.",
      },
      {
        date: "2026-04-06",
        title: "Content-addressed builds",
        tag: "note",
        body: "Rewrote the cache to hash every input: sources, class files, images, fonts, the engine binary, the flags. Slower to key, impossible to fool. No stale output since.",
      },
      {
        date: "2026-04-19",
        title: "Reading the log so you don't have to",
        tag: "note",
        body: "First forty diagnostic rules, written by pasting a year of our own build logs into a file and translating them by hand. Tedious, unglamorous, and the change people noticed most.",
      },
      {
        date: "2026-05-02",
        title: "Knowing when to stop",
        tag: "note",
        body: "Hash the .aux files after each pass and rerun only when they moved. Four in five builds settle in two passes; we had been running three unconditionally, like everyone else.",
      },
      {
        date: "2026-05-20",
        title: "Under a second on the thesis",
        tag: "note",
        body: "Standalone figures cached separately, one page re-rastered instead of the document. 912 ms from ⌘S to the corrected page. The loop stopped being something you leave the desk for.",
      },
      {
        date: "2026-06-14",
        title: "Both directions",
        tag: "note",
        body: "SyncTeX wired properly: click the page to move the caret, move the caret to move the page. It had been half-working for a month and half-working was worse than not.",
      },
      {
        date: "2026-07-08",
        title: "v0.5.0",
        tag: "shipped",
        body: "First build we handed to people outside the project. macOS and Linux, MIT, no installer worth the name yet. Twelve documents in the benchmark corpus and a list of what it can't do that we mean.",
      },
    ],
    notes: [
      "The interesting work was not making the compiler faster — we never touched it, and could not have. It was working out how much of a build is not the compiler: unchanged figures, unnecessary passes, and the twenty seconds a person spends reading a transcript that was addressed to a printer in 1978.",
      "The stale-PDF bug is the one we tell people about. A slow tool wastes your afternoon; a tool that is confidently wrong wastes your afternoon and then costs you the trust you need to use it at all. Everything about the current cache — hashing the engine binary, pinning the distribution, refusing to run without the sandbox — is a reaction to one bad Tuesday in March.",
      "It stays in progress. The obvious next thing is a language server, so the model that already knows where every label lives can be used by editors that are not this one. Until then the honest description is a good editor for people who already know LaTeX, which is a smaller claim than we would like and the only one we can currently make.",
    ],
  },
]

// Where the work is made. The one point on the hero globe that isn't a
// placement choice.
export const home = {
  label: "Made here",
  place: "Norway",
  lon: 10.75,
  lat: 59.91,
} as const

// Projects that have declared a `reach`, in config order.
export function reachingProjects(): (Project & { reach: Reach })[] {
  return projects.filter((p): p is Project & { reach: Reach } => !!p.reach)
}

// Typed slug → route path, so router `Link`s stay type-safe against the
// generated route tree instead of passing a widened string.
export const projectPaths = {
  orbit: "/projects/orbit",
  "plant-pi": "/projects/plant-pi",
  "git-story": "/projects/git-story",
  seamark: "/projects/seamark",
  tex: "/projects/tex",
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
