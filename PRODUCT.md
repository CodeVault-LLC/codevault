# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who are curious about technical work and want to understand what was
tried, what changed, and what came out of it without being sold a product.

## Product Purpose

CodeVault documents small, real projects across technology. Each project is
shared as a trial, an experience, an adjustment, and a result. Success means a
reader can understand the work and its limits, whether the output is a tool, a
write-up, a repository, or an unfinished experiment.

## Positioning

CodeVault is not a product company. It is a public record of a small group
pointing itself at different parts of technology, building enough to learn from,
and sharing the outcome as it is.

## Operating Context

The public website contains editorial project pages, an archive of reports, and
short explanations of how the group works. Project pages may use a distinct
presentational treatment when that treatment helps explain the subject, while
remaining part of the same site.

## Capabilities and Constraints

- Public pages are rendered with TanStack Start, React, TypeScript, and Tailwind.
- Project content is config-driven and uses the shared page shell, navigation,
  footer, design tokens, and motion helpers.
- Public surfaces must be responsive, accessible, dark-mode-safe, and honest
  about incomplete work.
- The new Sandbox project explains a QEMU-based environment for safer
  AI-assisted vulnerability scanning and authorized security testing. Its
  source repository is `../sandbox`.
- Sandbox reduces risk; it does not make malware execution safe and is not ready
  for unrestricted hostile workloads or autonomous high-impact operations.

## Brand Commitments

Plain, understated, curious, and never promotional. Describe experiments and
projects rather than products, platforms, or solutions. Keep the warm editorial
CodeVault identity and state limitations without softening them.

## Evidence on Hand

- CodeVault product and voice documentation in `docs/overview.md`.
- CodeVault visual and implementation rules in `docs/design-system.md`,
  `docs/design-rules.md`, and `docs/code-rules.md`.
- Sandbox implementation, security model, architecture, tests, current-readiness
  assessment, and roadmap in `../sandbox`.
- No production accreditation, certification, customer evidence, or hostile
  workload approval is present and none may be implied.

## Product Principles

- Make the trial legible before making it impressive.
- Show evidence and limitations together.
- Let each project have a fitting form without leaving the CodeVault visual
  system.
- Prefer one clear sentence or diagram to a padded explanation.
- Share the real state of the work, including what remains unsafe or unfinished.

## Accessibility & Inclusion

Public pages must remain usable with keyboard navigation, reduced motion, dark
mode, and small screens. Interactive explanations must preserve their meaning
without hover or animation.
