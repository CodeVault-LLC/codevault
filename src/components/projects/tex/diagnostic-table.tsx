import { motion } from "framer-motion"

import { diagnostics } from "@/core/config/tex"
import type { Diagnostic } from "@/core/config/tex"
import { fadeUp, staggerContainer, viewportEdge } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

// Clay is the warm accent and is spent here on errors only. A warning that
// looks like an error is how a problem list stops being read.
const toneBySeverity: Record<Diagnostic["severity"], string> = {
  Error: "text-clay",
  Warning: "text-foreground/70",
  Hint: "text-faded",
}

/**
 * The engine's transcript on the left, the sentence we put in the problem list
 * on the right.
 *
 * The left column is set as the log actually arrives — monospaced, wrapped
 * where the engine wrapped it, indentation and all. Cleaning it up would make
 * the comparison flattering and pointless: the whole claim of this section is
 * that the thing on the left is what everybody currently reads.
 */
export function DiagnosticTable() {
  return (
    <motion.ol
      variants={staggerContainer(0.07)}
      initial="hidden"
      whileInView="show"
      viewport={viewportEdge}
      className="border-faded bg-faded flex flex-col gap-px overflow-hidden rounded-2xl border"
    >
      {diagnostics.map((d) => (
        <motion.li
          key={d.log}
          variants={fadeUp}
          className="bg-faded grid grid-cols-1 gap-px md:grid-cols-2"
        >
          <div className="bg-ivory-medium p-5 md:p-6">
            <p className="text-faded font-mono text-detail-xs uppercase">
              What the log says
            </p>
            <pre className="mt-3 overflow-x-auto font-mono text-detail-xs text-foreground/70">
              {d.log}
            </pre>
          </div>

          <div className="bg-ivory-light p-5 md:p-6">
            <p
              className={cn(
                "font-mono text-detail-xs uppercase",
                toneBySeverity[d.severity]
              )}
            >
              {d.severity}
            </p>
            <p className="mt-3 text-paragraph-s text-pretty">{d.message}</p>
            {d.fix && (
              <p className="mt-3 text-paragraph-s text-pretty text-muted-foreground">
                {d.fix}
              </p>
            )}
          </div>
        </motion.li>
      ))}
    </motion.ol>
  )
}
