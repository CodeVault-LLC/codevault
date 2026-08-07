import { motion } from "framer-motion"

import { Meter } from "@/components/projects/meter"
import { detectors } from "@/core/config/seamark"
import { fadeUp, staggerContainer, viewportEdge } from "@/core/lib/motion"

/**
 * The six rules, each with the thing it cannot tell apart printed underneath
 * it at the same weight as the thing it catches.
 *
 * That symmetry is the point of the component. A detector list that shows only
 * what each rule finds reads as a capability list; showing the confounder in
 * the same breath is closer to how the project actually talks about them.
 */
export function DetectorRail() {
  return (
    <motion.ol
      variants={staggerContainer(0.07)}
      initial="hidden"
      whileInView="show"
      viewport={viewportEdge}
      className="border-faded bg-faded flex flex-col gap-px overflow-hidden rounded-2xl border"
    >
      {detectors.map((d) => (
        <motion.li
          key={d.code}
          variants={fadeUp}
          className="bg-ivory-light p-6 md:p-8"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[7rem_1fr] md:gap-10">
            <div>
              <p className="font-mono text-detail-xs font-medium tracking-wider uppercase">
                {d.code}
              </p>
              <div className="mt-3 flex items-center gap-3 md:mt-4 md:flex-col md:items-start md:gap-2">
                <Meter value={d.share} className="md:w-full" />
                <span className="text-faded font-mono text-detail-xs tabular-nums">
                  {Math.round(d.share * 100)}% of cases
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-display-xs font-semibold">{d.name}</h3>
              <p className="mt-2 max-w-2xl text-paragraph-s text-pretty text-foreground/80">
                {d.watches}
              </p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {d.inputs.map((input) => (
                  <li
                    key={input}
                    className="border-faded text-faded rounded-full border px-2.5 py-1 font-mono text-detail-xs"
                  >
                    {input}
                  </li>
                ))}
              </ul>

              <div className="border-faded mt-5 border-l pl-4">
                <p className="text-faded font-mono text-detail-xs uppercase">
                  What it confuses this with
                </p>
                <p className="mt-1.5 max-w-2xl text-paragraph-s text-pretty text-muted-foreground">
                  {d.confounder}
                </p>
              </div>
            </div>
          </div>
        </motion.li>
      ))}
    </motion.ol>
  )
}
