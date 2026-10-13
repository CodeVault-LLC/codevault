import { createFileRoute } from "@tanstack/react-router"

import { company, formatAddress, groupOrgNumber } from "@/core/config/company"
import { contact } from "@/core/config/legal"
import { site } from "@/core/config/site"
import { seo } from "@/core/lib/seo"
import { Container } from "@/components/layout/container"
import { PageShell } from "@/components/layout/page-shell"
import { Doodle } from "@/components/ui/doodle"
import { HeadlineWords } from "@/components/ui/headline-words"

export const Route = createFileRoute("/contact")({
  head: () =>
    seo({
      title: contact.title,
      description: contact.description,
      path: "/contact",
    }),
  component: ContactPage,
})

type Row = { label: string; value: string; href?: string }

function ContactPage() {
  const { labels } = contact
  const rows: Row[] = [
    {
      label: labels.email,
      value: company.email,
      href: `mailto:${company.email}`,
    },
    {
      label: labels.security,
      value: site.securityEmail,
      href: `mailto:${site.securityEmail}`,
    },
    {
      label: labels.business,
      value: `${company.legalName ?? company.name}, ${company.form.toLowerCase()}`,
    },
    ...(company.orgNumber
      ? [
          {
            label: labels.orgNumber,
            value: groupOrgNumber(company.orgNumber, company.vatRegistered),
          },
        ]
      : []),
    ...(company.address
      ? [{ label: labels.address, value: formatAddress(company.address) }]
      : []),
  ]

  return (
    <PageShell>
      <Container className="grid gap-10 pt-14 pb-24 sm:pt-20 lg:grid-cols-12 lg:pt-24 lg:pb-32">
        <div className="lg:col-span-4">
          <h1 className="font-sans text-display-l font-semibold">
            <HeadlineWords text={contact.heading} />
          </h1>
          <Doodle name="letter" className="mt-10 h-20" />
        </div>
        <dl
          className="fade-rise border-t border-border lg:col-span-7 lg:col-start-6"
          style={{ "--d": "120ms" } as React.CSSProperties}
        >
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-1 border-b border-border py-5 sm:grid-cols-3 sm:gap-6"
            >
              <dt className="font-mono text-label text-muted-foreground uppercase sm:pt-1">
                {row.label}
              </dt>
              <dd className="font-sans text-paragraph-m break-words sm:col-span-2">
                {row.href ? (
                  <a href={row.href} className="underline-quiet">
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </PageShell>
  )
}
