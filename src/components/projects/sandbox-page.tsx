import { Link } from "@tanstack/react-router"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  HardDrive,
  Network,
  ShieldCheck,
  Terminal,
} from "lucide-react"

import { Container } from "@/components/layout/container"
import { ProjectShell } from "@/components/projects/project-shell"
import { ContainmentMap } from "@/components/projects/sandbox/containment-map"
import { NetworkRange } from "@/components/projects/sandbox/network-range"
import { ReadinessLedger } from "@/components/projects/sandbox/readiness-ledger"
import { RunDeck } from "@/components/projects/sandbox/run-deck"
import { getProject, nextProject, projectPath } from "@/core/config/projects"
import {
  sandboxFigures,
  sandboxIntro,
  sandboxPage,
  sandboxRoadmap,
  sandboxSources,
} from "@/core/config/sandbox"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

const project = getProject("sandbox")!

function HeroBoundary() {
  const layers = [
    {
      label: "AI request",
      detail: "untrusted text",
      icon: Terminal,
      tone: "text-destructive",
    },
    {
      label: "Rust controller",
      detail: "host-owned policy",
      icon: ShieldCheck,
      tone: "text-olive",
    },
    {
      label: "QEMU guest",
      detail: "disposable execution",
      icon: HardDrive,
      tone: "text-foreground",
    },
  ] as const

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute inset-y-8 left-7 w-px bg-border sm:left-9" />
      <ol className="relative space-y-3">
        {layers.map((layer) => {
          const Icon = layer.icon

          return (
            <li
              key={layer.label}
              className="grid grid-cols-[auto_1fr] items-center gap-4"
            >
              <span className="relative z-10 flex size-14 items-center justify-center rounded-xl border border-border bg-background sm:size-18">
                <Icon className={"size-5 " + layer.tone} aria-hidden="true" />
              </span>
              <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
                <p className="text-paragraph-s font-medium">{layer.label}</p>
                <p className="mt-1 font-mono text-detail-xs text-muted-foreground uppercase">
                  {layer.detail}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mt-3 ml-18 rounded-xl border border-dashed border-border bg-secondary p-4 sm:ml-22 sm:p-5">
        <div className="flex items-center gap-3">
          <Network
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-mono text-detail-xs text-muted-foreground uppercase">
            Default path to the Internet
          </p>
          <span className="ml-auto font-mono text-detail-xs text-foreground uppercase">
            None
          </span>
        </div>
      </div>
    </div>
  )
}

function SectionHeading({ title, body }: { title: string; body: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={staggerContainer(0.07)}
      initial={reduceMotion ? "show" : "hidden"}
      whileInView="show"
      viewport={viewportOnce}
      className="max-w-3xl"
    >
      <motion.h2
        variants={fadeUp}
        className="text-display-l font-semibold text-balance"
      >
        {title}
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="mt-5 max-w-2xl text-paragraph-m text-pretty text-muted-foreground"
      >
        {body}
      </motion.p>
    </motion.div>
  )
}

export function SandboxPage() {
  const reduceMotion = useReducedMotion()
  const next = nextProject(project.slug)

  return (
    <ProjectShell className="bg-background">
      <article>
        <section className="relative overflow-hidden border-b border-border">
          <Container className="py-12 md:py-18 lg:py-24">
            <motion.div
              variants={staggerContainer(0.07)}
              initial={reduceMotion ? "show" : "hidden"}
              whileInView="show"
              viewport={viewportOnce}
            >
              <motion.div variants={fadeUp} className="flex items-center">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-1.5 font-mono text-detail-xs text-muted-foreground uppercase transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  All projects
                </Link>
              </motion.div>

              <div className="mt-12 grid items-center gap-14 lg:grid-cols-[minmax(0,1.03fr)_minmax(0,0.97fr)] lg:gap-18">
                <div>
                  <motion.h1
                    variants={fadeUp}
                    className="text-display-xxl font-semibold text-balance"
                  >
                    Sandbox
                  </motion.h1>
                  <motion.p
                    variants={fadeUp}
                    className="mt-5 max-w-xl text-display-s text-pretty text-foreground/85"
                  >
                    Give the model a real{" "}
                    <span className="font-serif font-normal italic">shell</span>
                    . Keep the host out of reach.
                  </motion.p>
                  <motion.p
                    variants={fadeUp}
                    className="mt-6 max-w-2xl text-paragraph-l text-pretty text-muted-foreground"
                  >
                    {sandboxIntro.lede}
                  </motion.p>
                </div>

                <motion.div variants={fadeUp}>
                  <HeroBoundary />
                </motion.div>
              </div>
            </motion.div>
          </Container>

          <div className="border-t border-border bg-secondary">
            <Container>
              <p className="max-w-4xl border-l border-destructive py-5 pl-5 text-paragraph-s text-pretty text-foreground">
                {sandboxIntro.caution}
              </p>
            </Container>
          </div>

          <div className="border-t border-border">
            <Container>
              <dl className="grid sm:grid-cols-3">
                {sandboxFigures.map((figure) => (
                  <div
                    key={figure.label}
                    className="border-b border-border py-5 pr-4 last:border-b-0 sm:border-r sm:border-b-0 sm:py-6 sm:pl-5 sm:first:pl-0 sm:last:border-r-0"
                  >
                    <dt className="font-mono text-detail-xs text-muted-foreground uppercase">
                      {figure.label}
                    </dt>
                    <dd className="mt-2 text-display-s font-semibold tabular-nums">
                      {figure.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Container>
          </div>
        </section>

        <nav
          aria-label="Sandbox presentation"
          className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85"
        >
          <Container>
            <ol className="flex overflow-x-auto">
              {sandboxPage.sections.map((section) => (
                <li key={section.id} className="shrink-0">
                  <a
                    href={"#" + section.id}
                    className="block px-4 py-3 font-mono text-detail-xs text-muted-foreground uppercase transition-colors outline-none first:pl-0 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ol>
          </Container>
        </nav>

        <section
          id="boundary"
          aria-labelledby="boundary-title"
          className="scroll-mt-14 bg-foreground py-20 text-background md:py-28"
        >
          <Container>
            <div className="max-w-3xl">
              <h2
                id="boundary-title"
                className="text-display-l font-semibold text-balance"
              >
                {sandboxPage.boundary.title}
              </h2>
              <p className="mt-5 max-w-2xl text-paragraph-m text-pretty text-background/70">
                {sandboxPage.boundary.body}
              </p>
            </div>
            <div className="mt-14 md:mt-18">
              <ContainmentMap />
            </div>
          </Container>
        </section>

        <section
          id="run"
          aria-label={sandboxPage.run.title}
          className="scroll-mt-14 py-20 md:py-28"
        >
          <Container>
            <SectionHeading
              title={sandboxPage.run.title}
              body={sandboxPage.run.body}
            />
            <motion.div
              variants={fadeUp}
              initial={reduceMotion ? "show" : "hidden"}
              whileInView="show"
              viewport={viewportOnce}
              className="mt-12"
            >
              <RunDeck />
            </motion.div>
          </Container>
        </section>

        <section
          id="network"
          aria-label={sandboxPage.network.title}
          className="scroll-mt-14 border-y border-border bg-secondary py-20 md:py-28"
        >
          <Container>
            <SectionHeading
              title={sandboxPage.network.title}
              body={sandboxPage.network.body}
            />
            <div className="mt-14 md:mt-18">
              <NetworkRange />
            </div>
          </Container>
        </section>

        <section
          id="readiness"
          aria-label={sandboxPage.readiness.title}
          className="scroll-mt-14 py-20 md:py-28"
        >
          <Container>
            <SectionHeading
              title={sandboxPage.readiness.title}
              body={sandboxPage.readiness.body}
            />
            <div className="mt-12">
              <ReadinessLedger />
            </div>
            <p className="mt-8 max-w-3xl border-t border-border pt-6 text-paragraph-s text-pretty text-muted-foreground">
              {sandboxPage.readiness.note}
            </p>
          </Container>
        </section>

        <section className="border-y border-border bg-secondary py-20 md:py-28">
          <Container>
            <SectionHeading
              title={sandboxPage.roadmap.title}
              body={sandboxPage.roadmap.body}
            />

            <ol className="bg-faded mt-14 grid gap-px overflow-hidden rounded-2xl md:grid-cols-2">
              {sandboxRoadmap.map((step, index) => (
                <li key={step.gate} className="bg-background p-6 md:p-8">
                  <span className="font-mono text-detail-xs text-muted-foreground uppercase">
                    {step.gate}
                  </span>
                  <h3 className="mt-7 text-display-s font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-paragraph-s text-pretty text-muted-foreground">
                    {step.body}
                  </p>
                  {index < sandboxRoadmap.length - 1 && (
                    <ArrowDown
                      className="mt-8 size-4 text-muted-foreground md:hidden"
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section className="border-t border-border bg-foreground py-20 text-background md:py-24">
          <Container>
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
              <div>
                <h2 className="max-w-2xl text-display-l font-semibold text-balance">
                  {sandboxPage.sources.title}
                </h2>
                <ul className="mt-10 border-t border-background/20">
                  {sandboxSources.map((source) => (
                    <li key={source.label}>
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between gap-4 border-b border-background/20 py-4 text-paragraph-s text-background/70 transition-colors outline-none hover:text-background focus-visible:ring-2 focus-visible:ring-background/60"
                      >
                        {source.label}
                        <ArrowUpRight
                          className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-background/20 pt-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                <p className="font-mono text-detail-xs text-background/70 uppercase">
                  Next project
                </p>
                <Link
                  to={projectPath(next.slug)}
                  className="group mt-4 flex items-start justify-between gap-5 outline-none focus-visible:ring-2 focus-visible:ring-background/60"
                >
                  <span>
                    <span className="block text-display-m font-semibold">
                      {next.name}
                    </span>
                    <span className="mt-2 block text-paragraph-s text-pretty text-background/70">
                      {next.summary}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="mt-1 size-5 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </article>
    </ProjectShell>
  )
}
