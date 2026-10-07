# Add a research finding

Use the existing research pages for factual accounts of CodeVault's independent
work. Follow the [voice](./overview.md), [design system](./design-system.md), and
[design rules](./design-rules.md).

1. Add an entry to `researchFindings` in
   [`site.ts`](../src/core/config/site.ts). Give it a unique `slug` and a matching
   `path` of `/research/<slug>`.
2. Fill in the summary, introduction, metadata, sections, disclosure timeline,
   advisory link, and source note. Separate CodeVault's confirmed test scope from
   claims attributed to external advisories. Record known dates without implying
   an unverified submission date, discovery credit, or affected-version range.
3. Add a separate public PDF to [`public/research/reports`](../public/research/reports).
   Set the entry's `pdf` to `/research/reports/<filename>.pdf` and supply its
   `advisoryLabel`. Match the article's scope and dates. Distinguish a public
   summary from the original vendor report.
4. Edit shared headings and controls in `researchPage` when needed. Keep article
   content in the finding entry.

The [index](../src/components/research/research-index.tsx) lists every configured
finding. The [dynamic route](../src/routes/research.$slug.tsx) selects an entry by
slug and renders the shared [article](../src/components/research/research-article.tsx).
Unknown slugs return not found. Article metadata uses the entry's title, summary,
and path. The [sitemap](../src/routes/sitemap%5B.%5Dxml.ts) includes the index and
every finding path from the same config. A new finding needs no additional route.

Keep the `Research` link in `navigation.links`. Research uses the same Navbar
and Footer as the other public pages. The index opens with an editorial title,
an illustrated featured finding, and a publication list. The feature links
straight to its article; PDF and advisory links remain available in the list.

Use the shared public type scale and Container. Severity text uses scoped
tokens with dark variants: critical red, high orange, medium readable amber,
low green, and info blue. Keep facts, dates, scores, and source attribution
unchanged when adjusting presentation.

Articles use a left-aligned title and introduction, with a narrow metadata
rail beside the body on desktop. On mobile the rail follows the article.
Keep PDF and advisory links in the header and the source note after the timeline.

Run the [required checks](./code-rules.md#verification). Inspect the index, article,
unknown-slug response, and PDF download in the running app. Check mobile and
desktop layouts, keyboard navigation, and both color themes. Verify the new path
in `/sitemap.xml`.
