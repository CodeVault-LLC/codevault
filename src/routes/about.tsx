import { Outlet, createFileRoute } from "@tanstack/react-router"

import { AboutNav } from "@/components/about/about-nav"

/**
 * Layout for the About cluster.
 *
 * The sub-nav lives here rather than in each page so it survives navigation
 * between them — which is what lets the active indicator slide from one tab to
 * the next instead of cutting.
 */
export const Route = createFileRoute("/about")({
  component: AboutLayout,
})

function AboutLayout() {
  return (
    <>
      <AboutNav />
      <Outlet />
    </>
  )
}
