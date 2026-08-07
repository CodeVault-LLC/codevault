import { motion } from "framer-motion"

import { Meter } from "@/components/projects/meter"
import { evaluation } from "@/core/config/tex"
import { fadeUp, staggerContainer, viewportEdge } from "@/core/lib/motion"

// The three numbers, in the order they matter to a person: the last one is the
// only one anybody experiences, and it is the one the bars are read against.
const COLUMNS = [
  { key: "cold" as const, label: "Cold", note: "empty cache" },
  { key: "warm" as const, label: "Warm", note: "second build" },
  { key: "save" as const, label: "Save", note: "⌘S to page" },
]

/**
 * The benchmark corpus, as a table, because it is one.
 *
 * Bars sit under the figures rather than replacing them: the numbers are the
 * content and the bars only carry the shape — that the corpus spans two orders
 * of magnitude, and that the shape is the same in all three columns. On a
 * narrow viewport the table scrolls sideways rather than collapsing into cards,
 * which would lose the comparison the table exists to make.
 */
export function TimingTable() {
  return (
    <figure>
      <div className="border-faded overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[44rem] border-collapse text-left">
          <caption className="sr-only">
            Build times for six documents in the benchmark corpus, cold, warm
            and from save to corrected page.
          </caption>
          <thead>
            <tr className="border-faded border-b bg-ivory-medium">
              <th scope="col" className="px-5 py-3">
                <span className="font-mono text-detail-xs tracking-wider uppercase">
                  Document
                </span>
              </th>
              {COLUMNS.map((column) => (
                <th key={column.key} scope="col" className="w-40 px-5 py-3">
                  <span className="block font-mono text-detail-xs tracking-wider uppercase">
                    {column.label}
                  </span>
                  <span className="text-faded block font-mono text-detail-xs">
                    {column.note}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <motion.tbody
            variants={staggerContainer(0.06)}
            initial="hidden"
            whileInView="show"
            viewport={viewportEdge}
          >
            {evaluation.corpus.map((document) => (
              <motion.tr
                key={document.name}
                variants={fadeUp}
                className="border-faded border-b last:border-b-0"
              >
                <th scope="row" className="px-5 py-4 align-top font-normal">
                  <span className="block text-paragraph-s">
                    {document.name}
                  </span>
                  <span className="text-faded block font-mono text-detail-xs">
                    {document.detail}
                  </span>
                </th>
                {COLUMNS.map((column) => (
                  <td key={column.key} className="px-5 py-4 align-top">
                    <span className="block font-mono text-detail-xs tabular-nums">
                      {document[column.key]}
                    </span>
                    <Meter
                      value={document.weight[column.key]}
                      className="mt-2"
                    />
                  </td>
                ))}
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      <figcaption className="text-faded mt-4 text-paragraph-s text-pretty">
        Six of the twelve documents in the corpus. Bars are scaled within their
        own column, so they compare documents to each other and not the columns
        to one another.
      </figcaption>
    </figure>
  )
}
