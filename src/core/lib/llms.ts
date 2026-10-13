import { company } from "@/core/config/company"
import { electrical } from "@/core/config/electrical"
import type { Block, Post } from "@/core/config/news"
import { allPosts, formatDate } from "@/core/config/news"
import { news } from "@/core/config/pages"
import { site } from "@/core/config/site"
import { BASE, absolute } from "./seo"

// The site as plain text, for AI assistants and anything else that reads
// rather than renders: `/llms.txt` is a short index (llmstxt.org), and
// `/llms-full.txt` is everything, one file. RSS is here too, for readers.
//
// Built from config, so they say exactly what the pages say.

const about = `${company.name} is a Norwegian software company. It builds software for problems large organisations have learned to live with. Its current product is ${electrical.name}, a Revit add-in for electricians that routes conduit.`

const postUrl = (post: Post) => absolute(`/news/${post.slug}`)

export function llmsIndex(): string {
  const posts = allPosts()
  return [
    `# ${company.name}`,
    "",
    `> ${about}`,
    "",
    ...electrical.facts.map((fact) => `- ${fact.label}: ${fact.value}`),
    `- Contact: ${company.email}`,
    "",
    "## Product",
    "",
    `- [${electrical.name}](${absolute(electrical.path)}): ${electrical.summary}`,
    "",
    "## News",
    "",
    ...posts.map(
      (post) => `- [${post.title}](${postUrl(post)}): ${post.summary}`
    ),
    "",
    "## Company",
    "",
    `- [Contact](${absolute("/contact")}): email and business details`,
    `- [Privacy](${absolute("/privacy")}): what data the site touches and why`,
    `- [Brand](${absolute("/brand")}): logo, mascot, colour and type`,
    "",
    "## Optional",
    "",
    `- [Everything on this site, as one file](${absolute("/llms-full.txt")})`,
    `- [News feed (RSS)](${absolute("/news/rss.xml")})`,
    "",
  ].join("\n")
}

function blockToMarkdown(block: Block): string {
  switch (block.type) {
    case "p":
      return block.text
    case "h2":
      return `#### ${block.text}`
    case "list":
      return block.items.map((item) => `- ${item}`).join("\n")
    case "figure":
      return `_Figure: ${block.caption}_`
    case "cta":
      return `${block.text} [${block.label}](${block.href})`
  }
}

export function llmsFull(): string {
  const e = electrical
  const sections = [
    `# ${company.name}`,
    `> ${about}`,
    `Website: ${BASE}. Email: ${company.email}. GitHub: ${site.github}.`,
    `## ${e.name}`,
    `${e.tagline} ${e.hero.body}`,
    `Page: ${absolute(e.path)}`,
    e.facts.map((fact) => `- ${fact.label}: ${fact.value}`).join("\n"),
    `### ${e.tools.heading}`,
    e.tools.items.map((tool) => `- ${tool.name}: ${tool.body}`).join("\n"),
    `### ${e.principles.heading}`,
    e.principles.items
      .map((item) => `- ${item.title}. ${item.body}`)
      .join("\n"),
    `### ${e.status.heading}`,
    e.status.rows.map((row) => `- ${row.label}: ${row.status}`).join("\n"),
    `### ${e.faq.heading}`,
    e.faq.items.map((item) => `**${item.q}**\n${item.a}`).join("\n\n"),
    `## ${news.heading}`,
    ...allPosts().map((post) =>
      [
        `### ${post.title}`,
        `${formatDate(post.date)} · ${post.category} · ${postUrl(post)}`,
        post.lead,
        ...post.body.map(blockToMarkdown),
      ].join("\n\n")
    ),
  ]
  return `${sections.join("\n\n")}\n`
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

/** RSS 2.0 for the news, newest first. */
export function rss(): string {
  const posts = allPosts()
  const self = absolute("/news/rss.xml")
  const rfc822 = (iso: string) => new Date(`${iso}T00:00:00Z`).toUTCString()
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
    `  <channel>`,
    `    <title>${escapeXml(`${site.name} news`)}</title>`,
    `    <link>${absolute("/news")}</link>`,
    `    <description>${escapeXml(news.description)}</description>`,
    `    <language>en</language>`,
    `    <atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
    ...(posts[0]
      ? [`    <lastBuildDate>${rfc822(posts[0].date)}</lastBuildDate>`]
      : []),
    ...posts.flatMap((post) => [
      `    <item>`,
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${postUrl(post)}</link>`,
      `      <guid isPermaLink="true">${postUrl(post)}</guid>`,
      `      <pubDate>${rfc822(post.date)}</pubDate>`,
      `      <category>${escapeXml(post.category)}</category>`,
      `      <description>${escapeXml(post.summary)}</description>`,
      `    </item>`,
    ]),
    `  </channel>`,
    `</rss>`,
    "",
  ].join("\n")
}
