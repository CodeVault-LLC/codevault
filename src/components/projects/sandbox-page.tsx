import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUpRight } from "lucide-react"

import { Container } from "@/components/layout/container"
import { ProjectIntro } from "@/components/projects/project-intro"
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

function SectionHeading({ title, body }: { title: string; body: string }) {
  return (
    <motion.div
      variants={staggerContainer(0.07)}
      initial={false}
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
  const next = nextProject(project.slug)

  return (
    <ProjectShell className="bg-background">
      <article>
        <ProjectIntro project={project} introduction={sandboxIntro.lede} />
        <section>
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
                    <dt className="font-mono text-detail-xs text-muted-foreground">
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
          className="sticky top-16 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 lg:top-[4.25rem]"
        >
          <Container>
            <ol className="flex overflow-x-auto">
              {sandboxPage.sections.map((section) => (
                <li key={section.id} className="shrink-0">
                  <a
                    href={"#" + section.id}
                    className="block px-4 py-3 font-mono text-detail-xs text-muted-foreground transition-colors outline-none first:pl-0 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset"
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
              initial={false}
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

            <ol className="bg-faded mt-14 grid gap-px overflow-hidden md:grid-cols-2">
              {sandboxRoadmap.map((step, index) => (
                <li key={step.gate} className="bg-background p-6 md:p-8">
                  <span className="font-mono text-detail-xs text-muted-foreground">
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
                <p className="font-mono text-detail-xs text-background/70">
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
