import { company } from "@/core/config/company"
import { electrical } from "@/core/config/electrical"
import type { Post } from "@/core/config/news"
import { site } from "@/core/config/site"
import { BASE, absolute } from "./seo"

// Schema.org descriptions of what the site is about, as JSON-LD. Search
// engines and AI assistants read these to know that CodeVault is a company,
// that CodeVault Electrical is software it makes, and that a post is an
// article about it.
//
// Every value comes from config, the same words the pages print. Nothing here
// may claim more than the pages do: no ratings, prices or release dates that
// don't exist.

export type JsonLd = Record<string, unknown>

const ids = {
  organization: `${BASE}/#organization`,
  website: `${BASE}/#website`,
  product: `${BASE}${electrical.path}#software`,
}

const ref = (id: string) => ({ "@id": id })

export function organization(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ids.organization,
    name: company.name,
    ...(company.legalName ? { legalName: company.legalName } : {}),
    url: BASE,
    logo: {
      "@type": "ImageObject",
      url: absolute("/icon.png"),
      width: 1024,
      height: 1024,
    },
    description: site.description,
    email: company.email,
    address: { "@type": "PostalAddress", addressCountry: "NO" },
    sameAs: [site.github],
    // What the company works on, so the name is tied to its field rather than
    // to the other companies that share it.
    knowsAbout: [
      "Autodesk Revit",
      "Electrical design",
      "Conduit routing",
      "Building information modeling",
    ],
    ...(company.orgNumber
      ? {
          identifier: {
            "@type": "PropertyValue",
            propertyID: "Organisasjonsnummer",
            value: company.orgNumber,
          },
        }
      : {}),
  }
}

export function aboutPage(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: absolute("/about"),
    name: `About ${company.name}`,
    inLanguage: "en",
    isPartOf: ref(ids.website),
    about: ref(ids.organization),
    mainEntity: ref(ids.organization),
  }
}

export function website(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": ids.website,
    name: site.name,
    url: BASE,
    description: site.description,
    inLanguage: "en",
    publisher: ref(ids.organization),
  }
}

export function software(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": ids.product,
    name: electrical.name,
    description: electrical.summary,
    url: absolute(electrical.path),
    image: absolute(electrical.ogImage),
    applicationCategory: "DesignApplication",
    applicationSubCategory: "Autodesk Revit add-in",
    operatingSystem: "Windows",
    softwareRequirements: "Autodesk Revit 2025 or 2026",
    featureList: electrical.status.rows
      .filter((row) => row.status === "Working")
      .map((row) => row.label),
    creativeWorkStatus: "In development",
    publisher: ref(ids.organization),
    author: ref(ids.organization),
  }
}

export function faq(items: readonly { q: string; a: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }
}

export function article(post: Post, image: string): JsonLd {
  const url = absolute(`/news/${post.slug}`)
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.summary,
    url,
    mainEntityOfPage: url,
    image: absolute(image),
    datePublished: post.date,
    dateModified: post.date,
    articleSection: post.category,
    inLanguage: "en",
    author: ref(ids.organization),
    publisher: ref(ids.organization),
    isPartOf: ref(ids.website),
    ...(post.project === electrical.name ? { about: ref(ids.product) } : {}),
  }
}

export function breadcrumbs(trail: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  }
}
