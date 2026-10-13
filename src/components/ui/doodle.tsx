import { useRef } from "react"

import { gsap, motionQuery, reveal, useGSAP } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

// Small line drawings that sit beside a heading or a point and draw
// themselves in once, the first time they scroll into view. They speak the
// product's language: square terminals, stepped routes, things in the way.
//
// Inside a drawing: `data-draw` strokes are drawn along their length, in
// order; `data-fade` (dashed lines, which can't be drawn that way) fade in;
// `data-pop` shapes pop in last. With reduced motion the drawing is simply
// there.

const ROUTE = "stroke-persimmon-strong dark:stroke-persimmon"

const DRAWINGS = {
  /** A suggested route over its ghost, then accepted. */
  preview: (
    <>
      <path
        data-fade=""
        d="M20 44 H46 Q54 44 54 36 V28 Q54 20 62 20 H76"
        strokeDasharray="3 4"
        className="stroke-faint"
      />
      <path
        data-draw=""
        d="M20 44 H46 Q54 44 54 36 V28 Q54 20 62 20 H76"
        className={ROUTE}
        strokeWidth={2.5}
      />
      <path data-draw="" d="M60 50 l5 5 l10 -11" />
      <rect
        data-pop=""
        fill="currentColor"
        x={8}
        y={38}
        width={12}
        height={12}
      />
      <rect
        data-pop=""
        fill="currentColor"
        x={76}
        y={14}
        width={12}
        height={12}
      />
    </>
  ),
  /** Around what's set to Avoid. */
  avoid: (
    <>
      <g data-fade="" strokeDasharray="3 3" className="stroke-faint">
        <rect x={34} y={10} width={24} height={28} />
        <path d="M34 10 L58 38 M58 10 L34 38" />
      </g>
      <path
        data-draw=""
        d="M20 50 H64 Q72 50 72 42 V24 Q72 16 80 16"
        className={ROUTE}
        strokeWidth={2.5}
      />
      <rect
        data-pop=""
        fill="currentColor"
        x={8}
        y={44}
        width={12}
        height={12}
      />
      <rect
        data-pop=""
        fill="currentColor"
        x={80}
        y={10}
        width={12}
        height={12}
      />
    </>
  ),
  /** Two boxes in a wall, joined over the top. */
  elbow: (
    <>
      <path data-draw="" d="M4 58 H92" />
      <path
        data-draw=""
        d="M26 36 V18 Q26 10 34 10 H62 Q70 10 70 18 V36"
        className={ROUTE}
        strokeWidth={2.5}
      />
      <rect
        data-pop=""
        fill="currentColor"
        x={19}
        y={36}
        width={14}
        height={16}
      />
      <rect
        data-pop=""
        fill="currentColor"
        x={63}
        y={36}
        width={14}
        height={16}
      />
    </>
  ),
  /** A route that ends where the page should have been. */
  loose: (
    <>
      <path
        data-draw=""
        d="M20 44 H44 Q52 44 52 36 V24"
        className={ROUTE}
        strokeWidth={2.5}
      />
      <path data-draw="" d="M46 22 H58" />
      <rect
        data-pop=""
        fill="currentColor"
        x={8}
        y={38}
        width={12}
        height={12}
      />
      <rect
        data-fade=""
        x={76}
        y={14}
        width={12}
        height={12}
        strokeDasharray="3 3"
        className="stroke-faint"
      />
    </>
  ),
  /** An envelope, with a run leaving it. */
  letter: (
    <>
      <rect data-draw="" x={8} y={16} width={44} height={32} rx={2} />
      <path data-draw="" d="M8 18 L30 34 L52 18" />
      <path
        data-draw=""
        d="M52 40 H66 Q74 40 74 32 V22 Q74 14 82 14"
        className={ROUTE}
        strokeWidth={2.5}
      />
      <rect
        data-pop=""
        fill="currentColor"
        x={82}
        y={8}
        width={12}
        height={12}
      />
    </>
  ),
} satisfies Record<string, React.ReactNode>

export type DoodleName = keyof typeof DRAWINGS

export function Doodle({
  name,
  className,
}: {
  name: DoodleName
  className?: string
}) {
  const ref = useRef<SVGSVGElement>(null)

  useGSAP(
    () => {
      const svg = ref.current
      if (!svg) return
      const mm = gsap.matchMedia()
      mm.add(motionQuery.ok, () => {
        const q = (sel: string) =>
          gsap.utils.toArray<SVGGeometryElement>(sel, svg)
        const tl = gsap.timeline({
          scrollTrigger: { trigger: svg, start: reveal.start, once: true },
        })
        tl.from(q("[data-fade]"), { opacity: 0, duration: 0.5 }, 0)
        q("[data-draw]").forEach((el, i) => {
          const length = el.getTotalLength()
          tl.fromTo(
            el,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" },
            i === 0 ? 0.1 : "<0.3"
          )
        })
        tl.from(
          q("[data-pop]"),
          {
            scale: 0,
            transformOrigin: "50% 50%",
            duration: 0.4,
            ease: "back.out(2.5)",
            stagger: 0.1,
          },
          "-=0.35"
        )
      })
    },
    { scope: ref }
  )

  return (
    <svg
      ref={ref}
      viewBox="0 0 96 64"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-12 w-auto overflow-visible", className)}
    >
      {DRAWINGS[name]}
    </svg>
  )
}
