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

Keep the `Research` link in `mainNav`. The site's full footer lists research under
`Writing` in `footerNav`. Research pages use the shared `Navbar` and a compact
[`ResearchShell`](../src/components/research/research-shell.tsx) footer.

The hero uses [`mountain.jpg`](../public/research/mountain.jpg), copied unchanged
from the user-requested `/v2` asset at `http://127.0.0.1:3000/images/mountain.jpg`.
Set it through `researchPage.image`; do not infer a location from the image.
Its minimum height is 34rem on mobile and `min(76svh, 48rem)` on desktop.
Keep directional shading light enough to preserve the environment. Use plain
sans-serif headings, shared `Container` spacing, and thin dividers. The scoped
[`research-surface` styles](../src/styles/globals.css) use 38–56px hero headings,
16px body, and 14–15px secondary text. Plain severity text uses scoped tokens
with dark variants: critical bold red, high orange, medium readable amber,
low green, and info blue, without badges or icons.

Place article facts on the right at desktop widths and in two columns above the
body on mobile. Keep PDF and advisory links in the article header, with the source
note after the timeline. Preserve dark mode, visible focus, and static content.

Run the [required checks](./code-rules.md#verification). Inspect the index, article,
unknown-slug response, and PDF download in the running app. Check mobile and
desktop layouts, keyboard navigation, and both color themes. Verify the new path
in `/sitemap.xml`.
