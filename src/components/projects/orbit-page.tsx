import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowUpRight } from "lucide-react"

import { Container } from "@/components/layout/container"
import { ProjectShell } from "@/components/projects/project-shell"
import { StatusChip } from "@/components/projects/status-chip"
import { getProject, nextProject, projectPath } from "@/core/config/projects"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

const project = getProject("orbit")!

// Style: mission dossier. Mono labels, tabular numbers, a telemetry facts rail,
// numbered sections. Reads like a flight report — quiet, structured, technical.
export function OrbitPage() {
  const next = nextProject(project.slug)

  return (
    <ProjectShell>
      <article>
        {/* Hero */}
        <section className="border-faded border-b">
          <Container className="py-16 md:py-20">
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
            >
              <motion.div variants={fadeUp}>
                <Link
                  to="/projects"
                  className="text-faded inline-flex items-center gap-1.5 font-mono text-detail-xs uppercase transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  All projects
                </Link>
              </motion.div>
              <motion.p
                variants={fadeUp}
                className="text-faded mt-8 font-mono text-detail-xs uppercase"
              >
                Mission dossier · ORB-01
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="mt-4 text-display-xxl font-semibold"
              >
                {project.name}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-5 max-w-2xl text-paragraph-l text-pretty text-muted-foreground"
              >
                A game about keeping a sky full of satellites from letting their
                orbits{" "}
                <span className="font-serif font-normal italic">
                  {project.accent}
                </span>
                .
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="mt-7 flex flex-wrap items-center gap-3"
              >
                <StatusChip status={project.status} />
                <span className="text-faded font-mono text-detail-xs uppercase">
                  {project.field}
                </span>
              </motion.div>
            </motion.div>
          </Container>
        </section>

        {/* Body: content + telemetry rail */}
        <Container className="grid grid-cols-1 gap-12 py-16 md:py-20 lg:grid-cols-[1fr_18rem] lg:gap-16">
          <div className="flex flex-col gap-16">
            <Section index="01" title="Mission brief">
              <p className="text-paragraph-m text-pretty text-muted-foreground">
                {project.summary}
              </p>
              <ol className="border-faded bg-faded mt-8 flex flex-col gap-px overflow-hidden rounded-2xl border">
                {project.loop.map((step, i) => (
                  <li key={step.phase} className="bg-ivory-light p-6 md:p-7">
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
            </Section>

            <Section index="02" title="Flight log">
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
                    <p className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                      {entry.body}
                    </p>
                  </li>
                ))}
              </ol>
            </Section>

            <Section index="03" title="Debrief">
              <div className="flex flex-col gap-5">
                {project.notes.map((note, i) => (
                  <p
                    key={i}
                    className="text-paragraph-m text-pretty text-foreground/80"
                  >
                    {note}
                  </p>
                ))}
              </div>
            </Section>
          </div>

          {/* Telemetry rail */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border-faded rounded-2xl border p-6">
              <h2 className="text-faded font-mono text-detail-xs uppercase">
                Telemetry
              </h2>
              <dl className="mt-4 flex flex-col gap-3">
                {project.facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="border-faded flex items-baseline justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <dt className="text-faded font-mono text-detail-xs uppercase">
                      {fact.label}
                    </dt>
                    <dd className="font-mono text-detail-xs tabular-nums">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <h2 className="text-faded mt-6 font-mono text-detail-xs uppercase">
                Payload
              </h2>
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
        </Container>

        {/* Next */}
        <NextDossier
          name={next.name}
          field={next.field}
          to={projectPath(next.slug)}
        />
      </article>
    </ProjectShell>
  )
}

function Section({
  index,
  title,
  children,
}: {
  index: string
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.section
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      <motion.div
        variants={fadeUp}
        className="border-faded flex items-baseline gap-3 border-b pb-3"
      >
        <span className="text-faded font-mono text-detail-xs tabular-nums">
          {index}
        </span>
        <h2 className="font-mono text-detail-xs font-medium uppercase">
          {title}
        </h2>
      </motion.div>
      <motion.div variants={fadeUp} className="mt-6">
        {children}
      </motion.div>
    </motion.section>
  )
}

function NextDossier({
  name,
  field,
  to,
}: {
  name: string
  field: string
  to: string
}) {
  return (
    <section className="border-faded border-t">
      <Container className="py-12">
        <Link
          to={to}
          className="group flex items-center justify-between gap-6 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <div>
            <p className="text-faded font-mono text-detail-xs uppercase">
              Next dossier · {field}
            </p>
            <p className="mt-2 text-display-m font-semibold">{name}</p>
          </div>
          <ArrowUpRight className="size-6 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </Container>
    </section>
  )
}
