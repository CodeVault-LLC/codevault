import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowUpRight } from "lucide-react"

import { Plate } from "@/components/about/plate"
import { Container } from "@/components/layout/container"
import { ProjectShell } from "@/components/projects/project-shell"
import { StatusChip } from "@/components/projects/status-chip"
import { BaselineRules } from "@/components/projects/tex/baseline-rules"
import { BuildLadder } from "@/components/projects/tex/build-ladder"
import { DiagnosticTable } from "@/components/projects/tex/diagnostic-table"
import { EditingRail } from "@/components/projects/tex/editing-rail"
import { EditorStill } from "@/components/projects/tex/editor-still"
import { SavePlate } from "@/components/projects/tex/save-plate"
import { SpecimenSection } from "@/components/projects/tex/section"
import { TimingTable } from "@/components/projects/tex/timing-table"
import { getProject, nextProject, projectPath } from "@/core/config/projects"
import {
  build,
  buildTotalMs,
  diagnosticsNote,
  evaluation,
  glossary,
  lede,
  limits,
  model,
  name,
  panel,
  preview,
  references,
  sheet,
  status,
} from "@/core/config/tex"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

const project = getProject("tex")!

// Style: type specimen. Where the dossier reads as a flight report, the journal
// as a diary and the chart as a published sheet, this one reads as a specimen
// page — a baseline grid behind the masthead, folios out in the left margin,
// and the measure held beside each panel.
//
// The subject is a tool for setting documents, so the page is set like one.
// That is the whole conceit, and it is also the reason the page is long: most
// of what makes this project interesting is a build pipeline and a translation
// layer, neither of which survives being summarised into four cards.
export function TexPage() {
  const next = nextProject(project.slug)

  return (
    <ProjectShell>
      <article>
        {/* Masthead */}
        <section className="border-faded relative overflow-hidden border-b bg-ivory-medium">
          <BaselineRules />
          <Container className="relative py-14 md:py-20">
            <motion.div
              variants={staggerContainer(0.07)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
            >
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap items-baseline justify-between gap-4"
              >
                <Link
                  to="/projects"
                  className="text-faded inline-flex items-center gap-1.5 font-mono text-detail-xs uppercase transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  All projects
                </Link>
                <p className="text-faded font-mono text-detail-xs uppercase tabular-nums">
                  TEX-01 · v0.5.0 · macOS &amp; Linux · MIT
                </p>
              </motion.div>

              {/* Set the way the original sets it: the E dropped below the
                  baseline. The offset is a typographic decision rather than a
                  spacing one, which is why it is a hand-set value; the name is
                  read out plainly for anything that isn't looking at it. */}
              <motion.h1
                variants={fadeUp}
                className="mt-10 text-display-xxl font-semibold"
              >
                <span aria-hidden>
                  T
                  <span className="-mx-[0.06em] inline-block translate-y-[0.22em]">
                    E
                  </span>
                  X
                </span>
                <span className="sr-only">TeX</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-faded mt-4 max-w-2xl font-mono text-detail-xs uppercase"
              >
                An editor for LaTeX, and the build system underneath it
              </motion.p>

              <motion.p
                variants={fadeUp}
                className="mt-8 max-w-3xl text-paragraph-l text-pretty text-muted-foreground"
              >
                {lede}
              </motion.p>

              <motion.p
                variants={fadeUp}
                className="mt-6 max-w-3xl text-paragraph-m text-pretty text-foreground/80"
              >
                It does not typeset anything — every page here is set by the
                same engines everyone else runs. Everything below is in service
                of one question: what has to be true before a writer{" "}
                <span className="font-serif font-normal italic">trusts</span> a
                tool with the document they are going to be judged on?
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <StatusChip status={project.status} />
                <span className="text-faded font-mono text-detail-xs uppercase">
                  {project.field}
                </span>
              </motion.div>
            </motion.div>
          </Container>

          {/* Masthead figures — the four numbers the page is built around. */}
          <div className="border-faded relative border-t">
            <Container>
              <dl className="grid grid-cols-2 md:grid-cols-4">
                {[
                  { label: "Full rebuild", value: build.cold },
                  { label: "Save to page", value: `${buildTotalMs} ms` },
                  { label: "Parse, per keystroke", value: "4 ms" },
                  { label: "Log lines shown", value: "2 of 2,900" },
                ].map((figure) => (
                  <div
                    key={figure.label}
                    className="border-faded border-r border-b py-5 pr-4 last:border-r-0 md:border-b-0 md:py-6"
                  >
                    <dt className="text-faded font-mono text-detail-xs uppercase">
                      {figure.label}
                    </dt>
                    <dd className="mt-1.5 text-display-xs font-semibold tabular-nums">
                      {figure.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Container>
          </div>
        </section>

        {/* Wikimedia Commons: "Weldon Spring letterpress" (Unsplash), CC0 1.0 —
            attribution not required. */}
        <Plate
          bleed
          src="/stock/letterpress-type-case.avif"
          alt="A letterpress type case in shallow focus, dozens of compartments holding upright metal sorts on a pale wooden tray."
          aspect="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
        />

        {/* Contents */}
        <Container className="py-14 md:py-16">
          <motion.nav
            aria-label="Sheet contents"
            variants={staggerContainer(0.03)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            <motion.p
              variants={fadeUp}
              className="text-faded font-mono text-detail-xs uppercase"
            >
              Contents
            </motion.p>
            <motion.ol
              variants={staggerContainer(0.03)}
              className="border-faded mt-5 grid grid-cols-1 border-t sm:grid-cols-2 lg:grid-cols-3"
            >
              {sheet.map((s) => (
                <motion.li key={s.index} variants={fadeUp}>
                  <a
                    href={`#section-${s.index}`}
                    className="border-faded group flex items-baseline gap-4 border-b py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:pr-8"
                  >
                    <span className="text-faded font-mono text-detail-xs tabular-nums">
                      {s.index}
                    </span>
                    <span className="text-paragraph-s text-foreground/80 transition-colors group-hover:text-foreground">
                      {s.title}
                    </span>
                  </a>
                </motion.li>
              ))}
            </motion.ol>
          </motion.nav>
        </Container>

        <Container className="flex flex-col gap-20 pb-20 md:gap-28 md:pb-28">
          {/* 01 — the state of things */}
          <SpecimenSection {...panel("01")} lede={status.body}>
            <dl className="border-faded bg-faded grid grid-cols-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
              {status.properties.map((property) => (
                <div key={property.term} className="bg-ivory-light p-6 md:p-7">
                  <dt className="text-display-xs font-semibold">
                    {property.term}
                  </dt>
                  <dd className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                    {property.body}
                  </dd>
                </div>
              ))}
            </dl>

            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
              {status.figures.map((figure) => (
                <div key={figure.label}>
                  <dt className="text-faded font-mono text-detail-xs uppercase">
                    {figure.label}
                  </dt>
                  <dd className="mt-1.5 text-display-s font-semibold tabular-nums">
                    {figure.value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-12 max-w-3xl text-paragraph-m text-pretty text-foreground/80">
              None of that is a criticism of TeX, which has been correct and
              stable for longer than most of the software on this machine has
              existed. It is a description of a seam — and almost everything
              this project does happens in it.
            </p>
          </SpecimenSection>

          {/* 02 — the document model */}
          <SpecimenSection {...panel("02")} lede={model.body}>
            <dl className="border-faded bg-faded grid grid-cols-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
              {model.properties.map((property) => (
                <div key={property.term} className="bg-ivory-light p-6 md:p-7">
                  <dt className="text-display-xs font-semibold">
                    {property.term}
                  </dt>
                  <dd className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                    {property.body}
                  </dd>
                </div>
              ))}
            </dl>
          </SpecimenSection>

          {/* 03 — editing */}
          <SpecimenSection
            {...panel("03")}
            lede="Six things the editor does that a text field with syntax colouring cannot. Each one is small; together they are the difference between writing in LaTeX and operating LaTeX."
          >
            <EditorStill />
            <div className="mt-14">
              <EditingRail />
            </div>
          </SpecimenSection>

          {/* 04 — the build pipeline */}
          <SpecimenSection {...panel("04")} lede={build.body}>
            <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-12">
              {build.ideas.map((idea) => (
                <li key={idea.term}>
                  <h3 className="text-display-xs font-semibold">{idea.term}</h3>
                  <p className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                    {idea.body}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-faded mt-14 border-t pt-10">
              <BuildLadder />
            </div>
          </SpecimenSection>
        </Container>

        {/* 05 — one save, given the full width of the sheet */}
        <section className="border-faded border-y bg-ivory-medium">
          <Container className="py-20 md:py-28">
            <SpecimenSection
              {...panel("05")}
              lede="You fix a typo in section 4.2 of a 182-page thesis and press save. This is the whole of what happens next, drawn to scale — and then drawn again at the scale where the parts we wrote are large enough to have names."
            >
              <SavePlate />

              <p className="mt-12 max-w-3xl text-paragraph-m text-pretty text-foreground/80">
                Three quarters of that second is the engine, and the engine is
                not ours to make faster. What the project actually did was
                remove the other forty seconds — the passes that did not need
                running, the figures that had not changed, and the document that
                did not need re-rastering to show one corrected line.
              </p>
              <p className="mt-6 max-w-3xl text-paragraph-m text-pretty text-foreground/80">
                It is worth being plain about the ceiling this implies. A save
                on this document will not go below about seven hundred
                milliseconds without a different engine, and we are not writing
                one. Everything left to win here is in the parts that are
                already small.
              </p>
            </SpecimenSection>
          </Container>
        </section>

        <Container className="flex flex-col gap-20 py-20 md:gap-28 md:py-28">
          {/* 06 — diagnostics */}
          <SpecimenSection
            {...panel("06")}
            lede="A build that fails tells you so in a transcript written for a line printer. The transcript is not wrong — it is just addressed to somebody else. These six are the ones we hit most, in the engine's words and then in ours."
          >
            <DiagnosticTable />
            <p className="mt-10 max-w-3xl text-paragraph-m text-pretty text-foreground/80">
              {diagnosticsNote}
            </p>
          </SpecimenSection>

          {/* 07 — the preview */}
          <SpecimenSection {...panel("07")} lede={preview.body}>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
              {preview.figures.map((figure) => (
                <div key={figure.label}>
                  <dt className="text-faded font-mono text-detail-xs uppercase">
                    {figure.label}
                  </dt>
                  <dd className="mt-1.5 text-display-s font-semibold tabular-nums">
                    {figure.value}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="border-faded mt-12 grid grid-cols-1 gap-8 border-t pt-8 md:grid-cols-3 md:gap-x-10">
              {preview.properties.map((property) => (
                <li key={property.term}>
                  <h3 className="text-display-xs font-semibold">
                    {property.term}
                  </h3>
                  <p className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                    {property.body}
                  </p>
                </li>
              ))}
            </ul>
          </SpecimenSection>
        </Container>

        {/* Wikimedia Commons: "Monochrome typewriter typebars" (Unsplash),
            CC0 1.0 — attribution not required. */}
        <Plate
          src="/stock/typewriter-typebars-macro.avif"
          alt="Close-up of the typebars of a manual typewriter, a curved rank of slender steel arms converging into shadow."
          aspect="aspect-[16/10] md:aspect-[21/9]"
          caption="Every mechanism in here was somebody's answer to the same question: how little has to move to put one character in the right place."
        />

        <Container className="flex flex-col gap-20 py-20 md:gap-28 md:py-28">
          {/* 08 — benchmarks */}
          <SpecimenSection {...panel("08")} lede={evaluation.caveat}>
            <TimingTable />

            <dl className="border-faded bg-faded mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-3">
              {evaluation.metrics.map((metric) => (
                <div key={metric.label} className="bg-ivory-light p-6">
                  <dt className="text-faded font-mono text-detail-xs uppercase">
                    {metric.label}
                  </dt>
                  <dd>
                    <p className="mt-3 text-display-m font-semibold tabular-nums">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                      {metric.note}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </SpecimenSection>

          {/* 09 — limits */}
          <SpecimenSection
            {...panel("09")}
            lede="This list is not a disclaimer at the foot of the page. It is the specification — several of the decisions above exist to keep the project inside it."
          >
            <ul className="flex flex-col">
              {limits.map((limit) => (
                <li
                  key={limit.term}
                  className="border-faded grid grid-cols-1 gap-2 border-t py-6 md:grid-cols-[18rem_1fr] md:gap-10"
                >
                  <h3 className="text-display-xs font-semibold text-balance">
                    {limit.term}
                  </h3>
                  <p className="max-w-2xl text-paragraph-s text-pretty text-muted-foreground">
                    {limit.body}
                  </p>
                </li>
              ))}
            </ul>
          </SpecimenSection>

          {/* 10 — the CodeVault loop */}
          <SpecimenSection {...panel("10")}>
            <ol className="border-faded bg-faded grid grid-cols-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
              {project.loop.map((step, i) => (
                <li key={step.phase} className="bg-ivory-light p-6 md:p-8">
                  <div className="flex items-baseline gap-3">
                    <span className="text-faded font-mono text-detail-xs tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-mono text-detail-xs font-medium uppercase">
                      {step.phase}
                    </h3>
                  </div>
                  <p className="mt-3 text-paragraph-s text-pretty text-foreground/80">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </SpecimenSection>

          {/* 11 — log */}
          <SpecimenSection {...panel("11")}>
            <ol className="border-faded relative border-l pl-6">
              {project.log.map((entry) => (
                <li key={entry.date} className="relative pb-8 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute top-1.5 -left-[1.6875rem] size-2 rounded-full bg-olive ring-4 ring-ivory-light"
                  />
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <time className="text-faded font-mono text-detail-xs tabular-nums">
                      {entry.date}
                    </time>
                    {entry.tag && (
                      <span className="text-faded font-mono text-detail-xs uppercase">
                        {entry.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-display-xs font-semibold">
                    {entry.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-paragraph-s text-pretty text-muted-foreground">
                    {entry.body}
                  </p>
                </li>
              ))}
            </ol>
          </SpecimenSection>

          {/* 12 — notes */}
          <SpecimenSection {...panel("12")}>
            <div className="flex max-w-3xl flex-col gap-6">
              {project.notes.map((note, i) => (
                <p
                  key={i}
                  className="text-paragraph-m text-pretty text-foreground/80"
                >
                  {note}
                </p>
              ))}
            </div>
          </SpecimenSection>
        </Container>

        {/* Wikimedia Commons: "Open book 1" (Unsplash), CC0 1.0 — attribution
            not required. */}
        <Plate
          bleed
          src="/stock/open-book-window-light.avif"
          alt="An open book lying on a wooden desk by a window, its pages lit by flat daylight."
          aspect="aspect-[16/10] md:aspect-[21/9]"
        />

        {/* Appendix */}
        <section
          aria-labelledby="tex-appendix"
          className="border-faded relative overflow-hidden border-t bg-ivory-medium"
        >
          <BaselineRules />
          <Container className="relative py-20 md:py-24">
            <h2
              id="tex-appendix"
              className="text-faded font-mono text-detail-xs uppercase"
            >
              Appendix
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-14 lg:grid-cols-[1fr_20rem] lg:gap-20">
              <div className="flex flex-col gap-14">
                <div>
                  <h3 className="text-display-s font-semibold">Terms</h3>
                  <dl className="border-faded mt-6 border-t">
                    {glossary.map((entry) => (
                      <div
                        key={entry.term}
                        className="border-faded grid grid-cols-1 gap-1 border-b py-4 md:grid-cols-[10rem_1fr] md:gap-8"
                      >
                        <dt className="font-mono text-detail-xs uppercase">
                          {entry.term}
                        </dt>
                        <dd className="max-w-2xl text-paragraph-s text-pretty text-muted-foreground">
                          {entry.body}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div>
                  <h3 className="text-display-s font-semibold">
                    What we read to build it
                  </h3>
                  <ul className="border-faded mt-6 border-t">
                    {references.map((reference) => (
                      <li
                        key={reference.label}
                        className="border-faded grid grid-cols-1 gap-1 border-b py-4 md:grid-cols-[18rem_1fr] md:gap-8"
                      >
                        <span className="text-paragraph-s">
                          {reference.label}
                        </span>
                        <span className="text-paragraph-s text-pretty text-muted-foreground">
                          {reference.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-display-s font-semibold">The name</h3>
                  <p className="mt-4 max-w-2xl text-paragraph-s text-pretty text-muted-foreground">
                    {name.body}
                  </p>
                  <p className="text-faded mt-4 max-w-2xl text-paragraph-s text-pretty">
                    {name.note}
                  </p>
                </div>
              </div>

              {/* Sheet data */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="border-faded rounded-2xl border bg-ivory-light p-6">
                  <h3 className="text-faded font-mono text-detail-xs uppercase">
                    Sheet data
                  </h3>
                  <dl className="mt-4 flex flex-col gap-3">
                    {project.facts.map((fact) => (
                      <div
                        key={fact.label}
                        className="border-faded flex items-baseline justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0"
                      >
                        <dt className="text-faded font-mono text-detail-xs uppercase">
                          {fact.label}
                        </dt>
                        <dd className="text-right font-mono text-detail-xs tabular-nums">
                          {fact.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <h3 className="text-faded mt-6 font-mono text-detail-xs uppercase">
                    Built with
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                      <li
                        key={tech}
                        className="border-faded rounded-full border px-2.5 py-1 font-mono text-detail-xs"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col gap-2.5">
                    {project.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 font-mono text-detail-xs text-foreground/80 transition-colors hover:text-foreground"
                      >
                        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </Container>
        </section>

        {/* Next */}
        <section className="border-faded border-t">
          <Container className="py-12">
            <Link
              to={projectPath(next.slug)}
              className="group flex items-center justify-between gap-6 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <div>
                <p className="text-faded font-mono text-detail-xs uppercase">
                  Next project · {next.field}
                </p>
                <p className="mt-2 text-display-m font-semibold">{next.name}</p>
              </div>
              <ArrowUpRight className="size-6 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Container>
        </section>
      </article>
    </ProjectShell>
  )
}
