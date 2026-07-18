import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowUpRight } from "lucide-react"

import { Container } from "@/components/layout/container"
import { ProjectShell } from "@/components/projects/project-shell"
import { StatusChip } from "@/components/projects/status-chip"
import { getProject, nextProject, projectPath } from "@/core/config/projects"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

const project = getProject("git-story")!

// A few real-feeling invocations. Presentational structure for the readme
// style, so it lives with the component rather than the shared data model.
const commands: { cmd: string; note: string }[] = [
  {
    cmd: "npx git-story",
    note: "Summarise the current branch since its last tag.",
  },
  {
    cmd: "git-story --since 2026-06-01",
    note: "Narrate everything after a date.",
  },
  {
    cmd: "git-story v0.3..HEAD",
    note: "Any revision range works.",
  },
]

// Style: spec sheet / README. Terminal-forward, mono, a dark install block, a
// spec table, $-prefixed command lines. Documentation set as a page.
export function GitStoryPage() {
  const next = nextProject(project.slug)

  return (
    <ProjectShell>
      <article>
        {/* Hero */}
        <Container className="py-16 md:py-20">
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="max-w-3xl"
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
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <h1 className="font-mono text-display-xl font-semibold">
                {project.name}
              </h1>
              <span className="border-faded rounded-full border px-2.5 py-1 font-mono text-detail-xs">
                v0.4.1
              </span>
              <StatusChip status={project.status} />
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="mt-5 text-paragraph-l text-pretty text-muted-foreground"
            >
              A CLI that reads your git log and tells it back as a readable{" "}
              <span className="font-serif font-normal italic">
                {project.accent}
              </span>{" "}
              — not a wall of hashes.
            </motion.p>
          </motion.div>

          {/* Install terminal */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-10 max-w-3xl"
          >
            <Terminal label="install">
              <Line prompt>npm i -g git-story</Line>
              <Line muted>added 12 packages in 1.4s</Line>
              <Line prompt>git-story --version</Line>
              <Line muted>0.4.1</Line>
            </Terminal>
          </motion.div>
        </Container>

        {/* Spec table */}
        <section className="border-faded border-y bg-ivory-medium">
          <Container className="py-14 md:py-16">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div>
                <h2 className="text-faded font-mono text-detail-xs uppercase">
                  Spec
                </h2>
                <dl className="mt-4">
                  {project.facts.map((fact) => (
                    <div
                      key={fact.label}
                      className="border-faded flex items-baseline justify-between gap-4 border-b py-2.5 last:border-b-0"
                    >
                      <dt className="text-faded font-mono text-detail-xs uppercase">
                        {fact.label}
                      </dt>
                      <dd className="font-mono text-sm">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h2 className="text-faded font-mono text-detail-xs uppercase">
                  Built with
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <li
                      key={tech}
                      className="border-faded rounded-md border bg-ivory-light px-2.5 py-1 font-mono text-detail-xs"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>

                <h2 className="text-faded mt-8 font-mono text-detail-xs uppercase">
                  Links
                </h2>
                <div className="mt-4 flex flex-col gap-2.5">
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
            </div>
          </Container>
        </section>

        {/* Usage */}
        <Container className="py-16 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-faded font-mono text-detail-xs font-medium uppercase">
              Usage
            </h2>
            <motion.ul
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="mt-5 flex flex-col gap-4"
            >
              {commands.map((c) => (
                <motion.li key={c.cmd} variants={fadeUp}>
                  <Terminal>
                    <Line prompt>{c.cmd}</Line>
                  </Terminal>
                  <p className="text-faded mt-2 text-paragraph-s">{c.note}</p>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </Container>

        {/* Why it exists — the loop */}
        <section className="border-faded border-t">
          <Container className="py-16 md:py-20">
            <div className="max-w-3xl">
              <h2 className="text-display-m font-semibold text-balance">
                Why it exists.
              </h2>
              <motion.div
                variants={staggerContainer(0.08)}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2"
              >
                {project.loop.map((step, i) => (
                  <motion.div
                    key={step.phase}
                    variants={fadeUp}
                    className="border-faded border-t pt-4"
                  >
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
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Changelog */}
        <section className="border-faded border-t bg-ivory-medium">
          <Container className="py-16 md:py-20">
            <div className="max-w-3xl">
              <h2 className="text-faded font-mono text-detail-xs font-medium uppercase">
                Changelog
              </h2>
              <motion.ol
                variants={staggerContainer(0.08)}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="mt-6 flex flex-col"
              >
                {project.log.map((entry) => (
                  <motion.li
                    key={entry.date}
                    variants={fadeUp}
                    className="border-faded grid grid-cols-1 gap-1 border-b py-5 first:pt-0 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-6"
                  >
                    <time className="text-faded font-mono text-detail-xs tabular-nums">
                      {entry.date}
                    </time>
                    <div>
                      <h3 className="font-mono text-sm font-medium">
                        {entry.title}
                      </h3>
                      <p className="mt-1.5 text-paragraph-s text-pretty text-muted-foreground">
                        {entry.body}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </motion.ol>
            </div>
          </Container>
        </section>

        {/* Notes */}
        <Container className="py-16 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-faded font-mono text-detail-xs font-medium uppercase">
              Notes
            </h2>
            <div className="mt-6 flex flex-col gap-5">
              {project.notes.map((note, i) => (
                <p
                  key={i}
                  className="text-paragraph-m text-pretty text-foreground/80"
                >
                  {note}
                </p>
              ))}
            </div>
          </div>
        </Container>

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

// A deliberate brand moment: a dark terminal against the warm page.
function Terminal({
  label,
  children,
}: {
  label?: string
  children: React.ReactNode
}) {
  return (
    <div className="border-faded overflow-hidden rounded-xl border bg-slate-dark">
      <div className="flex items-center gap-2 border-b border-ivory-light/10 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-ivory-light/20" aria-hidden />
        <span className="size-2.5 rounded-full bg-ivory-light/20" aria-hidden />
        <span className="size-2.5 rounded-full bg-ivory-light/20" aria-hidden />
        {label && (
          <span className="ml-2 font-mono text-detail-xs text-ivory-light/40 uppercase">
            {label}
          </span>
        )}
      </div>
      <div className="overflow-x-auto p-4 font-mono text-sm">{children}</div>
    </div>
  )
}

function Line({
  prompt,
  muted,
  children,
}: {
  prompt?: boolean
  muted?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="whitespace-pre text-ivory-light/90">
      {prompt && <span className="text-olive select-none">$ </span>}
      <span className={muted ? "text-ivory-light/45" : undefined}>
        {children}
      </span>
    </div>
  )
}
