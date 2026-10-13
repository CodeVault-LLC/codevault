# To do

Open work on the site, most urgent first. Remove an item when it's done.

## Urgent: give codevault.no working email

**Since:** October 13, 2026

codevault.no has no mail server: no MX, SPF or DMARC records. Mail to
`post@codevault.no` and `security@codevault.no` can't be delivered, and those
are the addresses the site was built around.

**Temporary fix, live now:** every address on the site points to
`lukmarwil@gmail.com`, a personal inbox. That covers the early access buttons,
Contact, Privacy, the footer's "Report a vulnerability", `security.txt`,
`llms.txt` and the structured data. It works, but it's a personal address on a
company site, and it is now public and indexed.

To finish:

- [ ] Choose an email provider. First check whether Domeneshop (the
      registrar) includes email or forwarding; otherwise Google Workspace,
      Microsoft 365, Proton or Zoho.
- [ ] Add the provider's MX, SPF, DKIM and DMARC records in Vercel → Domains
      → codevault.no (Vercel runs the DNS).
- [ ] Create `post@codevault.no` and `security@codevault.no`, and send a test
      mail to both from outside.
- [ ] Switch the site back, in two places:
  - `src/core/config/company.ts`: `email: "post@codevault.no"`
  - `src/core/config/site.ts`: `const securityEmail = "security@codevault.no"`
- [ ] If the email provider is new, add it to the privacy notice
      (`src/core/config/legal.ts`, "Who else sees it") and bump `updated`.
- [ ] Deploy, then check the Contact page, an early access button and
      `/.well-known/security.txt`.

## Also open

- [ ] **Vercel plan.** The free Hobby plan doesn't allow commercial use, and
      this site promotes a product. Upgrade to Pro, and check that Vercel's
      data processing addendum covers the plan (the privacy notice says it
      does).
- [ ] **Search engines.** Add the site to Google Search Console and Bing
      Webmaster Tools, and submit `https://www.codevault.no/sitemap.xml`.
- [ ] **One name everywhere.** The GitHub organisation is `CodeVault-LLC`,
      shown as "CodeVault Open Source", and the product licence says
      "CodeVault LLC". Use "CodeVault" as the display name, verify
      codevault.no on the organisation and link it to
      `https://www.codevault.no`.
- [ ] **Register the company** in Brønnøysundregistrene, then fill in
      `orgNumber` (and `legalName`, `address`) in
      `src/core/config/company.ts`. The footer, Contact, Privacy, About and
      structured data pick them up.
- [ ] **LinkedIn.** Create a company page and add its URL to `sameAs` in
      `src/core/lib/structured-data.ts`.
