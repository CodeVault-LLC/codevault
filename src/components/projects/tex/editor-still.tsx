import { motion } from "framer-motion"

import { editorStill } from "@/core/config/tex"
import { fadeUp, staggerContainer, viewportEdge } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

// Clay is the site's warm accent and gets spent here on exactly one thing: the
// line the editor thinks is broken. The caret line is a surface change only —
// where you are is not a status.
const severityTone = {
  Error: "text-clay",
  Warning: "text-foreground/70",
  Hint: "text-faded",
} as const

/**
 * A still of the editor, mid-sentence.
 *
 * Nothing here is interactive and the caption says so. It earns its place by
 * showing the two things the prose can only assert: that a diagnostic points
 * at the line that caused it, and that the rendered equation sits beside the
 * source rather than replacing it.
 */
export function EditorStill() {
  return (
    <figure>
      <div className="border-faded overflow-hidden rounded-2xl border bg-ivory-light">
        {/* Chrome. Deliberately thin — a title bar with buttons on it would be
            drawing an application, and this is drawing a document. */}
        <div className="border-faded flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b bg-ivory-medium px-5 py-3">
          <p className="font-mono text-detail-xs tracking-wider uppercase">
            {editorStill.file}
          </p>
          <p className="text-faded font-mono text-detail-xs uppercase">
            root {editorStill.root} · pdfTeX
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem]">
          {/* Source */}
          <motion.ol
            variants={staggerContainer(0.03)}
            initial="hidden"
            whileInView="show"
            viewport={viewportEdge}
            className="overflow-x-auto py-4"
          >
            {editorStill.lines.map((line) => {
              const isCaret = line.n === editorStill.caret
              const isProblem = line.n === editorStill.problem

              return (
                <motion.li
                  key={line.n}
                  variants={fadeUp}
                  className={cn(
                    "flex min-w-max items-baseline gap-4 px-5 py-0.5",
                    isCaret && "bg-ivory-medium"
                  )}
                >
                  <span className="text-faded w-8 shrink-0 text-right font-mono text-detail-xs tabular-nums">
                    {line.n}
                  </span>
                  <code
                    className={cn(
                      "font-mono text-detail-xs whitespace-pre",
                      isProblem &&
                        "underline decoration-clay decoration-wavy underline-offset-4"
                    )}
                  >
                    {line.text || " "}
                    {isCaret && (
                      <span
                        aria-hidden
                        className="ml-px inline-block h-3.5 w-px translate-y-0.5 bg-foreground"
                      />
                    )}
                  </code>
                </motion.li>
              )
            })}
          </motion.ol>

          {/* The two things the editor is saying about the file right now. */}
          <aside className="border-faded flex flex-col gap-6 border-t p-5 lg:border-t-0 lg:border-l">
            <div>
              <p className="text-faded font-mono text-detail-xs uppercase">
                Under the caret
              </p>
              <p className="mt-3 font-serif text-display-xs">
                {editorStill.rendered}
              </p>
              <p className="text-faded mt-2 font-mono text-detail-xs">
                rendered · source unchanged
              </p>
            </div>

            <div className="border-faded border-t pt-5">
              <p className="text-faded font-mono text-detail-xs uppercase">
                Problems · {editorStill.problems.length}
              </p>
              <ul className="mt-3 flex flex-col gap-3">
                {editorStill.problems.map((problem) => (
                  <li key={problem.line}>
                    <p
                      className={cn(
                        "font-mono text-detail-xs uppercase tabular-nums",
                        severityTone[problem.severity]
                      )}
                    >
                      {problem.severity} · line {problem.line}
                    </p>
                    <p className="mt-1 text-paragraph-s text-pretty text-foreground/80">
                      {problem.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <figcaption className="text-faded mt-4 text-paragraph-s text-pretty">
        A picture of the editor, not the editor. Ten lines of a chapter, one
        misspelled command, and a citation that has not been rebuilt yet.
      </figcaption>
    </figure>
  )
}
