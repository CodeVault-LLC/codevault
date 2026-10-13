import { describe, expect, it } from "vitest"

import { company, formatOrgNumber, legalLine } from "./company"

describe("company", () => {
  it("formats an organisation number in groups of three", () => {
    expect(formatOrgNumber("912345678", false)).toBe("Org. nr. 912 345 678")
    expect(formatOrgNumber("912 345 678", true)).toBe(
      "Org. nr. 912 345 678 MVA"
    )
  })

  it("only holds a real organisation number", () => {
    if (company.orgNumber) {
      expect(company.orgNumber.replace(/\s/g, "")).toMatch(/^\d{9}$/)
    }
  })

  it("names the business and its form in the legal line", () => {
    const line = legalLine()
    expect(line[0]).toBe(company.legalName ?? company.name)
    expect(line).toContain(company.form)
    expect(line.every((part) => part.length > 0)).toBe(true)
  })
})
