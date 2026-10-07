import { Outlet, createFileRoute } from "@tanstack/react-router"

import { Footer } from "@/components/layout/footer"
import { AboutNav } from "@/components/about/about-nav"

export const Route = createFileRoute("/about")({
  component: AboutLayout,
})

function AboutLayout() {
  return (
    <>
      <AboutNav />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
