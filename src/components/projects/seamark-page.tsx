import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowUpRight } from "lucide-react"

import { Plate } from "@/components/about/plate"
import { Container } from "@/components/layout/container"
import { ProjectShell } from "@/components/projects/project-shell"
import { StatusChip } from "@/components/projects/status-chip"
import { DetectorRail } from "@/components/projects/seamark/detector-rail"
import { ChartSection } from "@/components/projects/seamark/section"
import { SheetGrid } from "@/components/projects/seamark/sheet-grid"
import { StageFunnel } from "@/components/projects/seamark/stage-funnel"
import { TrackPlate } from "@/components/projects/seamark/track-plate"
import { TriageQueue } from "@/components/projects/seamark/triage-queue"
import { getProject, nextProject, projectPath } from "@/core/config/projects"
import {
  acronym,
  area,
  evaluation,
  expansion,
  glossary,
  humanInTheLoop,
  lede,
  limits,
  panel,
  references,
  sheet,
  signal,
  verdicts,
  workedCase,
} from "@/core/config/seamark"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

const project = getProject("seamark")!

// Style: chart sheet. Where the dossier reads as a flight report and the
// journal as a diary, this one reads as a published chart — a graticule behind
// the masthead, numbered panels down the left margin, bearings held at the
// right, and one loud plate in the middle where the case is drawn.
//
// It is also the longest project page on the site, deliberately. Seamark is
// mostly an argument about what a system like this must refuse to do, and that
// argument does not survive being summarised into four cards.
export function SeamarkPage() {
  const next = nextProject(project.slug)

  return (
    <ProjectShell>
      <article>
        {/* Masthead */}
        <section className="border-faded relative overflow-hidden border-b bg-ivory-medium">
          <SheetGrid />
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
                  SMK-01 · North Sea &amp; Skagerrak · 58°04′N 09°31′E
                </p>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-10 text-display-xxl font-semibold"
              >
                Seamark
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-faded mt-4 max-w-2xl font-mono text-detail-xs uppercase"
              >
                {expansion}
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
                It does not decide anything. Everything below is in service of
                one question: what has to be true before a machine is allowed to
                take up a person&apos;s{" "}
                <span className="font-serif font-normal italic">attention</span>
                ?
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
                  { label: "Input", value: "Kystverket open AIS" },
                  { label: "Messages / day", value: "3.8 M" },
                  { label: "Tracks / day", value: "11,400" },
                  { label: "Cases / day", value: "23" },
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

        {/* Unsplash-style CC0 photograph, Wikimedia Commons: "Container ship in
            Koper 2013" by Martin Dörsch, CC0 1.0 — attribution not required. */}
        <Plate
          bleed
          src="/stock/cargo-ship-open-sea.avif"
          alt="A fully laden container ship seen head-on in open water under heavy overcast, a small red tug alongside its bow."
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
          {/* 01 — the signal */}
          <ChartSection {...panel("01")} lede={signal.body}>
            <dl className="border-faded bg-faded grid grid-cols-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
              {signal.properties.map((property) => (
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
            <p className="mt-8 max-w-3xl text-paragraph-m text-pretty text-foreground/80">
              Every one of those properties is a limitation, and together they
              are the reason the project is interesting. A signal that could be
              trusted would need a database, not a system for deciding what to
              believe.
            </p>
          </ChartSection>

          {/* 02 — the area */}
          <ChartSection {...panel("02")} lede={area.body}>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-3">
              {area.figures.map((figure) => (
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

            <ul className="border-faded mt-12 grid grid-cols-1 gap-8 border-t pt-8 md:grid-cols-2 md:gap-x-12">
              {area.kinds.map((kind) => (
                <li key={kind.term}>
                  <h3 className="text-display-xs font-semibold">{kind.term}</h3>
                  <p className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                    {kind.body}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-faded mt-12 border-l pl-6 md:pl-8">
              <p className="text-faded font-mono text-detail-xs uppercase">
                The map nobody publishes
              </p>
              <p className="mt-3 max-w-3xl text-paragraph-m text-pretty text-foreground/80">
                {area.reception}
              </p>
            </div>
          </ChartSection>

          {/* 03 — pipeline */}
          <ChartSection
            {...panel("03")}
            lede="Six stages between a receiver and a person. Each one throws work away, and the last one throws away the most — on purpose, and against a number that has nothing to do with confidence."
          >
            <StageFunnel />
          </ChartSection>

          {/* 04 — detectors */}
          <ChartSection
            {...panel("04")}
            lede="Six rules, run independently so that agreement between them means something. None of them is clever; the work went into knowing what each one gets wrong."
          >
            <DetectorRail />
          </ChartSection>
        </Container>

        {/* 05 — the worked case, given the full width of the sheet */}
        <section className="border-faded border-y bg-ivory-medium">
          <Container className="py-20 md:py-28">
            <ChartSection
              {...panel("05")}
              lede={`On 14 July a bulk carrier crossed cable corridor SK-2 in the Skagerrak, slowed, stopped transmitting for 41 minutes, and came back on a reciprocal heading less than two nautical miles away. Three detectors fired on one track. This is what the system saw, and the limit of what it can say about it.`}
            >
              <TrackPlate />

              <ol className="border-faded mt-12 grid grid-cols-1 gap-px border-t md:grid-cols-2 md:gap-x-12">
                {workedCase.steps.map((step) => (
                  <li
                    key={`${step.time}-${step.label}`}
                    className="border-faded border-b py-5"
                  >
                    <div className="flex items-baseline gap-4">
                      <time className="text-faded shrink-0 font-mono text-detail-xs tabular-nums">
                        {step.time}
                      </time>
                      <h3
                        className={
                          step.gap
                            ? "text-display-xs font-semibold text-clay"
                            : "text-display-xs font-semibold"
                        }
                      >
                        {step.label}
                      </h3>
                    </div>
                    <p className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                      {step.detail}
                    </p>
                  </li>
                ))}
              </ol>

              <p className="mt-10 max-w-3xl text-paragraph-m text-pretty text-foreground/80">
                What the case does not contain is a conclusion. The vessel may
                have had a transponder fault, a legitimate reason to hold
                position, or neither — the data cannot separate those, and
                neither can we. It was escalated as a question to the operator
                of the cable underneath, which is the furthest this project
                goes.
              </p>
            </ChartSection>
          </Container>
        </section>

        <Container className="flex flex-col gap-20 py-20 md:gap-28 md:py-28">
          {/* 06 — the queue */}
          <ChartSection
            {...panel("06")}
            lede="A ranked queue, cut to what a shift can read, and three things a person can do with a case. The verdict is the product — there is no fourth option where the system decides on its own."
          >
            <TriageQueue />

            <ol className="border-faded bg-faded mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border md:grid-cols-3">
              {verdicts.map((verdict) => (
                <li key={verdict.key} className="bg-ivory-light p-6 md:p-7">
                  <div className="flex items-baseline gap-3">
                    <span className="border-faded text-faded rounded border px-1.5 font-mono text-detail-xs">
                      {verdict.key}
                    </span>
                    <h3 className="text-display-xs font-semibold">
                      {verdict.name}
                    </h3>
                  </div>
                  <p className="mt-3 text-paragraph-s text-pretty text-foreground/80">
                    {verdict.body}
                  </p>
                  <p className="border-faded mt-4 border-t pt-4 text-paragraph-s text-pretty text-muted-foreground">
                    {verdict.effect}
                  </p>
                </li>
              ))}
            </ol>
          </ChartSection>

          {/* 07 — human in the loop */}
          <ChartSection {...panel("07")}>
            <div className="flex max-w-3xl flex-col gap-6">
              {humanInTheLoop.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-paragraph-m text-pretty text-foreground/80"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </ChartSection>
        </Container>

        {/* Wikimedia Commons: "Colombo Express in Altenwerder at night" by
            Martin Damboldt, CC0 1.0 — attribution not required. */}
        <Plate
          src="/stock/harbour-lights-night.avif"
          alt="A container ship moored at a terminal at night, eight lit gantry cranes along the quay reflected in still black water."
          aspect="aspect-[16/10] md:aspect-[21/9]"
          caption="Port approaches are the noisiest ground on the map: everything here is slow, stopped, or waiting for a berth, and almost none of it means anything."
        />

        <Container className="flex flex-col gap-20 py-20 md:gap-28 md:py-28">
          {/* 08 — evaluation */}
          <ChartSection {...panel("08")} lede={evaluation.caveat}>
            <dl className="border-faded bg-faded grid grid-cols-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-3">
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
          </ChartSection>

          {/* 09 — limits */}
          <ChartSection
            {...panel("09")}
            lede="This list is not a disclaimer at the bottom of the page. It is the specification — most of the design decisions above exist to keep the system inside it."
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
          </ChartSection>

          {/* 10 — the CodeVault loop */}
          <ChartSection {...panel("10")}>
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
          </ChartSection>

          {/* 11 — log */}
          <ChartSection {...panel("11")}>
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
          </ChartSection>

          {/* 12 — notes */}
          <ChartSection {...panel("12")}>
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
          </ChartSection>
        </Container>

        {/* Wikimedia Commons: "The WilPhoenix Offshore Oil Rig" by Joe deSousa,
            CC0 1.0 — attribution not required. */}
        <Plate
          bleed
          src="/stock/coastal-infrastructure-shore.avif"
          alt="A semi-submersible drilling rig floating on its pontoon legs in calm coastal water, a low green shoreline behind it."
          aspect="aspect-[16/10] md:aspect-[21/9]"
        />

        {/* Appendix */}
        <section
          aria-labelledby="seamark-appendix"
          className="border-faded relative overflow-hidden border-t bg-ivory-medium"
        >
          <SheetGrid />
          <Container className="relative py-20 md:py-24">
            <h2
              id="seamark-appendix"
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
                  <dl className="mt-6 flex flex-col gap-2">
                    {acronym.map((letter, i) => (
                      <div
                        key={`${letter.term}-${i}`}
                        className="flex items-baseline gap-4"
                      >
                        <dt className="w-6 font-mono text-display-xs font-semibold">
                          {letter.term}
                        </dt>
                        <dd className="text-paragraph-s text-muted-foreground">
                          {letter.body}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-faded mt-6 max-w-md text-paragraph-s text-pretty">
                    A seamark is a navigational aid — something fixed you can
                    take a bearing from. The acronym came second, and it shows.
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
