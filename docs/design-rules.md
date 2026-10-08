# Design rules

How to use the [design system](./design-system.md) well.

## Principles

1. **Quiet by default.** Whitespace and type do the work. Add a border,
   shadow or color only when it earns its place.
2. **One accent.** Persimmon belongs to Kilo and to moments that matter. A page
   with persimmon everywhere has no accent.
3. **Editorial, not app-like.** Closer to a well-set magazine page than a
   dashboard.
4. **Honest states.** In development is in development. See
   [overview](./overview.md).

## Rules

- **Tokens only.** No raw hex in components (illustration ink is the one
  documented exception) and no hand-set font sizes.
- **Semantic tokens for structure**, swatches only for brand moments.
- **Content in `Container`.** Don't hand-roll max widths.
- **Reduced motion is not optional.**
- **Responsive by default.** Check 375px. Nothing may scroll sideways.
- **Accessible:** semantic landmarks, one link per card (stretched), labelled
  controls, visible focus, decorative art `aria-hidden`.
- **Both themes.** If you add color, check dark mode.

## Definition of done for a UI change

- [ ] Tokens and the type scale only.
- [ ] Right at 375px and at desktop width; no horizontal scroll.
- [ ] Works in light and dark.
- [ ] Motion respects reduced motion.
- [ ] Keyboard-navigable with visible focus.
- [ ] Copy matches the voice.
- [ ] Seen in the running app, not just typechecked.
