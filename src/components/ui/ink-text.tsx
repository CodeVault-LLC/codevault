import { Fragment, useRef } from "react"

import { gsap, motionQuery, useGSAP } from "@/core/lib/motion"

/**
 * A paragraph that inks in word by word as it scrolls up through the
 * screen, so it reads at the pace it's scrolled. Rendered at full ink, and
 * left that way with reduced motion.
 */
export function InkText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>("[data-word]", ref.current)
      const mm = gsap.matchMedia()
      mm.add(motionQuery.ok, () => {
        gsap.fromTo(
          words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: {
              trigger: ref.current,
              start: "top 85%",
              end: "bottom 50%",
              scrub: 0.4,
            },
          }
        )
      })
    },
    { scope: ref }
  )

  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span data-word="">{word}</span>
        </Fragment>
      ))}
    </p>
  )
}
