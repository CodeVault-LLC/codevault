# Design rules

How to use the [design system](./design-system.md) well. These are the
standards a change to the UI is held to.

## Principles

1. **Quiet by default.** Whitespace and typography do the work. Reach for a
   border, shadow, or color only when it earns its place. If a section looks
   busy, remove something.
2. **One accent, used sparingly.** Olive is the only "alive" color. A page with
   olive everywhere has no accent at all. Same for the serif-italic heading
   word: one per heading.
3. **Editorial, not app-like.** We're closer to a well-set magazine page than a
   SaaS dashboard. Favor reading rhythm over dense control panels.
4. **Honest states.** Show real, in-progress, or unfinished things as what they
   are. Don't dress an experiment up as a shipped product (that's the brand —
   see [overview](./overview.md)).

## Rules

- **Tokens only.** No raw hex, no arbitrary `text-[17px]` unless there's a real
  reason and a comment. Use swatches, semantic tokens, and the type scale.
- **Semantic tokens for structure**, named swatches only for deliberate brand
  moments — so dark mode and future re-themes keep working.
- **Type scale for all text.** `text-display-*`, `text-paragraph-*`,
  `text-detail-xs`. Don't set `font-size` by hand.
- **Wrap content in `Container`.** Don't hand-roll max-widths and horizontal
  padding.
- **Reuse motion variants** from `motion.ts`. Standard easing `[0.22,1,0.36,1]`,
  ~0.4–0.6s. New bespoke animations need a reason.
- **Reduced motion is not optional.** Every entrance/transform must degrade
  gracefully under `useReducedMotion()`.
- **Responsive by default.** Design mobile-up. Test the small breakpoint — the
  navbar's missing mobile menu was a real bug; don't reintroduce that class of
  gap. Nothing should require a wide viewport to be usable.
- **Accessibility is part of "done":** semantic elements (`<nav>`, `<section>`
  with `aria-labelledby`, `<ol>`/`<ul>` for lists), labelled controls
  (`aria-label`, `aria-expanded`), visible focus (`focus-visible:ring-*`),
  meaningful `alt`/`aria` on media, sufficient contrast.
- **Dark mode works.** If you add color, verify the `.dark` result too.

## Copy inside the UI

Copy is design. Follow the voice in [overview.md](./overview.md): plain,
understated, curious, never salesy. Keep user-facing strings in
[`site.ts`](../src/core/config/site.ts) where they're config-driven, so the
message stays consistent and easy to revise.

## Definition of done for a UI change

- [ ] Uses tokens and the type scale (no stray hex / raw sizes).
- [ ] Looks right at mobile and desktop widths.
- [ ] Works in light **and** dark mode.
- [ ] Motion reuses shared variants and respects reduced motion.
- [ ] Keyboard-navigable with visible focus; semantics and labels correct.
- [ ] Copy matches the CodeVault voice.
- [ ] Verified in the running app, not just typecheck (see
      [code-rules.md](./code-rules.md#verification)).
