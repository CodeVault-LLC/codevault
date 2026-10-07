import { Navbar } from "@/components/layout/navbar"
import { SectionNav } from "@/components/layout/section-nav"
import { legalNav } from "@/core/config/legal"
import { legalPresentation } from "@/core/config/site"

export function LegalNav() {
  return (
    <>
      <Navbar />
      <SectionNav label={legalPresentation.navigation} links={legalNav} />
    </>
  )
}
