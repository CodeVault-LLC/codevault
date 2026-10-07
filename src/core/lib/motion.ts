import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Registered once, here. Import gsap from this module, not from "gsap", so the
// plugins are always in place. Registering is SSR-safe; nothing runs until a
// component's useGSAP does, which is client-only.
gsap.registerPlugin(useGSAP, ScrollTrigger)

export { gsap, ScrollTrigger, useGSAP }

export const motionQuery = {
  ok: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
} as const

// Sections fade up the first time they scroll into view. The starting offset
// lives in CSS (`[data-reveal]` in globals.css) so the server-rendered HTML
// doesn't flash before hydration.
export const reveal = {
  duration: 0.55,
  ease: "power4.out",
  stagger: 0.08,
  start: "top 85%",
} as const
