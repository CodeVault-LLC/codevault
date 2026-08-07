import { motion } from "framer-motion"

import { Keycap } from "@/components/projects/tex/keycap"
import { editing } from "@/core/config/tex"
import { fadeUp, staggerContainer, viewportEdge } from "@/core/lib/motion"

/**
 * The editing surface, one feature per row, with the observation that produced
 * it printed underneath at the same weight as the feature itself.
 *
 * That second paragraph is the component. A list of what an editor does reads
 * as a feature table and tells you nothing about the taste behind it; saying
 * what was watched, and what it cost someone, is closer to how the project
 * actually talks about its own decisions.
 */
export function EditingRail() {
  return (
    <motion.ol
      variants={staggerContainer(0.07)}
      initial="hidden"
      whileInView="show"
      viewport={viewportEdge}
      className="flex flex-col"
    >
      {editing.map((feature) => (
        <motion.li
          key={feature.name}
          variants={fadeUp}
          className="border-faded border-t py-7 first:border-t-0 first:pt-0 md:py-8"
        >
          <div className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-[1fr_18rem]">
            <div>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <h3 className="text-display-s font-semibold">{feature.name}</h3>
                {feature.keys && <Keycap keys={feature.keys} />}
              </div>
              <p className="mt-3 max-w-2xl text-paragraph-s text-pretty text-foreground/80">
                {feature.body}
              </p>
            </div>

            <div className="border-faded border-l pl-5 md:pl-6">
              <p className="text-faded font-mono text-detail-xs uppercase">
                Why it exists
              </p>
              <p className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                {feature.why}
              </p>
            </div>
          </div>
        </motion.li>
      ))}
    </motion.ol>
  )
}
