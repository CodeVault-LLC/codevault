import { motion } from "framer-motion"

import { queue } from "@/core/config/seamark"
import type { QueueRow } from "@/core/config/seamark"
import { fadeUp, staggerContainer, viewportEdge } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

// Olive is the site's "alive" accent, and on this page it is spent in one
// place: the states a person has put a case into. Everything the machine did
// is grey; everything a human decided is not.
const dotByState: Record<QueueRow["state"], string> = {
  Open: "bg-foreground/60",
  Watching: "bg-olive/50",
  Escalated: "bg-olive",
  Dismissed: "bg-cloud-dark",
}

/**
 * The shift queue, drawn as it appears to the analyst who opens it.
 *
 * This is a still of the tool rather than the tool — nothing here is
 * interactive, and the caption says so. It earns its place by showing the two
 * things the prose can only assert: that the queue is short enough to finish,
 * and that a case is ranked before it is explained.
 */
export function TriageQueue() {
  return (
    <figure>
      <div className="border-faded overflow-hidden rounded-2xl border">
        <div className="border-faded flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b bg-ivory-medium px-5 py-3">
          <p className="font-mono text-detail-xs tracking-wider uppercase">
            Shift queue · 14 July
          </p>
          <p className="text-faded font-mono text-detail-xs uppercase tabular-nums">
            23 open · capacity 25
          </p>
        </div>

        <motion.ul
          variants={staggerContainer(0.06)}
          initial="hidden"
          whileInView="show"
          viewport={viewportEdge}
          className="bg-faded flex flex-col gap-px"
        >
          {queue.map((row) => (
            <motion.li
              key={row.id}
              variants={fadeUp}
              className={cn(
                "bg-ivory-light px-5 py-4",
                row.state === "Dismissed" && "opacity-55"
              )}
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[1fr_auto] md:grid-cols-[13rem_1fr_auto_auto] md:items-center">
                <p className="font-mono text-detail-xs tabular-nums">
                  {row.id}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="text-paragraph-s">{row.vessel}</span>
                  <ul className="flex flex-wrap gap-1.5">
                    {row.detectors.map((code) => (
                      <li
                        key={code}
                        className="border-faded text-faded rounded border px-1.5 py-0.5 font-mono text-detail-xs"
                      >
                        {code}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-6">
                  <p className="font-mono text-detail-xs tabular-nums">
                    <span className="text-faded">score </span>
                    {row.score.toFixed(2)}
                  </p>
                  <p className="text-faded hidden font-mono text-detail-xs tabular-nums sm:block">
                    {row.age}
                  </p>
                </div>

                <p className="flex items-center gap-2 font-mono text-detail-xs uppercase md:justify-end">
                  <span
                    aria-hidden
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      dotByState[row.state]
                    )}
                  />
                  {row.state}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      <figcaption className="text-faded mt-4 text-paragraph-s text-pretty">
        A picture of the queue, not the queue. Five of the day&apos;s
        twenty-three cases, in the order a shift would meet them.
      </figcaption>
    </figure>
  )
}
