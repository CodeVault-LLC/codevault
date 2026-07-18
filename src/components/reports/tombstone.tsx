import type { TombstoneProps } from "./types"
import { formatDate } from "./format"
import { reportsArchive } from "@/core/config/reports"

/**
 * The tombstone notice on a withdrawn record (design §4.5).
 *
 * It sits above the record rather than replacing it, because a tombstone is
 * required to carry the full bibliographic citation — the point is that someone
 * arriving from a footnote can still confirm what was cited, and confirm that
 * it is gone. Hiding the metadata would break the citation this page exists to
 * keep resolving.
 *
 * `role="status"` rather than `alert`: this is a permanent property of the
 * record, not something that just happened to the reader. An alert interrupts;
 * a status is announced in turn.
 */
export function Tombstone({ withdrawnAt, withdrawnReason }: TombstoneProps) {
  const { tombstone } = reportsArchive

  return (
    <section
      role="status"
      aria-labelledby="tombstone-heading"
      // Clay rather than olive. Olive is the archive's one alive colour and it
      // means "this is good"; a withdrawal is neither an error nor a success,
      // and borrowing destructive red would overstate it.
      className="mt-6 rounded-lg border border-clay/40 bg-clay/8 px-4 py-3"
    >
      <h2 id="tombstone-heading" className="text-paragraph-s font-semibold">
        {tombstone.heading}
      </h2>

      <p className="text-faded mt-2 text-paragraph-s text-pretty">
        {tombstone.body}
      </p>

      <dl className="mt-3 flex flex-col gap-1 text-detail-xs">
        {withdrawnAt && (
          <div className="flex gap-2">
            <dt className="text-faded">{tombstone.dateLabel}</dt>
            {/* A machine-readable date beside the human one — the other half of
                "human- and machine-readable" that the identifier already has. */}
            <dd className="font-mono">
              <time dateTime={withdrawnAt.toISOString()}>
                {formatDate(withdrawnAt.toISOString().slice(0, 10))}
              </time>
            </dd>
          </div>
        )}

        <div className="flex gap-2">
          <dt className="text-faded">{tombstone.reasonLabel}</dt>
          <dd className="text-pretty">
            {withdrawnReason || tombstone.noReason}
          </dd>
        </div>
      </dl>
    </section>
  )
}
