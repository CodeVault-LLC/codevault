// Facts for the /legal cluster.
//
// Everything entity-dependent lives here — operator, contact, jurisdiction,
// dates. The prose in `src/components/legal/` reads from this file and never
// names the operator inline, so registering a company later is an edit to this
// file and nothing else.
//
// The rule for this file and every page that reads it: **only state what is
// true today**. A retention period we don't enforce or a security measure we
// don't run is a promise a regulator can hold us to. Where we haven't decided
// something, the page says so plainly rather than inventing a number.
//
// Design & reasoning: docs/superpowers/specs/2026-07-19-legal-pages-design.md

import type { Heading } from "@/core/config/about"

/**
 * Who runs this site.
 *
 * Today: a natural person. There is no registered entity, and neither
 * "CodeVault LLC" (the GitHub org) nor "CodeVault, Inc." names a legal form
 * that exists — an LLC is a US construct with no Norwegian equivalent. Saying
 * either on a legal page would be a false statement about legal form, so the
 * pages name the person who is actually accountable.
 *
 * When an entity is registered: set `kind` to `"entity"`, put the registered
 * name in `name`, and fill in `orgNumber`. The pages pick all of it up.
 */
const operator = {
  name: "Lukas Moe Olsen",
  kind: "individual" as "individual" | "entity",
  /** Organisasjonsnummer. Null until something is registered. */
  orgNumber: null as string | null,
  country: "Norway",
} as const

export const legal = {
  operator,

  /**
   * The published contact point. Deliberately the shared address rather than a
   * personal one: this appears on a permanently indexed page next to a full
   * legal name, and it is where privacy requests and vulnerability reports
   * arrive. GDPR asks for a working channel, not a home address.
   */
  contact: {
    email: "codevault@gmail.com",
    href: "mailto:codevault@gmail.com",
  },

  /** Norway's data protection authority — where a complaint goes. */
  supervisoryAuthority: {
    name: "Datatilsynet",
    href: "https://www.datatilsynet.no",
  },

  /**
   * Everyone who processes data on our behalf. Per docs/deployment.md — a
   * single container on an Oracle Cloud VM with Postgres alongside it, and
   * Cloudflare R2 for objects.
   *
   * If a service is added that touches visitor or staff data, it goes in this
   * list on the same commit. A privacy policy that omits a processor is the
   * most common way one becomes untrue.
   */
  processors: [
    {
      name: "Oracle Cloud Infrastructure",
      purpose: "Runs the server and the database.",
    },
    {
      name: "Cloudflare",
      purpose: "Stores report files, and provides DNS and network protection.",
    },
  ],

  /**
   * ⚠️ **This is a commitment the deployment has to honour.**
   *
   * The privacy policy tells readers their data is stored in the EU. If the
   * Oracle Cloud region or the Cloudflare R2 jurisdiction is ever set to
   * anything else, this string and the "Where data is stored" section are
   * false and both must change — a third-country transfer then needs
   * disclosing with its safeguard.
   *
   * Confirm at deploy time. See docs/deployment.md.
   */
  dataRegion: "the European Union",

  /**
   * The real date these pages went up, shown on each document.
   *
   * Never backdate this, and change it when the text materially changes — a
   * "last updated" that doesn't track the text is worse than none, because it
   * tells a reader the document was reviewed when it wasn't.
   */
  effective: "2026-07-19",
} as const

/**
 * How the operator is named in prose: "Lukas Moe Olsen" today, and
 * "CodeVault AS (org. 123 456 789)" once something is registered.
 */
export function operatorLabel(): string {
  if (legal.operator.kind === "entity" && legal.operator.orgNumber) {
    return `${legal.operator.name} (org. ${legal.operator.orgNumber})`
  }

  return legal.operator.name
}

/** The cluster's own sub-navigation, shown at the top of every legal page. */
export const legalNav: { label: string; href: string }[] = [
  { label: "Overview", href: "/legal" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Cookies", href: "/legal/cookies" },
  { label: "Security", href: "/legal/security" },
]

type PageCopy = {
  eyebrow: string
  heading: Heading
  lede: string
  /** Used for the <meta name="description">. */
  description: string
}

export const legalPages: Record<
  "index" | "privacy" | "terms" | "cookies" | "security",
  PageCopy
> = {
  index: {
    eyebrow: "Legal",
    heading: { before: "The ", accent: "small", after: " print" },
    lede: "Four documents: what we collect, the terms you read this under, the one cookie we set, and how to report a security problem.",
    description:
      "CodeVault's privacy policy, terms of use, cookie notice, and security disclosure policy.",
  },
  privacy: {
    eyebrow: "Legal",
    heading: { before: "What we ", accent: "know", after: " about you" },
    lede: "Almost nothing, if you're just reading. This page says exactly what that means, and what changes if you hold a staff account.",
    description:
      "What data CodeVault collects, why, how long it is kept, and the rights you have over it under GDPR.",
  },
  terms: {
    eyebrow: "Legal",
    heading: { before: "Terms of ", accent: "use" },
    lede: "What this site is, what it isn't, and the handful of things we ask you not to do with it.",
    description:
      "The terms you read codevault.no under: the archive, intellectual property, acceptable use, and governing law.",
  },
  cookies: {
    eyebrow: "Legal",
    heading: { before: "Cookies, ", accent: "briefly" },
    lede: "One cookie, and only if you sign in. There's no banner because there's nothing to consent to.",
    description:
      "The cookies CodeVault sets, what they do, and why there is no consent banner.",
  },
  security: {
    eyebrow: "Legal",
    heading: { before: "Reporting a ", accent: "vulnerability" },
    lede: "If you've found a security problem, we'd genuinely like to hear about it. Here's what's in scope and what to expect.",
    description:
      "How to report a security vulnerability in CodeVault, what is in scope, and what to expect in response.",
  },
}
