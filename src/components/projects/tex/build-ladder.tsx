import { motion } from "framer-motion"

import { Meter } from "@/components/projects/meter"
import { build, buildTotalMs } from "@/core/config/tex"
import { fadeUp, staggerContainer, viewportEdge } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

/**
 * One build, rung by rung.
 *
 * The bars are proportional within this build, not across the corpus — the
 * point they carry is that a single engine pass is most of the wall clock and
 * everything around it is bookkeeping. Steps that were restored rather than
 * run are marked and drawn in olive: they are the only reason the total at the
 * foot is under a second, and the page would be dishonest if they looked the
 * same as work that actually happened.
 */
export function BuildLadder() {
  return (
    <figure>
      <p className="text-faded font-mono text-detail-xs uppercase">
        {build.reference}
      </p>

      <motion.ol
        variants={staggerContainer(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={viewportEdge}
        className="border-faded mt-5 flex flex-col border-l"
      >
        {build.steps.map((step) => (
          <motion.li
            key={step.code}
            variants={fadeUp}
            className="relative py-6 pl-6 md:pl-8"
          >
            {/* The rung. Olive where the step was restored from cache. */}
            <span
              aria-hidden
              className={cn(
                "absolute top-8 left-0 h-px w-3 md:w-4",
                step.cached ? "bg-olive" : "bg-foreground/30"
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[2rem_1fr_13rem] md:items-baseline md:gap-8">
              <span className="text-faded font-mono text-detail-xs tabular-nums">
                {step.code}
              </span>

              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-display-xs font-semibold">{step.name}</h3>
                  {step.cached && (
                    <span className="font-mono text-detail-xs text-olive uppercase">
                      restored
                    </span>
                  )}
                </div>
                <p className="mt-2 max-w-2xl text-paragraph-s text-pretty text-muted-foreground">
                  {step.body}
                </p>
              </div>

              <div className="md:text-right">
                <p className="font-mono text-detail-xs tabular-nums">
                  {step.ms} ms
                </p>
                <Meter
                  value={step.weight}
                  className="mt-2"
                  barClassName={step.cached ? "bg-olive/70" : undefined}
                />
              </div>
            </div>
          </motion.li>
        ))}
      </motion.ol>

      <div className="border-faded mt-2 flex flex-wrap items-baseline justify-between gap-4 border-t pt-5">
        <p className="font-mono text-detail-xs tracking-wider uppercase">
          Save to corrected page
        </p>
        <p className="text-display-m font-semibold tabular-nums">
          {buildTotalMs} ms
        </p>
      </div>

      <figcaption className="text-faded mt-4 text-paragraph-s text-pretty">
        The same document from an empty cache takes {build.cold}. Nothing about
        the engine changed between those two numbers.
      </figcaption>
    </figure>
  )
}
