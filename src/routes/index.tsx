import { createFileRoute } from "@tanstack/react-router"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero/hero"
import { LatestReleases } from "@/components/sections/latest-releases"
import { About } from "@/components/sections/about"

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      {
        title: "CodeVault — We point ourselves at tech, and see what happens",
      },
      {
        name: "description",
        content:
          "CodeVault isn't a product company. We run projects across everything in tech — trials, experiments, and the occasional small thing we push to GitHub. Built in the open, shared as they are.",
      },
    ],
  }),
})

function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-ivory-light text-foreground">
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
