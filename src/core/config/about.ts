// Copy for the /about cluster. Kept here rather than inline so the message
// stays revisable in one place (AGENTS.md §Ground rules).
//
// Headings are split into `{ before, accent, after }` instead of stored as one
// string: the design language puts exactly one serif-italic word in a heading
// (design-system.md §Typography), and that word is a copy decision, not a
// markup decision. The component owns the <span>; this file owns the words.
//
// Keep it short. `body` is optional on purpose — a heading with a specimen or
// a list under it usually says enough (AGENTS.md ground rule 6).

export type Heading = {
  before: string
  accent: string
  after?: string
}

/** The cluster's own sub-navigation, shown at the top of every About page. */
export const aboutNav: { label: string; href: string }[] = [
  { label: "How we work", href: "/about" },
  { label: "Who we are", href: "/about/who-we-are" },
  { label: "Get in touch", href: "/about/contact" },
  { label: "Brand", href: "/about/brand" },
]

export type AboutSection = {
  /** The mono index shown in the left rail — "01", "02", … */
  index: string
  /** Short rail label, uppercased in the UI. */
  label: string
  title: string
  body?: string[]
}

/**
 * The four steps every CodeVault project runs through.
 *
 * Shared deliberately: the homepage and /about render the same four, and two
 * copies of this loop would drift. It's the closest thing we have to a thesis.
 */
export const projectLoop: { title: string; body: string }[] = [
  {
    title: "Trial",
    body: "Build something real enough to react to.",
  },
  {
    title: "Experience",
    body: "Use it until the interesting problems show up.",
  },
  {
    title: "Adjustment",
    body: "Change the idea when the evidence changes.",
  },
  {
    title: "Result",
    body: "Share the tool, write-up, repository, or dead end.",
  },
]

export const aboutIndex = {
  eyebrow: "About",
  heading: {
    before: "What CodeVault actually ",
    accent: "is",
    after: ".",
  } satisfies Heading,
  lede: "Not a product company. A small group of people curious about too many things to pick just one — so we run projects instead.",
  sections: [
    {
      index: "01",
      label: "The stance",
      title: "We don't build one thing and sell it.",
      body: [
        "We'd rather stay curious than stay specialised. One month that's serious developer tooling; the next it's a browser game we pushed to GitHub in an afternoon. The output ranges widely — the standard doesn't.",
      ],
    },
    {
      index: "02",
      label: "The loop",
      title: "Every project runs the same four steps.",
    },
    {
      index: "03",
      label: "The range",
      title: "The only constant is that it's tech.",
      body: [
        "A fair amount of what we do is outside our competence when we start. Teaching a Raspberry Pi to water our plants took a month, and hardware still isn't our field — just less not-our-field than it was.",
      ],
    },
    {
      index: "04",
      label: "In the open",
      title: "We share the trial, not just the result.",
      body: [
        "If a project stalled, the write-up says it stalled. The interesting part is usually the part where it wasn't working yet.",
      ],
    },
  ] satisfies AboutSection[],
}

export const whoWeAre = {
  eyebrow: "About",
  heading: {
    before: "Curious about too many things to pick ",
    accent: "one",
    after: ".",
  } satisfies Heading,
  lede: "There's no org chart here worth drawing. How we think about the work is more useful.",
  sections: [
    {
      index: "01",
      label: "Drawn to",
      title: "Problems that are slightly out of reach.",
      body: [
        "Close enough to start, far enough that finishing teaches us something. Work that's purely mechanical tends not to get finished here, and that's fine.",
      ],
    },
    {
      index: "02",
      label: "How we start",
      title: "Someone builds the rough version first.",
      body: [
        "Not a plan, not a document — the smallest thing that runs, shown around. It's allowed to be bad. It's a question, not a proposal.",
      ],
    },
    {
      index: "03",
      label: "Honestly",
      title: "Things we're not good at.",
      body: [
        "We're bad at finishing things that stopped being interesting. We under-invest in polish until someone else has to use the thing. It's the actual trade we've made for staying broad.",
      ],
    },
    {
      index: "04",
      label: "Constant",
      title: "Built in the open, described accurately, shared either way.",
    },
  ] satisfies AboutSection[],
}

export const contact = {
  eyebrow: "About",
  heading: { before: "Get in ", accent: "touch", after: "." } satisfies Heading,
  lede: "Two ways to reach us, both read by a person.",
  channels: [
    {
      kind: "email" as const,
      label: "Email",
      value: "codevault@gmail.com",
      href: "mailto:codevault@gmail.com",
      description: "Anything that needs a sentence of context.",
    },
    {
      kind: "github" as const,
      label: "GitHub",
      value: "github.com/CodeVault-LLC",
      href: "https://github.com/CodeVault-LLC",
      description:
        "Everything we build. Issues are better opened on the project than emailed.",
    },
  ],
  footnote:
    "We're slow — a reply can take a week. If something matters and you hear nothing, send it again.",
}

export const brand = {
  eyebrow: "About",
  heading: {
    before: "The ",
    accent: "aperture",
    after: ", and how to use it.",
  } satisfies Heading,
  lede: "Everything here renders from the same tokens the rest of the site uses, so it can't quietly go out of date.",
  mark: {
    index: "01",
    label: "The mark",
    title: "Four blades, mid-turn.",
    body: [
      "Four because a project is a four-step loop. Rotational because the loop repeats. Open in the middle because we don't know how it lands.",
    ],
    rules: [
      { do: true, text: "Let it inherit the current text colour." },
      { do: true, text: "Use the badge below roughly 24px." },
      { do: false, text: "Don't recolour the blades to the olive accent." },
      { do: false, text: "Don't rotate, stretch, or re-space the blades." },
    ],
  },
  scout: {
    index: "02",
    label: "Scout",
    title: "The lander we send out ahead.",
    body: [
      "Its eye is the aperture — the mascot and the mark are the same object at two scales. Decorative by default, so hide it from assistive tech unless it's carrying meaning alone.",
    ],
  },
  color: {
    index: "03",
    label: "Colour",
    title: "Warm paper, one living accent.",
    body: [
      "Olive is the only alive colour we have, which is why it appears so rarely. A page with olive everywhere has no accent at all.",
    ],
    groups: [
      {
        heading: "Surfaces",
        swatches: [
          {
            name: "Ivory light",
            token: "--ivory-light",
            value: "#faf9f5",
            use: "Page background",
          },
          {
            name: "Ivory medium",
            token: "--ivory-medium",
            value: "#f0eee6",
            use: "Alternating sections",
          },
          {
            name: "Ivory dark",
            token: "--ivory-dark",
            value: "#e8e6dc",
            use: "Raised surfaces",
          },
          {
            name: "Oat",
            token: "--oat",
            value: "#e3dacc",
            use: "Warmer cards",
          },
        ],
      },
      {
        heading: "Ink",
        swatches: [
          {
            name: "Slate dark",
            token: "--slate-dark",
            value: "#141413",
            use: "Primary text",
          },
          {
            name: "Slate medium",
            token: "--slate-medium",
            value: "#3d3d3a",
            use: "Button hover",
          },
          {
            name: "Slate light",
            token: "--slate-light",
            value: "#5e5d59",
            use: "Muted foreground",
          },
          {
            name: "Cloud medium",
            token: "--cloud-medium",
            value: "#b0aea5",
            use: "Borders, faint UI",
          },
        ],
      },
      {
        heading: "Accent",
        swatches: [
          {
            name: "Olive",
            token: "--olive",
            value: "#788c5d",
            use: "The accent",
          },
          {
            name: "Clay",
            token: "--clay",
            value: "#d97757",
            use: "Rare warm accent",
          },
          {
            name: "Accent",
            token: "--accent",
            value: "#c6613f",
            use: "Selection",
          },
        ],
      },
    ],
  },
  type: {
    index: "04",
    label: "Type",
    title: "Three families, one italic word.",
    body: [
      "Sans by default, mono for code. Serif exists almost entirely for one move: a single italic word in a heading. One per heading, never two.",
    ],
    specimens: [
      {
        name: "Display XL",
        token: "text-display-xl",
        sample: "We point ourselves at tech",
      },
      {
        name: "Display M",
        token: "text-display-m",
        sample: "Every project runs the same four steps",
      },
      {
        name: "Paragraph L",
        token: "text-paragraph-l",
        sample: "A prototype, a spike, a weekend build.",
      },
      {
        name: "Paragraph S",
        token: "text-paragraph-s",
        sample: "Built in the open and shared as it is.",
      },
      { name: "Detail XS", token: "text-detail-xs", sample: "In the open" },
    ],
  },
  voice: {
    index: "05",
    label: "Voice",
    title: "Confident, understated, never promotional.",
    pairs: [
      {
        instead: "A revolutionary platform for modern developers.",
        write: "A small CLI that turns your git log into something readable.",
      },
      {
        instead: "Get started with our enterprise-grade solution today.",
        write: "It's on GitHub if you want it.",
      },
      {
        instead: "We deliver innovative interactive experiences.",
        write: "A browser game about keeping satellites from colliding.",
      },
      {
        instead: "Our roadmap is packed with exciting updates!",
        write: "This one's paused. We'd rather say so than pretend otherwise.",
      },
    ],
  },
}
