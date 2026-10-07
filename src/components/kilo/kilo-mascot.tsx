import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"
import {
  kiloBodyPath,
  kiloEyeHeight,
  kiloEyeWidth,
  kiloEyeY,
  kiloEyes,
} from "./artwork"

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
  const reduce = useReducedMotion()
  const animate = mode === "greeting" && !reduce
  const origin = {
    transformBox: "view-box",
    transformOrigin: "32px 55px",
  } as const

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={cn("size-16 shrink-0 overflow-visible", className)}
    >
      <motion.g
        style={origin}
        initial={
          animate ? { y: 7, rotate: -9, scaleX: 1.04, scaleY: 0.93 } : false
        }
        animate={
          animate
            ? {
                y: [7, -3, -3, 0],
                rotate: [-9, 4, 4, 0],
                scaleX: [1.04, 1, 1, 1],
                scaleY: [0.93, 1, 1, 1],
              }
            : undefined
        }
        transition={{
          duration: 1.25,
          times: [0, 0.48, 0.56, 1],
          ease: "easeOut",
          delay: 0.3,
        }}
      >
        <path d={kiloBodyPath} className="fill-clay" />
        <motion.g
          className="fill-slate"
          initial={animate ? { x: 0, y: 0 } : false}
          animate={
            animate ? { x: [0, 1.8, 1.8, 0], y: [0, 1, 1, 0] } : undefined
          }
          transition={{ duration: 1.1, times: [0, 0.3, 0.7, 1], delay: 0.7 }}
        >
          {kiloEyes.map((x) => (
            <motion.rect
              key={x}
              x={x}
              y={kiloEyeY}
              width={kiloEyeWidth}
              height={kiloEyeHeight}
              rx={kiloEyeWidth / 2}
              style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              animate={animate ? { scaleY: [1, 1, 0.12, 1] } : undefined}
              transition={{
                duration: 4.2,
                times: [0, 0.94, 0.97, 1],
                repeat: Infinity,
                delay: 1.1,
              }}
            />
          ))}
        </motion.g>
      </motion.g>
    </svg>
  )
}
