import type { HighwireTagsProps } from "./types"
import { highwireTags } from "@/core/reports/highwire"
import { site } from "@/core/config/site"

// Rendered as plain <meta> elements rather than through the route's `head`
// option, deliberately.
//
// TanStack Router dedupes head meta by `name`, keeping the first tag with a
// given name and dropping the rest. `citation_author` must be repeated once per
// author, so going through `head` would silently ship a paper with one author —
// exactly the kind of failure that is invisible until Scholar has already
// indexed it wrong. React 19 hoists <meta> into <head> during SSR, so these
// land in the server-rendered HTML, which is where Scholar needs them
// (design §12).
export function HighwireTags({ report }: HighwireTagsProps) {
  const tags = highwireTags(report, {
    institution: site.name,
    baseUrl: site.url,
  })

  return (
    <>
      {tags.map((tag, index) => (
        // Authors repeat, so the name alone is not a key.
        <meta
          key={`${tag.name}-${index}`}
          name={tag.name}
          content={tag.content}
        />
      ))}
    </>
  )
}
