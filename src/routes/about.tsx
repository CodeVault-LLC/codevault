import { Outlet, createFileRoute } from "@tanstack/react-router"

import { AboutNav } from "@/components/about/about-nav"

export const Route = createFileRoute("/about")({
  component: AboutLayout,
})

function AboutLayout() {
  return (
    <>
      <AboutNav />
      <main>
        <Outlet />
      </main>
    </>
  )
}
