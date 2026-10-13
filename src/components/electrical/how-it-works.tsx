import { useRef, useState } from "react"

import { electrical } from "@/core/config/electrical"
import { ScrollTrigger, gsap, motionQuery, useGSAP } from "@/core/lib/motion"
import { cn } from "@/lib/utils"
import { Container } from "@/components/layout/container"
import { RoutingScene } from "@/components/electrical/routing-scene"
import { Reveal } from "@/components/ui/reveal"

/**
 * "How it works": the steps scroll past a drawing that stays in view and
 * plays each one as it's read. One A→B route is picked, suggested, checked
 * and added, by the same router as everywhere else.
 *
 * On wide screens the drawing is pinned beside the steps; on narrow ones it
 * sits under the header and the steps pass beneath it. With reduced motion
 * the drawing shows the finished route and every step reads at full ink.
 */
export function HowItWorks() {
  const { heading, items } = electrical.principles
  const steps = useRef<HTMLOListElement>(null)
  const progress = useRef(0)
  // Until the page is interactive, every step reads at full ink.
  const [active, setActive] = useState<number | null>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(motionQuery.ok, () => {
        setActive(0)
        ScrollTrigger.create({
          trigger: steps.current,
          start: "top center",
          end: "bottom center",
          onUpdate: (self) => {
            progress.current = self.progress
            setActive(
              Math.min(
                items.length - 1,
                Math.floor(self.progress * items.length)
              )
            )
          },
        })
        return () => setActive(null)
      })
    },
    { scope: steps }
  )

  return (
    <Container id="how" className="scroll-mt-24 py-20 lg:py-28">
      <Reveal>
        <h2 className="mb-10 font-sans text-display-s font-semibold">
          {heading}
        </h2>
      </Reveal>
      <div className="grid lg:grid-cols-12 lg:gap-12">
        <div className="sticky top-16 z-10 -mx-4 bg-background px-4 pb-6 sm:-mx-8 sm:px-8 lg:top-[calc((100vh_-_min(28rem,60vh))/2)] lg:order-2 lg:col-span-7 lg:col-start-6 lg:mx-0 lg:self-start lg:bg-transparent lg:p-0">
          <div className="relative h-[38vh] overflow-hidden rounded-3xl bg-surface lg:h-[min(28rem,60vh)]">
            <RoutingScene order={["ab"]} progress={progress} />
          </div>
        </div>
        <ol ref={steps} className="lg:order-1 lg:col-span-4">
          {items.map((item, i) => (
            <li
              key={item.title}
              className={cn(
                "flex min-h-[55vh] flex-col justify-center transition-opacity duration-500 lg:min-h-[70vh]",
                active !== null && active !== i && "opacity-30"
              )}
              aria-current={active === i ? "step" : undefined}
            >
              <p className="mb-3 font-mono text-label text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mb-2 font-sans text-display-m font-semibold">
                {item.title}
              </h3>
              <p className="max-w-[40ch] text-paragraph-m text-foreground/85">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Container>
  )
}
