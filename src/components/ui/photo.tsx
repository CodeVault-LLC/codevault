import { useRef } from "react"

import type { Image } from "@/core/config/images"
import { gsap, motionQuery, useGSAP } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

/**
 * A photograph, cropped to its frame. The first time it scrolls into view it
 * settles: a slow fade while it eases back from a slight zoom. `priority`
 * photos are near the top of the page, so they load first and only fade in
 * with the rest of the hero.
 */
export function Photo({
  image,
  sizes,
  className,
  priority = false,
}: {
  image: Image
  /** How wide it's shown, as an `<img sizes>` value. */
  sizes: string
  /** Sets the frame: its size or aspect ratio, corners and grid placement. */
  className?: string
  priority?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (priority) return
      const img = ref.current?.querySelector("img")
      const mm = gsap.matchMedia()
      mm.add(motionQuery.ok, () => {
        gsap.fromTo(
          img ?? [],
          { opacity: 0, scale: 1.06 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 88%",
              once: true,
            },
          }
        )
      })
    },
    { scope: ref }
  )

  const src = (width: number) => `/images/${image.name}-${width}.webp`

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden rounded-3xl bg-surface", className)}
    >
      <img
        src={src(1536)}
        srcSet={`${src(960)} 960w, ${src(1536)} 1536w`}
        sizes={sizes}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className="size-full object-cover"
      />
    </div>
  )
}
