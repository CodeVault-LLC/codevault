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
        title: "CodeVault — Tools for the people who build software",
      },
      {
        name: "description",
        content:
          "CodeVault is a software platform for programmers. One place to review, ship, and observe the code that powers your company.",
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
