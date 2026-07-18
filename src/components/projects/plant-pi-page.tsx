import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowUpRight, Sprout } from "lucide-react"

import { Container } from "@/components/layout/container"
import { ProjectShell } from "@/components/projects/project-shell"
import { StatusChip } from "@/components/projects/status-chip"
import { getProject, nextProject, projectPath } from "@/core/config/projects"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

const project = getProject("plant-pi")!

// Style: field journal. Warm, hand-kept, log-forward. The dated log is the
// spine of the page; the writing is honest about what broke. Serif accents,
// oat surfaces, a generous reading measure.
export function PlantPiPage() {
  const next = nextProject(project.slug)
  const selectedLog = project.log.slice(0, 3)

  return (
    <ProjectShell className="bg-ivory-light">
      <article>
        {/* Hero */}
        <Container className="py-16 md:py-24">
          <motion.div
            variants={staggerContainer(0.09)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp}>
              <Link
                to="/projects"
                className="text-faded inline-flex items-center gap-1.5 text-sm transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                All projects
              </Link>
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="text-faded mt-10 text-detail-xs font-medium uppercase"
            >
              Field journal · Hardware
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-4 text-display-xl font-semibold text-balance"
            >
              A month spent keeping three plants{" "}
              <span className="font-serif font-normal italic">
                {project.accent}
              </span>
              .
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 text-paragraph-l text-pretty text-muted-foreground"
            >
              {project.summary}
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <StatusChip status={project.status} />
              <span className="text-faded text-detail-xs font-medium uppercase">
                {project.field}
              </span>
            </motion.div>
          </motion.div>
        </Container>

        {/* Facts strip */}
        <section className="border-faded border-y bg-ivory-medium">
          <Container className="py-8">
            <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {project.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-faded text-detail-xs font-medium uppercase">
                    {fact.label}
                  </dt>
                  <dd className="mt-1.5 text-paragraph-s font-medium">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        {/* How it went — the loop as prose */}
        <Container className="py-16 md:py-20">
          <div className="mx-auto max-w-2xl">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="text-display-m font-semibold text-balance"
            >
              How it went.
            </motion.h2>
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="mt-10 flex flex-col gap-10"
            >
              {project.loop.map((step) => (
                <motion.div key={step.phase} variants={fadeUp}>
                  <h3 className="text-faded text-detail-xs font-medium uppercase">
                    {step.phase}
                  </h3>
                  <p className="mt-2 text-paragraph-m text-pretty text-foreground/85">
                    {step.body}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* A photo we didn't take */}
            <Snapshot
              caption="photo: the rig, taped to a windowsill, watering a very
              patient pothos"
            />
          </div>
        </Container>

        {/* The log — selected entries */}
        <section className="border-faded border-t bg-ivory-medium">
          <Container className="py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-faded text-detail-xs font-medium uppercase">
                    From the log
                  </p>
                  <h2 className="mt-3 text-display-m font-semibold text-balance">
                    Selected entries.
                  </h2>
                </div>
              </div>

              <motion.ol
                variants={staggerContainer(0.09)}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="mt-10 flex flex-col gap-4"
              >
                {selectedLog.map((entry) => (
                  <motion.li
                    key={entry.date}
                    variants={fadeUp}
                    className="border-faded rounded-2xl border bg-oat p-6 md:p-7"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <time className="text-sm font-medium">{entry.date}</time>
                      {entry.tag && (
                        <span className="text-faded text-detail-xs font-medium uppercase">
                          · {entry.tag}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-display-xs font-semibold">
                      {entry.title}
                    </h3>
                    <p className="mt-2 text-paragraph-s text-pretty text-foreground/80">
                      {entry.body}
                    </p>
                  </motion.li>
                ))}
              </motion.ol>

              <Link
                to="/projects/plant-pi/log"
                className="group mt-8 inline-flex items-center gap-1.5 text-paragraph-s font-medium underline-offset-4 hover:underline"
              >
                Read the full log
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </Container>
        </section>

        {/* Notes */}
        <Container className="py-16 md:py-20">
          <div className="mx-auto max-w-2xl">
            <p className="text-faded text-detail-xs font-medium uppercase">
              What we took from it
            </p>
            <div className="mt-6 flex flex-col gap-5">
              {project.notes.map((note, i) => (
                <p
                  key={i}
                  className="text-paragraph-m text-pretty text-foreground/85"
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
                <p className="text-faded text-detail-xs font-medium uppercase">
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

// An honest placeholder — we show it as the photo we didn't take, not as art.
function Snapshot({ caption }: { caption: string }) {
  return (
    <figure className="mt-12">
      <div className="border-faded flex aspect-[16/9] items-center justify-center rounded-2xl border border-dashed bg-oat/60">
        <Sprout className="size-8 text-olive" aria-hidden />
      </div>
      <figcaption className="text-faded mt-3 font-mono text-detail-xs">
        [ {caption} ]
      </figcaption>
    </figure>
  )
}
