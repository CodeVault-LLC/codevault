import { useRef } from "react"

import { gsap, motionQuery, reveal, useGSAP } from "@/core/lib/motion"

/** Fades its children up the first time they scroll into view. */
export function Reveal({
  children,
  className,
  stagger = false,
}: {
  children: React.ReactNode
  className?: string
  stagger?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const targets = stagger
        ? gsap.utils.toArray<HTMLElement>("[data-reveal]", root)
        : [root]
      const mm = gsap.matchMedia()
      mm.add(motionQuery.ok, () => {
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: reveal.duration,
          ease: reveal.ease,
          stagger: reveal.stagger,
          scrollTrigger: { trigger: root, start: reveal.start, once: true },
        })
      })
    },
    { scope: ref }
  )

  return (
    <div ref={ref} className={className} data-reveal={stagger ? undefined : ""}>
      {children}
    </div>
  )
}

/** A child of a staggered `Reveal`. */
export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className} data-reveal="">
      {children}
    </div>
  )
}
