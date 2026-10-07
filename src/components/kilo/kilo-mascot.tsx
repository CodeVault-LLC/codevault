import { useRef } from "react"

import { gsap, motionQuery, useGSAP } from "@/core/lib/motion"
import { cn } from "@/lib/utils"
import {
  kiloBodyPath,
  kiloEyeHeight,
  kiloEyeWidth,
  kiloEyeY,
  kiloEyes,
  kiloFoot,
} from "./artwork"

// The greeting starts crouched. It's set as an attribute so the server HTML
// already shows the crouch and hydration doesn't snap the mascot into it.
const crouch = { y: 5, rotation: -8, scaleX: 1.08, scaleY: 0.88 }
const feet = `${kiloFoot.x} ${kiloFoot.y}`
const crouchAttr =
  `translate(0 ${crouch.y}) rotate(${crouch.rotation} ${feet}) ` +
  `translate(${kiloFoot.x} ${kiloFoot.y}) scale(${crouch.scaleX} ${crouch.scaleY}) ` +
  `translate(${-kiloFoot.x} ${-kiloFoot.y})`

/**
 * Kilo's loop mascot. `greeting` plays Kilo's wake-and-glance once, then
 * blinks now and then. Decorative — the text beside it says what it means.
 */
export function KiloMascot({
  motion: mode = "still",
  className,
}: {
  motion?: "still" | "greeting"
  className?: string
}) {
  const root = useRef<SVGSVGElement>(null)
  const body = useRef<SVGGElement>(null)
  const eyes = useRef<SVGGElement>(null)
  const greeting = mode === "greeting"

  useGSAP(
    (_, contextSafe) => {
      if (!greeting || !body.current || !eyes.current || !contextSafe) return
      const lids = gsap.utils.toArray<SVGRectElement>("rect", eyes.current)
      const mm = gsap.matchMedia()

      mm.add(motionQuery.reduce, () => {
        // Stand up out of the server-rendered crouch, without moving.
        gsap.set(body.current, { svgOrigin: feet, y: 0, rotation: 0, scale: 1 })
      })

      mm.add(motionQuery.ok, () => {
        gsap.set(body.current, { svgOrigin: feet, ...crouch })
        gsap.set(lids, { svgOrigin: `0 ${kiloEyeY + kiloEyeHeight / 2}` })

        gsap
          .timeline({ delay: 0.35 })
          // Push off: stretch up past rest, leaning the other way.
          .to(body.current, {
            y: -4,
            rotation: 3,
            scaleX: 0.95,
            scaleY: 1.07,
            duration: 0.34,
            ease: "power2.out",
          })
          // Settle back onto the feet with a little give.
          .to(body.current, {
            y: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 0.9,
            ease: "elastic.out(1, 0.55)",
          })
          // A glance to the side and back, as if noticing the reader.
          .to(
            eyes.current,
            { x: 1.8, y: 0.8, duration: 0.28, ease: "power2.out" },
            0.55
          )
          .to(
            eyes.current,
            { x: 0, y: 0, duration: 0.45, ease: "power2.inOut" },
            ">0.5"
          )

        // Blinks at uneven intervals, sometimes twice.
        const later = contextSafe(() => {
          gsap.delayedCall(gsap.utils.random(2.4, 5.2), blink)
        })
        const blink = contextSafe(() => {
          const twice = Math.random() < 0.2
          gsap.to(lids, {
            scaleY: 0.12,
            duration: 0.07,
            ease: "power2.in",
            yoyo: true,
            repeat: twice ? 3 : 1,
            onComplete: later,
          })
        })
        gsap.delayedCall(2.2, blink)
      })
    },
    { scope: root }
  )

  return (
    <svg
      ref={root}
      viewBox="0 0 64 64"
      aria-hidden
      className={cn("size-16 shrink-0 overflow-visible", className)}
    >
      <g ref={body} transform={greeting ? crouchAttr : undefined}>
        <path d={kiloBodyPath} className="fill-clay" />
        <g ref={eyes} className="fill-slate">
          {kiloEyes.map((x) => (
            <rect
              key={x}
              x={x}
              y={kiloEyeY}
              width={kiloEyeWidth}
              height={kiloEyeHeight}
              rx={kiloEyeWidth / 2}
            />
          ))}
        </g>
      </g>
    </svg>
  )
}
