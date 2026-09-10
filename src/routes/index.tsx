import { createFileRoute } from "@tanstack/react-router"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero/hero"
import { LatestReleases } from "@/components/sections/latest-releases"
import { About } from "@/components/sections/about"
import { seo } from "@/core/lib/seo"
import { site } from "@/core/config/site"

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () =>
    seo({
      title: `${site.name} — ${site.tagline.replace(/\.$/, "")}`,
      description: site.description,
      path: "/",
    }),
})

function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <LatestReleases />
        <About />
      </main>
      <Footer />
    </div>
  )
}
