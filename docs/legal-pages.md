# Legal pages

The legal overview and its Privacy, Terms, Cookies, and Security documents use
CodeVault's shared public navigation, footer, typography, and color tokens.
The authored policies remain in `src/core/config/legal.ts` and the policy
components; presentation changes must preserve their sections and meaning.

The overview is a short editorial masthead followed by four numbered document
rows. On narrow screens the descriptions stack beneath the titles. No
photography is needed to explain the choices.

`LegalNav` composes the shared `Navbar` and `SectionNav`. The section navigation
scrolls horizontally when needed and identifies the current route with
`aria-current="page"`. The root legal route includes the common `Footer`.

`LegalDocument` provides the title, update date, contents, article, and return
links. It derives contents from direct `LegalSection` children. Desktop places
the contents beside the article; mobile exposes them with native `details` and
`summary`. Reading text remains constrained even though the public Container
is wider than the article. Anchors clear the sticky masthead.

Copy for this presentation lives in `legalPresentation` in
[`site.ts`](../src/core/config/site.ts). Use semantic colors and the shared fluid
type scale. Preserve visible focus, native disclosure behavior, and dark mode.

Verify all five routes and their local anchors in the running app, along with
mobile and desktop layout, keyboard access, and both color themes.
