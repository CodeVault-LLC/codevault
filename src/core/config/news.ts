// News posts. Newest first is applied by `allPosts()`, not by the order here.
//
// Everything in these posts should be true of the work on the date given.
// CodeVault Electrical's source of truth is its own repository (the changelog,
// the plan and the decision records); when in doubt, say less. It is meant to
// be sold, so posts describe what it does for the people using it, not how
// it's built: no languages, frameworks or vendors beyond Revit itself.

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
      "Drop to Tray draws conduit from a device to the nearest cable tray, for one device or up to 50 at once.",
    lead: "In a lot of ceilings, devices don't run to each other. Each one drops to the cable tray overhead. CodeVault Electrical now draws those drops.",
    guides: ["revit-conduit-around-linked-models"],
    art: "tray",
    tone: "oat",
    body: [
      { type: "h2", id: "one", text: "One device" },
      {
        type: "p",
        text: "Select a device and click Drop to Tray. It finds the nearest horizontal tray it can reach, in the model or a linked one, and suggests a drop into its bottom or side that keeps clear of everything set to Avoid. The suggestion names the tray, and if a nearer one wasn't used, it says why.",
      },
      {
        type: "p",
        text: "The tray itself is never changed. Revit can't join conduit to a tray, so the drop stops at the tray's face, and the suggestion says so.",
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
        text: "Select up to 50 devices and each gets its own drop, in one review and one undo step. The drops keep clear of each other too. If one device can't be reached, nothing is added, and the message names it.",
      },
      { type: "h2", id: "routes", text: "Whole routes" },
      {
        type: "p",
        text: "A new Routes panel works on routes CodeVault Electrical added. Select Routes picks up every piece of one. Remove Routes deletes it in one undo step and leaves the devices alone. Re-route plans it again between the same devices after the model has changed, and swaps it in. These three are new, and we haven't tried them in Revit yet.",
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
    lead: "CodeVault Electrical is a Revit add-in for electricians and electrical designers. It starts with conduit: pick the devices, and it suggests a route that keeps clear of what's in the way.",
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
        text: "Drawing conduit in Revit is slow, careful work in 3D. Revit gives you conduit, fittings and a place to put them; the route itself is yours to find, segment by segment, around ducts, beams and pipes that usually live in someone else's linked model.",
      },
      {
        type: "p",
        text: "And it doesn't stay drawn. Electrical is often modelled after mechanical and plumbing, so conduit takes the space that's left, and every design change that moves a duct sends someone back to redraw the runs around it.",
      },
      {
        type: "p",
        text: "CodeVault Electrical does the routing. You pick the devices; it finds a route, draws it, and asks before keeping it.",
      },
      { type: "h2", id: "workflow", text: "How it works in Revit" },
      {
        type: "p",
        text: "It adds a CodeVault Electrical tab to the ribbon. Everything starts from there.",
      },
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
          "Your families. Plenty of receptacle, switch and light families have no conduit connector at all; routes still reach them, and any end that couldn't be joined is named so you can finish it.",
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
      "Conduit is the run that gets moved when everything else is already in the ceiling. Why drawing it is hard, and what every route we suggest promises.",
    lead: "Conduit is often modelled last and moved first. By the time the electrical design is drawn, ducts, pipes and steel have the best space, and a clash found later is usually solved by bending conduit around it. A tool that draws those routes has to be exact about what it promises.",
    guides: [
      "revit-conduit-around-linked-models",
      "revit-conduit-not-enough-room-for-fittings",
    ],
    art: "clearance",
    tone: "sky",
    body: [
      { type: "h2", id: "hard", text: "Why it's hard" },
      {
        type: "p",
        text: "On a plan, a run between two boxes is a line. In the model it's a path through a ceiling that is already full.",
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
      { type: "h2", id: "promise", text: "The promise" },
      {
        type: "p",
        text: "Every route CodeVault Electrical suggests keeps clear of everything set to Avoid, in the model and in its links. It's checked before the suggestion appears, against the real geometry of what's there. If anything set to Avoid would be hit, nothing changes, and the message names the element in the way.",
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
        text: "A route that can't take its elbows isn't a route. Every bend we suggest has room for the fitting that goes there, sized from the conduit you're using. Routes prefer fewer bends and level runs, and boxes in a wall are joined up, across and down, the way they're installed.",
      },
      {
        type: "figure",
        art: "fittings",
        tone: "heather",
        caption:
          "Room for every elbow, and as few of them as the route allows.",
      },
      { type: "h2", id: "no-route", text: "When there's no way through" },
      {
        type: "p",
        text: "Sometimes there isn't one. Then you get no route rather than a bad one. The message says what kind of element is in the way, and suggests setting it to Go through if conduit may pass it. Nothing is added to the model without you seeing it first.",
      },
      { type: "h2", id: "words", text: "Why we don't say clash-free" },
      {
        type: "p",
        text: "Because it isn't the promise. A route keeps clear of what you set to Avoid, and tells you about the rest. That's narrower than clash-free, and it's a promise we can keep.",
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
    lead: "In an early test with junction boxes set into a wall, the conduit dropped below the floor and came back up. It was a valid route, and not one anyone would install.",
    guides: ["revit-conduit-device-without-connector"],
    art: "openings",
    tone: "olive",
    body: [
      { type: "h2", id: "site", text: "How it's done on site" },
      {
        type: "p",
        text: "Conduit from a box in a wall usually goes up. It leaves through the top, runs in the space above the ceiling, and drops into the next box. That space is where the runs can be reached later; going under the floor means the slab, and usually somebody else's space.",
      },
      { type: "h2", id: "wrong", text: "What went wrong" },
      {
        type: "p",
        text: "The add-in took the shortest way out of each box, and on those boxes that was through the bottom. Every rule was kept: clear of obstacles, room for every elbow. It still dropped about 400 mm under the floor to get between two boxes on the same wall.",
      },
      {
        type: "p",
        text: "That's the harder kind of mistake. A route that fails is obvious. A route that works but isn't how anyone would build it has to be noticed, deleted and drawn again by hand.",
      },
      { type: "h2", id: "top", text: "Top first" },
      {
        type: "p",
        text: "Now a box is left through the top whenever it can be. If the top openings are taken or blocked, a side; the bottom only when nothing else will do. Boxes on the same wall are joined up, across and down.",
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
        text: "A box is also something to keep clear of, except straight out of its openings. A route can't pass through one, or leave from its back. Each opening carries one run, and a box that already has a run gets the next through a free opening instead of failing.",
      },
      { type: "h2", id: "families", text: "Families vary" },
      {
        type: "p",
        text: "Box families differ from office to office. Some put several connectors on a single opening; many receptacle families have no conduit connector at all. Routes handle both: openings are never shared, and a device without a connector is still reached, with the end named in the preview so it can be joined by hand.",
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
        text: "Clear of obstacles is the minimum. The real test is whether an electrician would run it that way.",
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
