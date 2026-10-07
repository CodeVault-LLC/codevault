import { Navbar } from "@/components/layout/navbar"
import { SectionNav } from "@/components/layout/section-nav"
import { aboutNav } from "@/core/config/about"
import { site } from "@/core/config/site"

export function AboutNav() {
  return (
    <>
      <Navbar />
      <SectionNav label={site.presentation.aboutNavigation} links={aboutNav} />
    </>
  )
}
