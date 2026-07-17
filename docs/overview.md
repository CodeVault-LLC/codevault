# What CodeVault is

## In one line

> We point ourselves at tech, and see what happens.

## The stance

CodeVault is **not a product company**. We don't build one thing and sell it. We
are a small group of people who are curious about too many things to pick just
one — so we run **projects**.

We think about projects the way NASA thinks about missions. Every project is a
loop:

1. **Trial** — build something real enough to react to. A prototype, a spike, a
   weekend build.
2. **Experience** — live with it. What's annoying, surprising, or actually
   important only shows up once you use the thing.
3. **Adjustment** — change our minds freely. Most of what we learn arrives after
   the first version turns out to be wrong.
4. **Result** — share whatever we ended up with: a tool, a write-up, or just a
   repo. Then point ourselves at the next thing.

## "A bit of everything"

The only constant is that it's **tech**. We aren't tied to a single field. One
month it's serious developer tooling; the next it's a small browser game we
pushed to GitHub in an afternoon that does a few basic things. Both are valid
CodeVault work. The output ranges widely; the standard doesn't.

Everything is built **in the open** and **shared as-is**. We don't pretend an
experiment is a polished product. We show the trial and what we learned.

## How we talk

Our voice is **confident but understated, and never promotional**. We explain
what we're doing and why, the way a curious person talks about work they enjoy —
not the way a company markets a product.

Reference points (borrow the feeling, not the words):

- **Anthropic** — calm, plainspoken, mission-driven. Big claims stated quietly.
  No hype, no exclamation marks, no "revolutionary."
- **NASA** — projects and exploration. A sense of trying hard things in public
  and reporting honestly on how they went.

Copy rules of thumb:

- Prefer plain statements over slogans. The motto is deliberately indirect
  ("…and see what happens") — keep that curiosity in the rest of the copy.
- Say "projects," "experiments," "trying," "in the open." Avoid product-company
  language: "platform," "solution," "get started," "sign up," "enterprise-grade."
- Concrete beats abstract. "A small game about keeping satellites from
  colliding" beats "innovative interactive experiences."
- It's fine to admit something was hard, unfinished, or just interesting rather
  than useful.

## Where the identity lives in the code

Site-wide copy and structure are config-driven in
[`src/core/config/site.ts`](../src/core/config/site.ts): the tagline, nav labels
(Projects / Fields / Writing / About), the "Recent projects" cards, and the
footer. The homepage sections that carry the story are `hero`, `latest-releases`
(rendered as "Recent projects"), and `about` (the four-step loop) under
[`src/components/sections/`](../src/components/sections). Change the message in
those places, not in one-off strings scattered across components.
