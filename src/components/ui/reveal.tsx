import { motion } from "framer-motion"

import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

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
  return (
    <motion.div
      className={className}
      variants={stagger ? staggerContainer(0.08) : fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
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
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  )
}
