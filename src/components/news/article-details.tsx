/**
 * The row under an article's title: its contents on one side, a few facts
 * about it on the other. Used by news posts and guides.
 */
export function ArticleDetails({
  contentsLabel,
  sections,
  rows,
}: {
  contentsLabel: string
  sections: { id: string; text: string }[]
  rows: { label: string; value: string }[]
}) {
  return (
    <div className="grid gap-8 border-y border-border py-6 sm:grid-cols-2 sm:gap-12">
      {sections.length > 0 ? (
        <nav aria-label={contentsLabel}>
          <p className="mb-3 font-mono text-label text-muted-foreground uppercase">
            {contentsLabel}
          </p>
          <ol className="space-y-2 font-sans text-caption">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="group inline-flex gap-2">
                  <span className="text-muted-foreground tabular-nums">
                    ({i + 1})
                  </span>
                  <span className="decoration-1 underline-offset-4 group-hover:underline">
                    {s.text}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : (
        <div />
      )}
      <dl>
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 first:pt-0 last:border-0"
          >
            <dt className="font-mono text-label text-muted-foreground uppercase">
              {row.label}
            </dt>
            <dd className="font-sans text-caption">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
