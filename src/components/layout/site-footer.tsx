import { Link } from "@tanstack/react-router"

import type { Category } from "@/core/config/news"
import { site } from "@/core/config/site"
import { LogoGlyph } from "@/components/brand/logo-glyph"
import { Container } from "./container"

const isExternal = (href: string) => /^(https?:|mailto:)/.test(href)

type FooterLink = { label: string; href: string; category?: Category }

export function SiteFooter() {
  return (
    <footer className="bg-inverse text-inverse-foreground">
      <Container className="grid gap-14 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-5">
          <Link to="/" aria-label={`${site.name} home`} className="inline-flex">
            <LogoGlyph className="size-9" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
          {site.footer.columns.map((column) => (
            <div key={column.heading}>
              <h2 className="mb-4 font-sans text-caption text-inverse-muted">
                {column.heading}
              </h2>
              <ul className="space-y-3">
                {column.links.map((link: FooterLink) => (
                  <li key={link.label}>
                    {isExternal(link.href) ? (
                      <a
                        href={link.href}
                        className="font-sans text-ui hover:underline hover:underline-offset-4"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        search={
                          "category" in link ? { category: link.category } : {}
                        }
                        className="font-sans text-ui hover:underline hover:underline-offset-4"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
      <Container className="border-t border-inverse-foreground/15 py-8">
        <p className="font-sans text-caption text-inverse-muted">
          {site.footer.copyright}
        </p>
      </Container>
    </footer>
  )
}
