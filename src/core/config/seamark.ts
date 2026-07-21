// Content for the Seamark project page. Seamark is a chart-style page: it goes
// deeper than the other three project views, so its material lives here rather
// than being stretched into the shared `Project` model in projects.ts.
//
// Everything below is the project's own record — what it ingests, what it
// looks for, what it hands a person, and what it refuses to claim. Page
// components own structure and presentation only.

export type Detector = {
  // Short code the case view and the queue both use.
  code: string
  name: string
  // What the rule is actually watching for, in one sentence.
  watches: string
  // The signals it reads. Kept short — these become mono chips.
  inputs: string[]
  // The honest failure mode. Every detector has one; saying it is the point.
  confounder: string
  // Share of surfaced cases this detector contributed to, 0–1. Used for the
  // bar length in the detector rail, so keep these summing near 1.
  share: number
}

export type PipelineStage = {
  code: string
  name: string
  body: string
  // Volume at this stage, per day. `value` is display text; `weight` (0–1)
  // drives the bar and is log-ish, not linear — raw counts span six orders of
  // magnitude and a linear funnel would render five invisible bars.
  value: string
  weight: number
}

export type CaseStep = {
  time: string
  label: string
  detail: string
  // Marks the moment the track stops reporting, styled apart from the rest.
  gap?: boolean
}

export type QueueRow = {
  id: string
  // Vessel type + flag, not a name: the queue deliberately shows as little
  // identifying detail as it can before a human opens the case.
  vessel: string
  detectors: string[]
  score: number
  age: string
  state: "Open" | "Watching" | "Escalated" | "Dismissed"
}

export type Verdict = {
  name: string
  key: string
  body: string
  // What the verdict does to the system, not just to the case.
  effect: string
}

export type Metric = {
  label: string
  value: string
  note: string
}

// A bare label/value pair for the figure strips, where the number needs no
// caveat attached to it.
export type Figure = {
  label: string
  value: string
}

export type Entry = {
  term: string
  body: string
}

export type Reference = {
  label: string
  detail: string
}

// The expansion, kept in one place because it appears in the hero, the meta
// description and the glossary.
export const expansion =
  "System for Evaluating Anomalous Maritime Activity near Routes and Key infrastructure"

// The name, taken apart. Sits in the appendix rather than the hero: it is a
// footnote about the name, not the point of the page.
export const acronym: Entry[] = [
  { term: "S", body: "System for" },
  { term: "E", body: "Evaluating" },
  { term: "A", body: "Anomalous" },
  { term: "M", body: "Maritime" },
  { term: "A", body: "Activity near" },
  { term: "R", body: "Routes and" },
  { term: "K", body: "Key infrastructure" },
]

export const lede =
  "Ships broadcast where they are, roughly, most of the time. Seamark reads that broadcast across the North Sea and Skagerrak, notices the handful of tracks that stop making sense near a shipping lane or a seabed cable, and puts them in front of a person."

// The sheet's panels, in order. Titles live here so the contents band and the
// section headers cannot drift apart; `bearing` is the mono label held at the
// right margin of each header — chart furniture, and occasionally the one
// figure that section is about.
export const sheet = [
  { index: "01", title: "The signal", bearing: "ITU-R M.1371" },
  { index: "02", title: "The area", bearing: "31 corridors" },
  { index: "03", title: "A day of traffic", bearing: "3.8 M → 23" },
  { index: "04", title: "The detectors", bearing: "6 rules" },
  { index: "05", title: "One case, end to end", bearing: "SMK-…-0714-018" },
  { index: "06", title: "What reaches the analyst", bearing: "capacity 25" },
  { index: "07", title: "Why a person is in the middle", bearing: "the loop" },
  { index: "08", title: "How we check it", bearing: "no ground truth" },
  { index: "09", title: "What it does not do", bearing: "scope" },
  { index: "10", title: "Trial, experience, adjustment, result", bearing: "" },
  { index: "11", title: "Working log", bearing: "24 Jun – 17 Jul" },
  { index: "12", title: "Standing back", bearing: "notes" },
] as const

export type Panel = (typeof sheet)[number]

export function panel(index: Panel["index"]): Panel {
  return sheet.find((s) => s.index === index)!
}

// Section 01 — what the underlying signal actually is, and isn't.
export const signal = {
  body: "AIS was designed in the 1990s so ships could see each other in fog. It is a VHF broadcast, unencrypted and unauthenticated: a transponder announces an identity, a position, a speed and a course, every few seconds while under way. Coastal receivers hear it out to roughly 40 nautical miles; satellites pick up the rest, later and with gaps. Nothing in the protocol checks whether any of it is true.",
  properties: [
    {
      term: "Self-reported",
      body: "The position comes from the vessel's own GNSS receiver and is transmitted on the vessel's own authority. There is no second source in the message.",
    },
    {
      term: "Unauthenticated",
      body: "Nothing signs an AIS message. An identity can be borrowed, a position can be fabricated, and a receiver has no protocol-level way to tell.",
    },
    {
      term: "Interruptible",
      body: "The transponder has a switch. Turning it off is sometimes a safety decision, sometimes an operational one, and occasionally the interesting thing.",
    },
    {
      term: "Unevenly heard",
      body: "Coverage is a function of receiver geometry, VHF propagation and satellite revisit. Silence in the data is not the same as silence on the water.",
    },
  ],
}

// Section 02 — where the system looks, and why place is what makes a
// behaviour worth scoring at all.
export const area = {
  body: "Seamark does not watch the sea; it watches a set of drawn shapes on it. Slowing to two knots and turning in circles is unremarkable in open water and worth a look directly over a power cable, and the only difference between those two readings is a polygon. Every corridor below is charted from public sources and held as PostGIS geometry, which means the question a detector asks is never “is this odd?” but “is this odd here?”",
  reception:
    "The second map matters more, and nobody publishes it. Whether a message is heard depends on receiver geometry, VHF propagation and satellite revisit, so the project builds its own reception model: a per-cell estimate, from historical message density and receiver uptime, of the odds of hearing anything at all. Without it, every coverage hole in the North Sea looks exactly like a vessel choosing to go quiet.",
  figures: [
    { label: "Area covered", value: "≈ 148,000 km²" },
    { label: "Corridors charted", value: "31" },
    { label: "Coastal receivers heard", value: "64" },
    { label: "Satellite passes / day", value: "9" },
    { label: "Reception cells modelled", value: "5,900" },
    { label: "Cadence", value: "Batch, 10 min" },
  ] satisfies Figure[],
  kinds: [
    {
      term: "Cable and pipeline corridors",
      body: "Charted seabed infrastructure with a margin around it. The corridors are the reason this project exists, and the only place anchoring is scored as anything other than ordinary.",
    },
    {
      term: "Traffic separation schemes",
      body: "Lanes with a direction. Behaviour inside them is tightly patterned, which makes deviation cheap to detect and, unhelpfully, cheap to detect wrongly during weather.",
    },
    {
      term: "Designated anchorages",
      body: "Where stopping is the expected thing. Mostly used in the negative — as the reason a case never gets raised.",
    },
    {
      term: "Port approaches",
      body: "Dense, slow and full of vessels holding for a berth. The highest false-fire ground on the map, and scored down accordingly.",
    },
  ] satisfies Entry[],
}

// Section 03 — the rules. Ordered by contribution to the queue.
export const detectors: Detector[] = [
  {
    code: "GAP",
    name: "Transmission gap",
    watches:
      "A track that stops reporting for longer than its own recent cadence explains, then reappears somewhere the gap can account for.",
    inputs: ["Msg 1/2/3", "Receiver health", "Satellite revisit"],
    confounder:
      "Most gaps are coverage, not intent. The detector is only usable because it scores against a per-cell reception model — and that model is worst exactly where traffic is thinnest.",
    share: 0.31,
  },
  {
    code: "LOIT",
    name: "Loitering in a corridor",
    watches:
      "Sustained low speed, repeated heading reversals, or a closed track inside a cable or pipeline corridor where transit is the norm.",
    inputs: ["SOG", "COG variance", "Corridor polygons"],
    confounder:
      "Fishing does this on purpose. So does weather-holding, and so does a vessel waiting on a berth. Gear type from static messages removes some of it and not all of it.",
    share: 0.24,
  },
  {
    code: "ANCH",
    name: "Anchoring over infrastructure",
    watches:
      "A vessel settling into an anchored motion signature over a charted cable or pipeline corridor, outside a designated anchorage.",
    inputs: ["Nav status", "Drift radius", "Corridor polygons"],
    confounder:
      "Navigational status is hand-set by the crew and is wrong often enough that the detector infers anchoring from motion instead, which drags in vessels merely drifting.",
    share: 0.16,
  },
  {
    code: "KINE",
    name: "Implausible kinematics",
    watches:
      "Position jumps, speeds a hull of that class cannot make, or two positions for one identity within a window that physics does not allow.",
    inputs: ["Position delta", "MMSI", "Vessel class"],
    confounder:
      "GNSS multipath near port structures produces beautiful, entirely innocent teleportation. Duplicate identities are more often a misconfigured transponder than a spoofed one.",
    share: 0.13,
  },
  {
    code: "RDVZ",
    name: "Rendezvous",
    watches:
      "Two tracks converging to within a few hundred metres at low speed offshore, held long enough to be a meeting rather than a passing.",
    inputs: ["Pairwise range", "SOG", "Duration"],
    confounder:
      "Bunkering, pilot transfers and crew changes look identical from a transponder's point of view. Without a second sensor this detector cannot separate them.",
    share: 0.1,
  },
  {
    code: "DEVI",
    name: "Route deviation",
    watches:
      "A departure from the traffic pattern learned for that corridor, class and season, that the vessel's declared destination does not explain.",
    inputs: ["Route model", "Msg 5 destination", "Season"],
    confounder:
      "The route model is learned from history, so it treats anything genuinely new — a rerouting, a fresh service, bad weather — as deviation. It is the detector we trust least.",
    share: 0.06,
  },
]

// Section 04 — what happens to a day of traffic on the way to a person.
export const pipeline: PipelineStage[] = [
  {
    code: "01",
    name: "Ingest",
    body: "Kystverket's open AIS feed and a satellite AIS sample, decoded from NMEA into typed position and static reports. Nothing is dropped at this stage; malformed sentences are kept and counted, because the malformed rate is itself a signal about a receiver.",
    value: "3.8 M messages",
    weight: 1,
  },
  {
    code: "02",
    name: "Assemble tracks",
    body: "Messages are grouped by identity into tracks, split when a gap is long enough that continuity is an assumption rather than an observation. A split is recorded, not hidden — the seam is what the gap detector reads later.",
    value: "11,400 tracks",
    weight: 0.72,
  },
  {
    code: "03",
    name: "Contextualise",
    body: "Each track is placed against the things that make its behaviour ordinary or not: corridor and anchorage polygons, the learned route model for its class, the reception model for the cells it crossed, and the weather that hour.",
    value: "11,400 tracks",
    weight: 0.58,
  },
  {
    code: "04",
    name: "Detect",
    body: "Six rules run independently over each contextualised track. Every fire is stored with the evidence that produced it, so a case can always be taken apart afterwards.",
    value: "1,960 fires",
    weight: 0.42,
  },
  {
    code: "05",
    name: "Correlate",
    body: "Fires on the same track and time window are merged into one candidate event. Corroboration across independent detectors raises the score more than any single detector can on its own.",
    value: "340 candidates",
    weight: 0.28,
  },
  {
    code: "06",
    name: "Queue",
    body: "Candidates are ranked and cut to the number of cases a shift can genuinely look at. The cut is a stated capacity, not a confidence threshold — a queue longer than the analyst is a queue nobody reads to the end.",
    value: "23 cases",
    weight: 0.14,
  },
]

// Section 05 — the worked case the page walks through. Real shape, invented
// vessel: a bulk carrier crossing a cable corridor in the Skagerrak.
export const workedCase = {
  id: "SMK-2026-0714-018",
  vessel: "Bulk carrier, 189 m",
  area: "Skagerrak — cable corridor SK-2",
  score: 0.81,
  steps: [
    {
      time: "11:52",
      label: "Under way, nothing unusual",
      detail:
        "Steady 11.4 kn on 214°, reporting every 6 seconds, inside the ordinary traffic pattern for this corridor and class.",
    },
    {
      time: "12:07",
      label: "Speed falls",
      detail:
        "Down to 3.1 kn over four minutes with no course change. Sea state that hour does not account for it.",
    },
    {
      time: "12:19",
      label: "Last position report",
      detail:
        "Final message received 2.4 nm inside the cable corridor. Receiver serving that cell reports healthy the whole time.",
      gap: true,
    },
    {
      time: "12:19 – 13:00",
      label: "41 minutes of silence",
      detail:
        "No coastal reception, no satellite pass. The reception model puts the probability of a coverage-caused gap here at 0.07.",
      gap: true,
    },
    {
      time: "13:00",
      label: "Reappears",
      detail:
        "Same identity, 1.9 nm from the last known position, on a reciprocal heading at 2.8 kn. Implied average speed is consistent with the vessel having stayed in the area.",
    },
    {
      time: "13:00",
      label: "Case opened",
      detail:
        "GAP, LOIT and ANCH fire on one track inside one window. Correlated score 0.81, top of the queue for that shift.",
    },
  ] satisfies CaseStep[],
}

// Section 06 — the queue as an analyst finds it at the start of a shift.
export const queue: QueueRow[] = [
  {
    id: "SMK-2026-0714-018",
    vessel: "Bulk carrier · 189 m",
    detectors: ["GAP", "LOIT", "ANCH"],
    score: 0.81,
    age: "12 min",
    state: "Open",
  },
  {
    id: "SMK-2026-0714-017",
    vessel: "Product tanker · 144 m",
    detectors: ["RDVZ", "GAP"],
    score: 0.74,
    age: "1 h 40",
    state: "Watching",
  },
  {
    id: "SMK-2026-0714-011",
    vessel: "General cargo · 96 m",
    detectors: ["KINE"],
    score: 0.66,
    age: "3 h 05",
    state: "Open",
  },
  {
    id: "SMK-2026-0714-009",
    vessel: "Trawler · 38 m",
    detectors: ["LOIT"],
    score: 0.52,
    age: "4 h 22",
    state: "Dismissed",
  },
  {
    id: "SMK-2026-0713-044",
    vessel: "Offshore supply · 81 m",
    detectors: ["ANCH", "DEVI"],
    score: 0.49,
    age: "19 h",
    state: "Escalated",
  },
]

export const verdicts: Verdict[] = [
  {
    name: "Dismiss",
    key: "D",
    body: "The behaviour has an ordinary explanation the system could not see — a fishing pattern, a known bunkering point, a receiver that was down.",
    effect:
      "Stored with the reason. Dismissals are the only labelled negatives the project has, and they are worth more than the escalations.",
  },
  {
    name: "Watch",
    key: "W",
    body: "Not explained, not yet worth anyone's attention. The track stays under a standing query for 72 hours at a lowered threshold.",
    effect:
      "Re-surfaces automatically if it fires again. Most watches expire quietly, which is the correct outcome.",
  },
  {
    name: "Escalate",
    key: "E",
    body: "Worth a human decision beyond this desk — a request for another sensor, or a note to whoever owns the infrastructure underneath.",
    effect:
      "Leaves Seamark entirely. The project's job ends at a written case; what happens next is not ours to automate.",
  },
]

export const humanInTheLoop = [
  "Every detector here is a statement about what is unusual, and unusual is not the same as wrong. A trawler working a seabed and a vessel dragging an anchor across a cable produce a similar signature; the difference is context a rule does not hold. So the system is built to stop short — it ranks, it explains, and it hands over.",
  "That constraint shaped the interface more than the detectors did. A case has to be readable in under two minutes, because a queue that takes longer than that per case does not get read. Every number an analyst sees is traceable back to the messages that produced it, and every verdict requires a reason before it can be filed.",
  "Verdicts feed back as labels, and nowhere else. Nothing retrains on its own. Thresholds move when we sit down and move them, with the dismissals in front of us — automating that loop would let the system quietly learn to stop showing us the things we found boring, which is precisely the failure we would not notice.",
]

// Section 08 — how the project checks itself, with the caveat stated first.
export const evaluation = {
  caveat:
    "There is no ground truth here. Nobody publishes a list of what every vessel in the Skagerrak was actually doing on a given afternoon, so “correct” in the numbers below means an analyst, reading the full case, agreed it was worth surfacing. That is a measure of usefulness, not of truth, and it is the honest ceiling on everything this project can claim.",
  metrics: [
    {
      label: "Kept at queue depth 25",
      value: "0.62",
      note: "Share of a shift's queue an analyst did not dismiss. Was 0.28 before correlation scoring.",
    },
    {
      label: "Median time to first look",
      value: "14 min",
      note: "From last message received to a case being opened by a person.",
    },
    {
      label: "Median time on a case",
      value: "1 min 50",
      note: "Open to filed verdict. The two-minute target is the whole design constraint.",
    },
    {
      label: "Analyst agreement",
      value: "0.71",
      note: "Two analysts, same 60 cases, blind. Where they disagree is where the detectors are weakest.",
    },
    {
      label: "Backtest recall",
      value: "4 of 6",
      note: "Publicly documented cable and pipeline incidents in the area, replayed. Two were invisible in AIS at all.",
    },
    {
      label: "Detector agreement",
      value: "0.34",
      note: "Share of cases where two or more detectors fire independently. Low, and the reason correlation is worth so much.",
    },
  ] satisfies Metric[],
}

// Section 09 — what the project is not. Load-bearing, not a disclaimer.
export const limits = [
  {
    term: "It does not establish intent",
    body: "A score says a track is unusual for its context. It says nothing about why, and the interface is deliberately built so that no field invites a guess.",
  },
  {
    term: "It is not evidence",
    body: "Decoded broadcast data with a rules engine over it is a reason to look, not a finding. Anything that leaves as an escalation leaves as a question.",
  },
  {
    term: "It sees one sensor",
    body: "AIS only. No radar, no SAR, no optical. The vessel that never transmits is, to this system, not there at all — and that is the failure mode that matters most.",
  },
  {
    term: "It is not a watch floor",
    body: "It runs in batches over a defined area during hours we are awake. Continuous coverage is a staffing problem, not a software one, and we are three people.",
  },
  {
    term: "It does not identify people",
    body: "Vessel identity is as far as it goes. Crew, ownership and cargo are outside the data and outside the scope, on purpose.",
  },
]

export const glossary: Entry[] = [
  {
    term: "AIS",
    body: "Automatic Identification System. Mandatory VHF broadcast for most vessels over 300 gross tonnage on international voyages, under SOLAS Chapter V.",
  },
  {
    term: "MMSI",
    body: "Maritime Mobile Service Identity. The nine-digit number an AIS transponder broadcasts as its identity. Assigned, not verified.",
  },
  {
    term: "SOG / COG",
    body: "Speed and course over ground — motion relative to the seabed rather than the water, which is what a receiver can actually observe.",
  },
  {
    term: "Message 1/2/3",
    body: "The position reports. Sent every 2 to 10 seconds under way, every 3 minutes at anchor.",
  },
  {
    term: "Message 5",
    body: "The static and voyage report: vessel name, dimensions, draught, destination and ETA. Typed in by the crew, and wrong about as often as you would expect.",
  },
  {
    term: "Corridor",
    body: "In this project, a polygon around a charted cable, pipeline or traffic separation scheme. Corridors are what makes a behaviour worth scoring.",
  },
  {
    term: "Dark",
    body: "Not transmitting AIS. Widely used and slightly misleading — most dark time is a receiver problem, not a vessel decision.",
  },
]

export const references: Reference[] = [
  {
    label: "IMO SOLAS Chapter V, Regulation 19",
    detail: "The carriage requirement that makes AIS near-universal.",
  },
  {
    label: "ITU-R M.1371",
    detail: "The AIS message specification. Every decoder here follows it.",
  },
  {
    label: "Kystverket open AIS",
    detail:
      "The Norwegian Coastal Administration's public feed. The project's main input.",
  },
  {
    label: "IALA G1082",
    detail:
      "Guideline on AIS data quality and its limits, which reads like a list of this project's confounders.",
  },
]
