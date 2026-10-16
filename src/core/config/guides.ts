// Guides: plain answers to the problems people search for, written so they
// help someone who will never install CodeVault Electrical. The product gets
// one short section at the end, linked to its page. Nothing redirects.
//
// Revit facts are ones Autodesk documents or anyone can check in Revit.
// Claims about CodeVault Electrical trace to its repository's changelog.
// Leave out setting names, millimetre defaults and anything that will go
// stale; when in doubt, say less. Bump `updated` on every edit.

import type { Block } from "./news"

export type Guide = {
  slug: string
  /** The H1, in the words people search with. */
  title: string
  /** The <title>, problem first. The route appends " — CodeVault". */
  seoTitle: string
  /** Meta description and the line in lists: the answer, short. */
  description: string
  /** Two or three sentences under the title. The direct answer. */
  answer: string
  /** yyyy-mm-dd: when the content was last checked or changed. */
  updated: string
  appliesTo: string
  body: Block[]
  /** What CodeVault Electrical does about it. One or two sentences. */
  product: string
  related: { news?: string[]; guides?: string[] }
}

const guides: Guide[] = [
  {
    slug: "revit-conduit-not-enough-room-for-fittings",
    title: "Not enough room for conduit fittings in Revit",
    seoTitle: "Not enough room for conduit fittings in Revit",
    description:
      "Every elbow needs straight conduit on both sides. Why bends fail on short runs in Revit, and how to fix them.",
    answer:
      "Every bend in a conduit run is an elbow fitting, and an elbow needs straight conduit on both sides. When a segment is shorter than that, Revit can't place the fitting and the bend fails. Make the short segment longer, or move the bend.",
    updated: "2026-10-13",
    appliesTo: "Revit 2025 and 2026",
    body: [
      { type: "h2", id: "why", text: "Why it happens" },
      {
        type: "p",
        text: "In Revit a bend isn't a corner in a line. It's a separate fitting with a length of its own, set by the elbow family and the conduit size. That length comes out of the conduit on either side. If what's left of a segment is shorter than the fitting needs, there's nowhere to put it.",
      },
      {
        type: "p",
        text: "It shows up most on short jogs: a small offset under a beam, two bends close together, or a run that turns right next to a box.",
      },
      { type: "h2", id: "fix", text: "How to fix it" },
      {
        type: "list",
        items: [
          "Make the short segment longer. Drag its end out, or start the bend further from the box.",
          "Space the bends out. Two elbows back to back need room for both, and a little straight conduit between them.",
          "Draw the straight runs first, then join them with Trim/Extend. Revit places the elbow where they meet.",
          "If two runs won't join, their centrelines may be slightly off. Align them and try again.",
        ],
      },
      { type: "h2", id: "type", text: "Check the conduit type" },
      {
        type: "p",
        text: "If no bend works anywhere, the type is usually the problem, not the length. Open the conduit's Type Properties and look at the fittings. A type with no bend fitting assigned has nothing to place at a corner. Projects often have more than one conduit type, and it's easy to draw with the wrong one.",
      },
      { type: "h2", id: "family", text: "Check the elbow family" },
      {
        type: "p",
        text: "Elbow families take their sizes from a lookup table, usually based on a manufacturer's data. If the table has been edited, or the family is for a different product than the one you'll install, the elbow can need more room than you'd expect. Compare it with the real fitting.",
      },
    ],
    product:
      "CodeVault Electrical leaves room for every elbow when it plans a route, sized from the conduit you're using, and uses as few bends as the route allows. New runs continue the type of the conduit you picked, and if Revit still can't fit an elbow, it plans again with longer straight runs.",
    related: {
      news: ["what-a-route-promises"],
      guides: ["revit-conduit-around-linked-models"],
    },
  },
  {
    slug: "revit-conduit-device-without-connector",
    title: "Connecting conduit to a device with no conduit connector in Revit",
    seoTitle: "Connect conduit to a device without a connector in Revit",
    description:
      "Revit only joins conduit to families with a conduit connector. How to add one, and what to do when you can't edit every family.",
    answer:
      "Revit only joins conduit to a family that has a conduit connector, and plenty of receptacle, switch and light families don't have one. Add a connector in the Family Editor, or run the conduit to the device and leave the end unjoined.",
    updated: "2026-10-13",
    appliesTo: "Revit 2025 and 2026",
    body: [
      { type: "h2", id: "tell", text: "How to tell" },
      {
        type: "p",
        text: "Conduit drawn to the device won't snap to it, and selecting the device shows no conduit grip. Open the family to be sure: a conduit connector shows up as its own element.",
      },
      {
        type: "p",
        text: "A conduit connector isn't the same as an electrical connector. The electrical connector puts the device on a circuit. The conduit connector is where conduit attaches. A family can have one without the other.",
      },
      { type: "h2", id: "add", text: "Adding a conduit connector" },
      {
        type: "list",
        items: [
          "Select the device and click Edit Family.",
          "On the Create tab, in the Connectors panel, click Conduit Connector.",
          "Choose Individual Connector for one fixed opening, or Surface Connector to let conduit attach anywhere on a face. Place it where conduit enters the device.",
          "Set the connector's diameter, or associate it with a family parameter so it follows the device's size.",
          "Load the family into the project, and overwrite the existing version.",
        ],
      },
      {
        type: "p",
        text: "Fix it in the office's family library, not only in the project, or the next project starts without it.",
      },
      {
        type: "h2",
        id: "every-family",
        text: "When you can't edit every family",
      },
      {
        type: "p",
        text: "An office can have dozens of device families, some from manufacturers and some made in house. Fixing all of them takes time. Until then, the usual approach is to run conduit to the device and leave the end unjoined. The conduit is in the model, in schedules and in clash checks. It just isn't connected to the device.",
      },
      {
        type: "p",
        text: "Keep track of those ends. An end left unjoined on purpose looks the same as one left by mistake.",
      },
    ],
    product:
      "CodeVault Electrical routes to devices with or without a conduit connector, so it works with the families you already have. Any end it couldn't join is named in the preview, with the element to select, so you can finish it by hand.",
    related: {
      news: ["up-across-and-down"],
      guides: ["revit-conduit-not-enough-room-for-fittings"],
    },
  },
  {
    slug: "revit-conduit-around-linked-models",
    title: "Routing conduit around ducts in a linked Revit model",
    seoTitle: "Route conduit around ducts in a linked Revit model",
    description:
      "You can't move a duct in someone else's model. How to find conduit clashes with a linked model in Revit, and route around them.",
    answer:
      "You can't edit a linked model from your own, so the conduit has to move. Run Interference Check between your conduit and the link to find the clashes, then route over, under or around each one.",
    updated: "2026-10-13",
    appliesTo: "Revit 2025 and 2026",
    body: [
      { type: "h2", id: "why", text: "Why the conduit moves" },
      {
        type: "p",
        text: "Ducts, pipes and structure usually sit in linked models that other teams own. Ducts are big and hard to move, and electrical is often modelled after mechanical and plumbing. So conduit gets the space that's left, and when a duct moves in a new revision, the conduit around it moves too.",
      },
      { type: "h2", id: "find", text: "Find the clashes" },
      {
        type: "list",
        items: [
          "On the Collaborate tab, in the Coordinate panel, open Interference Check. Put your conduit and conduit fittings on one side and the linked model's ducts on the other.",
          "Keep each check narrow: conduit against ducts, then against pipes, then against structure. Everything against everything gives a list nobody can work through.",
          "Make sure the link sits where it should before you trust the results. A link that's slightly off shows clashes that aren't real, and hides ones that are.",
          "Use Show to find each clash in a view, and export the report to keep track.",
        ],
      },
      { type: "h2", id: "route", text: "Route around them" },
      {
        type: "p",
        text: "Going over or under a duct takes two offsets, and each offset is two bends. That's four bends for one duct, each needing room for its elbow, and codes limit how much a run may bend between pull points.",
      },
      {
        type: "p",
        text: "It's often better to change the route further back, so it misses the duct altogether. If there's no reasonable way past, ask the mechanical team whether the duct can move.",
      },
      { type: "h2", id: "again", text: "Check again" },
      {
        type: "p",
        text: "Run the check after every change, because moving one run often puts it into the next pipe. When a new version of the link arrives, reload it and check again. The ducts will have moved too.",
      },
    ],
    product:
      "CodeVault Electrical checks every suggested route against the real geometry of your model and its loaded links before you see it. It keeps clear of everything set to Avoid, lists the walls, beams and ceilings the route passes through, and stops if a link isn't loaded.",
    related: {
      news: ["what-a-route-promises"],
      guides: ["revit-conduit-not-enough-room-for-fittings"],
    },
  },
  {
    slug: "deploy-revit-add-in-to-every-machine",
    title: "Deploying a Revit add-in to every machine",
    seoTitle: "Deploy a Revit add-in to every machine",
    description:
      "Where Revit looks for add-ins, why one person ends up on an old version, and what to check before rolling an add-in out.",
    answer:
      "Revit loads add-ins from a folder for each user and a folder for everyone on the machine. For a firm, install to the all-users folder with a per-machine installer, and push it with the deployment tool you already use. Everyone gets the same version.",
    updated: "2026-10-13",
    appliesTo: "Revit 2025 and 2026",
    body: [
      { type: "h2", id: "where", text: "Where Revit looks" },
      {
        type: "p",
        text: "Each version of Revit reads add-in manifests, small .addin files, from two folders:",
      },
      {
        type: "list",
        items: [
          "For one user: %AppData%\\Autodesk\\Revit\\Addins\\<version>",
          "For everyone on the machine: %ProgramData%\\Autodesk\\Revit\\Addins\\<version>",
        ],
      },
      {
        type: "p",
        text: "Some add-ins come as a bundle in an ApplicationPlugins folder instead, with the same split. Autodesk documents the folders for each release, so check the one for the version you're deploying.",
      },
      {
        type: "h2",
        id: "old-version",
        text: "When one person has an old version",
      },
      {
        type: "p",
        text: "If a manifest with the same name is in both folders, Revit ignores the all-users one. That's the usual reason someone is still on an old version after a firm-wide update: they once installed it themselves. Remove the copy from their AppData and restart Revit.",
      },
      { type: "h2", id: "push", text: "Pushing it out" },
      {
        type: "list",
        items: [
          "Use the vendor's per-machine installer if there is one. It writes to the all-users folder, so it needs admin rights, which your deployment tool already has.",
          "Push it with what you use for everything else: Intune, Configuration Manager or Group Policy.",
          "Revit loads add-ins when it starts, so people get an update the next time they open it.",
          "Try it on one machine with every Revit version you support before it goes everywhere.",
        ],
      },
      { type: "h2", id: "ask", text: "What to ask first" },
      {
        type: "list",
        items: [
          "Does it make network calls, and what does it send?",
          "What does it change in the model, and can that be undone?",
          "What happens with closed worksets, unloaded links and elements someone else is editing?",
          "Can an administrator set its settings once for the machine, and switch it off for everyone?",
          "Does it load third-party libraries into Revit? They can conflict with other add-ins.",
        ],
      },
    ],
    product:
      "CodeVault Electrical installs per user or per machine. A machine-wide settings file overrides each user's, and one switch turns every command off. Nothing from a model leaves the machine; the licence check sends only an activation code, a random ID for the PC and the version.",
    related: { news: ["introducing-codevault-electrical"] },
  },
]

/** Every guide, in the order above. */
export function allGuides(): Guide[] {
  return guides
}

export function findGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug)
}
