import { motion } from "framer-motion"

import { Meter } from "@/components/projects/seamark/meter"
import { pipeline } from "@/core/config/seamark"
import { fadeUp, staggerContainer, viewportEdge } from "@/core/lib/motion"

/**
 * A day of traffic, narrowing.
 *
 * The bars are not to scale and say so in the config: 3.8 million messages
 * against 23 cases is six orders of magnitude, and a linear funnel would draw
 * five stages as one invisible line. The counts next to them are the honest
 * figures; the bars only carry the shape of the narrowing.
 */
export function StageFunnel() {
  return (
    <motion.ol
      variants={staggerContainer(0.07)}
      initial="hidden"
      whileInView="show"
      viewport={viewportEdge}
      className="flex flex-col"
    >
      {pipeline.map((stage) => (
        <motion.li
          key={stage.code}
          variants={fadeUp}
          className="border-faded border-t py-6 first:border-t-0 first:pt-0 md:py-7"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[2rem_1fr_14rem] md:items-baseline md:gap-8">
            <span className="text-faded font-mono text-detail-xs tabular-nums">
              {stage.code}
            </span>

            <div>
              <h3 className="text-display-xs font-semibold">{stage.name}</h3>
              <p className="mt-2 max-w-2xl text-paragraph-s text-pretty text-muted-foreground">
                {stage.body}
              </p>
            </div>

            <div className="md:text-right">
              <p className="font-mono text-detail-xs tabular-nums">
                {stage.value}
              </p>
              <Meter value={stage.weight} className="mt-2" />
            </div>
          </div>
        </motion.li>
      ))}
    </motion.ol>
  )
}
