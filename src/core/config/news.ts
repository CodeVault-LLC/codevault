// News posts. Newest first is applied by `allPosts()`, not by the order here.
//
// Everything in these posts should be true of the work on the date given.
// CodeVault Electrical's source of truth is its own repository (the changelog,
// the plan and the decision records); when in doubt, say less. It is meant to
// be sold, so posts describe what it does for the people using it, not how
// it's built: no languages, frameworks or vendors beyond Revit itself. How it
// thinks (the search, the checks, the trade-offs) is fair game, and usually
// the most interesting part.

import { electrical } from "./electrical"

export const categories = [
  "Announcements",
  "Electrical",
  "Engineering",
] as const

export type Category = (typeof categories)[number]

/** Which illustration a post uses. See `components/news/post-art.tsx`. */
export type ArtKey =
  | "electrical"
  | "ab"
  | "clearance"
  | "openings"
  | "fittings"
  | "ribbon"
  | "box"
  | "tray"

/** Background swatch behind the illustration. */
export type Tone = "persimmon" | "oat" | "sky" | "olive" | "cactus" | "heather"

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "list"; items: string[] }
  | { type: "figure"; art: ArtKey; tone: Tone; caption: string }
  | { type: "cta"; text: string; label: string; href: string }

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
  /** Guides on the same problem, by slug. Listed after the post. */
  guides?: string[]
}

const posts: Post[] = [
  {
    slug: "down-to-the-tray",
    title: "Down to the tray",
    date: "2026-10-16",
    category: "Electrical",
    project: electrical.name,
    summary:
      "Drop to Tray plans conduit from a device to the nearest cable tray it can actually reach, for one device or fifty at once.",
    lead: "In most commercial ceilings, devices aren't wired to each other. Each one drops to the cable tray overhead, and modelling those drops is a large share of the conduit work on a project. CodeVault Electrical now plans them, with the same router and the same checks as every other route.",
    guides: ["revit-conduit-around-linked-models"],
    art: "tray",
    tone: "oat",
    body: [
      { type: "h2", id: "nearest", text: "Nearest is a route, not a distance" },
      {
        type: "p",
        text: "The tray straight above a device is often not the one to use. It may be boxed in by ductwork, too narrow for the conduit, or sloped. So Drop to Tray doesn't measure, it plans. It reads every tray within reach, in the model and in linked models, and orders them by the cheapest route that could possibly reach each one. Then it plans real routes in that order, and stops as soon as no remaining tray could beat the best drop it has found.",
      },
      {
        type: "p",
        text: "Each tray is searched on its own, with that tray as the destination and every other tray treated as solid. Searching all trays at once would be cheaper, but the search couldn't tell which tray it was entering, and could pass through one tray on its way to another. Pruning keeps it to one or two searches in practice, so the accuracy costs very little.",
      },
      {
        type: "p",
        text: "If a nearer tray wasn't used, the suggestion says why: it was blocked, it had no room for the conduit, or its route was more expensive than the one chosen.",
      },
      { type: "h2", id: "entries", text: "Where a drop can land" },
      {
        type: "p",
        text: "A tray offers entries on its bottom and on both sides, but only where the conduit fits. The side rail has to be at least as tall as the conduit and the bottom at least as wide, and every entry keeps clear of the tray's ends. A device directly under a tray rises straight into it. One that's blocked at that point can enter a little further along instead of failing.",
      },
      {
        type: "p",
        text: "Revit has no join between conduit and cable tray, so a drop stops at the tray's face, and the suggestion says so. The tray itself is never modified.",
      },
      {
        type: "figure",
        art: "tray",
        tone: "oat",
        caption:
          "Three drops into the bottom of the tray, one of them around the duct.",
      },
      { type: "h2", id: "batch", text: "Fifty at once" },
      {
        type: "p",
        text: "Select up to 50 devices and each gets its own drop. They are planned one after another under a single time budget, so every drop keeps clear of the ones before it. Before you see anything, the whole batch is checked together against the model's real geometry, including the space between the new drops. You review it once and accept it as one undo step.",
      },
      {
        type: "p",
        text: "If one device can't be reached, nothing is added, and the message names that device. That's deliberate. A batch that quietly skips three devices out of forty is a batch someone has to audit by hand.",
      },
      { type: "h2", id: "routes", text: "Whole routes" },
      {
        type: "p",
        text: "A new Routes panel works on routes CodeVault Electrical added. Select Routes picks up every piece of one. Remove Routes deletes it in one undo step and leaves the devices alone. Re-route plans it again between the same devices after the model has changed, and swaps it in.",
      },
    ],
  },
  {
    slug: electrical.announcementSlug,
    title: "Introducing CodeVault Electrical",
    date: "2026-10-13",
    category: "Announcements",
    project: electrical.name,
    summary:
      "A Revit add-in for electricians, starting with conduit routing. It's in development, and we're opening early access.",
    lead: "CodeVault Electrical is a Revit add-in for electricians and electrical designers. It starts with the slowest part of the electrical model, conduit. You pick the devices. It plans a route through the ceiling that keeps clear of what's in the way, checks it against the model's real geometry, and asks before keeping it.",
    guides: [
      "revit-conduit-device-without-connector",
      "deploy-revit-add-in-to-every-machine",
    ],
    art: "electrical",
    tone: "persimmon",
    body: [
      { type: "h2", id: "why", text: "Why conduit first" },
      {
        type: "p",
        text: "Revit gives you conduit, fittings and a place to put them. Finding the route is up to you, segment by segment, around ducts, beams and pipes that usually live in someone else's linked model. Electrical is often modelled after mechanical and plumbing, so conduit gets the space that's left. Every revision that moves a duct sends someone back to redraw the runs around it.",
      },
      {
        type: "p",
        text: "Underneath, this is a search problem with hard constraints. Runs are straight with right-angle bends. Every bend needs room for its elbow. Clearances must be kept, and the model keeps changing. That is work software should do well, and people shouldn't have to do by hand.",
      },
      { type: "h2", id: "routing", text: "How it routes" },
      {
        type: "p",
        text: "The router works in 3D, on a sparse grid built from the faces of everything it has to keep clear of. It searches for the cheapest right-angled path, where every bend and every metre of vertical travel has a cost. It never bends before there's room for the elbow. Routes come out short, level where they can be, and buildable as drawn.",
      },
      {
        type: "p",
        text: "Connect Devices plans a whole network together. Within one time limit it tries alternative layouts, routing orders and openings, and keeps the best complete network. Nothing is drawn unless every link is planned.",
      },
      { type: "h2", id: "workflow", text: "In Revit" },
      {
        type: "list",
        items: [
          "Route A→B: pick two devices, or a device and an open conduit end.",
          "Connect Devices: select several, and they're linked as a chain or as a tree.",
          "The route is drawn and highlighted first. Add it as one undo step, or cancel and the model is left as it was.",
          "Settings: what routes keep clear of and what they may pass through, clearance, conduit type and how runs are linked, in one window.",
        ],
      },
      {
        type: "figure",
        art: "ribbon",
        tone: "oat",
        caption:
          "One tab, two tools, and the route in the model before you accept it.",
      },
      { type: "h2", id: "model", text: "Works with the model you have" },
      {
        type: "list",
        items: [
          "Your families. Plenty of receptacle, switch and light families have no conduit connector at all. Routes still reach them, and any end that couldn't be joined is named so you can finish it.",
          "Your conduit. New runs continue the type of the conduit you picked and use sizes from the project's own list.",
          "Everyone else's models. Routes keep clear of what's in linked models too, checked against their real geometry before you see the suggestion.",
        ],
      },
      {
        type: "figure",
        art: "ab",
        tone: "sky",
        caption:
          "A box to the distribution board: around the duct, through one wall.",
      },
      { type: "h2", id: "firm", text: "Built for a firm, not just a desk" },
      {
        type: "list",
        items: [
          "Settings can be managed centrally. People see them, read-only, and an administrator can switch the add-in off for everyone.",
          "Installs per user or per machine, for Revit 2025 and 2026.",
          "If a linked model isn't loaded or a workset is closed, it stops and says so, rather than route against half a building.",
          "Every piece of conduit it adds is marked with the route it came from.",
          "Collect diagnostics puts logs and settings in one file for support, without reading or changing the model.",
        ],
      },
      { type: "h2", id: "next", text: "What comes next" },
      {
        type: "p",
        text: "Drops from devices to the nearest cable tray. After that, more electrical tools, each in its own panel on the same tab.",
      },
      { type: "h2", id: "early-access", text: "Early access" },
      {
        type: "cta",
        text: "We're working with a small group of electrical contractors and designers ahead of the first release. Partners get early builds, a direct line to the people building it, and a say in what comes next.",
        label: electrical.access.label,
        href: electrical.access.href,
      },
    ],
  },
  {
    slug: "what-a-route-promises",
    title: "What a route promises",
    date: "2026-10-12",
    category: "Engineering",
    project: electrical.name,
    summary:
      "How the router finds buildable routes through a full ceiling, and the three checks every route passes before you see it.",
    lead: "Conduit is often modelled last and moved first. By the time the electrical design is drawn, ducts, pipes and steel have the best space, and a clash found later is usually solved by bending conduit around it. A tool that draws those routes is only useful if you can trust what it draws. That trust starts with being exact about what a route promises.",
    guides: [
      "revit-conduit-around-linked-models",
      "revit-conduit-not-enough-room-for-fittings",
    ],
    art: "clearance",
    tone: "sky",
    body: [
      { type: "h2", id: "hard", text: "Harder than it looks" },
      {
        type: "p",
        text: "On a plan, a run between two boxes is a line. In the model it's a path through a ceiling that is already full, and the constraints pull against each other.",
      },
      {
        type: "list",
        items: [
          "Most of what's in the way isn't yours. Structure, ventilation, plumbing and sprinklers sit in linked models that other people own, and they move between revisions.",
          "Every bend is a fitting. An elbow needs straight run on both sides, and a run that's a little too short won't take one.",
          "Bends add up. Codes limit how much a run may bend between pull points (in the US, 360 degrees), because every bend makes the cable harder to pull.",
          "Not everything is an obstacle. Conduit goes through walls and slabs every day, but each penetration needs a hole, a sleeve and often fire stopping, and someone has to know where it is.",
          "Clashes found late are expensive. On site they mean stopped work, a reroute, and more bends than anyone planned.",
        ],
      },
      { type: "h2", id: "search", text: "Constraints inside the search" },
      {
        type: "p",
        text: "The common way to route around obstacles is to find a path and then repair it: straighten it, insert the elbows, nudge whatever doesn't fit. Every repair step is a place where a valid path can become an invalid one. We wanted the search to produce only routes that can be built.",
      },
      {
        type: "p",
        text: "So the router works on a Hanan grid. Its lines run through every face of every obstacle, grown by the clearance and the conduit's radius, plus the endpoints and the points one straight run away from them. The grid is sparse in open space and dense where the decisions are. Each state in the search is a position and a direction of travel, so bends are counted exactly. A turn jumps straight to the first point where the next elbow would fit, so every route the search returns already has room for its fittings. There is no repair step to fail afterwards.",
      },
      {
        type: "p",
        text: "The cost of a route is its length, plus a penalty for each bend and for vertical travel. The estimate that guides the search never overstates the remaining cost, so the route it returns is the cheapest one on the grid, and the same model gives the same route every time. The details matter. An earlier version let every move jump to any point along a line. It found the same routes, but on a scene with 300 obstacles and ten devices it took 4 seconds instead of 0.17.",
      },
      { type: "h2", id: "promise", text: "The promise" },
      {
        type: "p",
        text: "Every route CodeVault Electrical suggests keeps clear of everything set to Avoid, in the model and in its links. It's checked before the suggestion appears, against the real geometry of what's there. If anything set to Avoid would be hit, nothing changes, and the message names the element in the way.",
      },
      { type: "h2", id: "checks", text: "Three checks before you see it" },
      {
        type: "p",
        text: "The planner works with boxes, and a box is an approximation of an element. So a route passes three independent checks before it appears.",
      },
      {
        type: "list",
        items: [
          "The plan is validated again by separate code. That check uses the conduit's outside diameter, the space each elbow sweeps through, and every other run in the same route.",
          "Once the route is drawn, the real conduit and fittings, including any that Revit inserted while joining, are checked against the obstacles before the change is kept.",
          "Their actual solids are intersected with the real geometry of every nearby element, in the host model and in every loaded link. Only hits with volume count, so touching faces don't.",
        ],
      },
      {
        type: "p",
        text: "If anything set to Avoid is hit, the whole route is rolled back and the model is left as it was. If a linked model becomes unavailable partway through, the check doesn't quietly pass. It fails, and says why.",
      },
      { type: "h2", id: "avoid", text: "Avoid, or Go through" },
      {
        type: "p",
        text: "Every kind of element is set to one or the other. By default, conduit keeps clear of ducts, pipes, cable trays, columns, equipment, doors and windows, and may pass through walls, beams and ceilings, the way it's installed. Each switch can be changed, and your own families can have rules of their own: anything named glass, say, always avoided.",
      },
      {
        type: "figure",
        art: "clearance",
        tone: "sky",
        caption:
          "Around what's set to Avoid; through the wall, which is listed before you accept.",
      },
      { type: "h2", id: "listed", text: "Listed, not hidden" },
      {
        type: "p",
        text: "What a route passes through because the settings allow it is listed in the preview, with a reminder to check drilling, sleeves or fire stopping. Ends that couldn't be joined are named too, with the element to select, so they can be finished by hand. Coordination starts with a list instead of a search.",
      },
      { type: "h2", id: "fittings", text: "Fittings that fit" },
      {
        type: "p",
        text: "Revit can't say in advance how long an elbow family is. So the router plans with a minimum straight run worked out from the conduit's bend radius and diameter. If Revit still refuses an elbow, it plans again with longer runs, up to three times. Each attempt is a complete, validated route, and you only see the one that worked.",
      },
      {
        type: "figure",
        art: "fittings",
        tone: "heather",
        caption:
          "Room for every elbow, and as few of them as the route allows.",
      },
      { type: "h2", id: "measured", text: "Measured, not assumed" },
      {
        type: "p",
        text: "Routing quality is easy to claim and hard to keep. Every change to the router runs against a set of benchmark scenes built from real pilot cases. The gates cover outcome, separation, bends, length, detour, search effort, and whether it gives the same answer twice. A change that makes any of them worse has to justify itself before it ships.",
      },
      { type: "h2", id: "no-route", text: "When there's no way through" },
      {
        type: "p",
        text: "Sometimes there isn't one. Then you get no route rather than a bad one. The message says what kind of element is in the way, and suggests setting it to Go through if conduit may pass it. Nothing is added to the model without you seeing it first.",
      },
      { type: "h2", id: "words", text: "Why we don't say clash-free" },
      {
        type: "p",
        text: "Because that isn't the promise. A route keeps clear of what you set to Avoid, and tells you about the rest. That's narrower than clash-free, and it's a promise we can keep.",
      },
      {
        type: "cta",
        text: "If your team draws conduit in Revit 2025 or 2026, we'd like to hear what gets in the way. Early access is open to a small group of electrical contractors and designers.",
        label: electrical.access.label,
        href: electrical.access.href,
      },
    ],
  },
  {
    slug: "up-across-and-down",
    title: "Up, across and down",
    date: "2026-10-10",
    category: "Electrical",
    project: electrical.name,
    summary:
      "Junction boxes in a wall are now joined the way conduit is run: up out of the top, across, and down into the next.",
    lead: "A route can meet every geometric rule and still be wrong. Between two junction boxes on the same wall, an early version left through the bottom, dropped about 400 mm below the floor and came back up. Nothing was hit and every elbow fit, but no electrician would install it.",
    guides: ["revit-conduit-device-without-connector"],
    art: "openings",
    tone: "olive",
    body: [
      { type: "h2", id: "valid", text: "Valid is the minimum" },
      {
        type: "p",
        text: "A route that fails costs little. You read the message and change something. A route that passes every check but isn't how anyone builds costs more, because someone has to notice it, delete it and draw it again by hand. For a routing tool, correct has to include how the trade works, not just the geometry.",
      },
      { type: "h2", id: "site", text: "How it's done on site" },
      {
        type: "p",
        text: "Conduit from a box in a wall usually goes up. It leaves through the top, runs in the space above the ceiling, and drops into the next box. That space is where the runs can be reached later. Going under the floor means the slab, and usually somebody else's space.",
      },
      { type: "h2", id: "cause", text: "The cause" },
      {
        type: "p",
        text: "The router fixed the pair of openings before it started searching, by straight-line distance. On those boxes the closest pair was the bottom openings, and from there the cheapest legal route went under the floor. The search did exactly what it was asked. It was asked the wrong question.",
      },
      { type: "h2", id: "top", text: "Let the search choose" },
      {
        type: "p",
        text: "Now every free opening of each device goes into the search, and the search starts from all of them at once. Leaving or entering a device costs nothing through the top, a little through a side, and more through the bottom. That cost is weighed against length and bends in the same search. A top opening wins whenever it reasonably can, a side when the top is taken or blocked, and the bottom only when nothing else will do.",
      },
      {
        type: "p",
        text: "The opening is part of the route, so the same search that chooses the route should choose it.",
      },
      {
        type: "figure",
        art: "openings",
        tone: "olive",
        caption:
          "Two boxes in a wall, joined through their top openings. The old route, under the floor, ghosted below.",
      },
      { type: "h2", id: "solid", text: "Boxes are solid" },
      {
        type: "p",
        text: "A box is now an obstacle too, except for a channel straight out of each opening. A route can't pass through one or leave from its back. Each opening carries one run, and a box that already has a run gets the next one through a free opening instead of failing.",
      },
      { type: "h2", id: "families", text: "Families vary" },
      {
        type: "p",
        text: "Box families differ from office to office. Some put several connectors on a single opening, and many receptacle families have no conduit connector at all. Routes handle both. Openings are never shared, and a device without a connector is still reached, with the end named in the preview so it can be joined by hand.",
      },
      {
        type: "figure",
        art: "box",
        tone: "cactus",
        caption:
          "Out through the top when it's free; the side when it isn't; the bottom last.",
      },
      { type: "h2", id: "test", text: "The test" },
      {
        type: "p",
        text: "Clear of obstacles is the minimum. The standard is whether an electrician would run it that way.",
      },
      {
        type: "cta",
        text: "Got box families that don't behave? We'd like to try them. Early access is open to a small group of electrical contractors and designers.",
        label: electrical.access.label,
        href: electrical.access.href,
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
