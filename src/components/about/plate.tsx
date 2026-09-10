import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion"
import { useRef } from "react"

import { Container } from "@/components/layout/container"
import { fadeIn, viewportOnce } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

type PlateProps = {
  src: string
  alt: string
  srcSet?: string
  priority?: boolean
  /** Shown under the image. Editorial, not a description — `alt` does that. */
  caption?: string
  /** Spans the viewport instead of sitting inside the container measure. */
  bleed?: boolean
  /** Aspect-ratio utility. Defaults to a 16/9 landscape. */
  aspect?: string
  className?: string
}

/**
 * A photograph used as editorial punctuation between sections.
 *
 * Photography is the one place this site gets loud, so plates are deliberately
 * rare — roughly one moment per page. The image sits on `bg-ivory-dark` so a
 * slow decode shows a warm block rather than a white flash.
 *
 * The image drifts slightly against the scroll. It's small on purpose: enough
 * that the page feels alive, not enough to notice it happening.
 */
export function Plate({
  src,
  alt,
  srcSet,
  priority = false,
  caption,
  bleed = false,
  aspect = "aspect-[16/9]",
  className,
}: PlateProps) {
  const reduceMotion = useReducedMotion() ?? false
  const frameRef = useRef<HTMLDivElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  })

  // The image is scaled past its frame so the drift can't expose an edge.
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"])

  const frame = (
    <div
      ref={frameRef}
      className={cn(
        "overflow-hidden bg-ivory-dark",
        !bleed && "border-faded border",
        className
      )}
    >
      <motion.img
        src={src}
        alt={alt}
        srcSet={srcSet}
        sizes={
          bleed ? "100vw" : "(min-width: 1152px) 1104px, calc(100vw - 48px)"
        }
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        style={reduceMotion ? undefined : { y, scale: 1.12 }}
        className={cn("w-full object-cover", aspect)}
      />
    </div>
  )

  return (
    <motion.figure
      variants={fadeIn}
      initial={false}
      whileInView="show"
      viewport={viewportOnce}
    >
      {bleed ? frame : <Container>{frame}</Container>}

      {caption && (
        <Container>
          <figcaption className="text-faded mx-auto mt-4 max-w-3xl text-paragraph-s text-pretty">
            {caption}
          </figcaption>
        </Container>
      )}
    </motion.figure>
  )
}
