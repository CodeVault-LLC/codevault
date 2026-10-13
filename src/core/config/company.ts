// Who runs the site, as the law needs it said. Ehandelsloven § 8 requires the
// name, a geographic address, an email address and — once there is one — the
// organisation number, all easy to find. The footer, Contact and Privacy pages
// read from here, so a change of company form is a change to this file.
//
// `orgNumber` and `address` are `null` until the enkeltpersonforetak is
// registered in Brønnøysundregistrene. Pages leave out what is missing rather
// than printing a placeholder. When registered, `legalName` is the name in the
// register (an ENK's must contain the owner's surname).

export type Address = {
  street: string
  postcode: string
  city: string
  country: string
}

export const company = {
  name: "CodeVault",
  legalName: null as string | null,
  form: "Enkeltpersonforetak",
  owner: "Lukas Moe Olsen",
  orgNumber: null as string | null,
  vatRegistered: false,
  address: null as Address | null,
  // TEMPORARY: codevault.no has no mail server yet, so post@codevault.no
  // can't receive mail. Until it can, everything points here. See TODO.md.
  email: "lukmarwil@gmail.com",
} as const

/** "912 345 678", with " MVA" once VAT-registered. */
export function groupOrgNumber(orgNumber: string, vat: boolean): string {
  const grouped = orgNumber.replace(/\D/g, "").replace(/(\d{3})(?=\d)/g, "$1 ")
  return `${grouped}${vat ? " MVA" : ""}`
}

/** "Org. nr. 912 345 678", as Norwegian businesses print it. */
export function formatOrgNumber(orgNumber: string, vat: boolean): string {
  return `Org. nr. ${groupOrgNumber(orgNumber, vat)}`
}

export function formatAddress(address: Address): string {
  return `${address.street}, ${address.postcode} ${address.city}, ${address.country}`
}

/** The facts the footer prints in one line, skipping what isn't known yet. */
export function legalLine(): string[] {
  return [
    company.legalName ?? company.name,
    company.form,
    company.orgNumber &&
      formatOrgNumber(company.orgNumber, company.vatRegistered),
    company.address && formatAddress(company.address),
  ].filter((part): part is string => Boolean(part))
}
