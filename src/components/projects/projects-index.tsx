import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

import { Container } from "@/components/layout/container"
import { ProjectShell } from "@/components/projects/project-shell"
import { StatusChip } from "@/components/projects/status-chip"
import { projectPath, projects } from "@/core/config/projects"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

// A quiet, magazine-style contents page: one project per row, each hinting at
// the style it opens into. No filtering, no dashboard — just a running list.
export function ProjectsIndex() {
  return (
    <ProjectShell>
      <section aria-labelledby="projects-title" className="py-20 md:py-28">
        <Container>
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="max-w-2xl"
          >
            <motion.p
              variants={fadeUp}
              className="text-faded text-detail-xs font-medium uppercase"
            >
              Projects
            </motion.p>
            <motion.h1
              id="projects-title"
              variants={fadeUp}
              className="mt-3 text-display-xl font-semibold text-balance"
            >
              The things we&apos;ve been{" "}
              <span className="font-serif font-normal italic">trying</span>.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 text-paragraph-l text-pretty text-muted-foreground"
            >
              A running list of projects — some shipped, some paused, some still
              moving. Each one is a trial we lived with and reacted to. Nothing
              here is a product; it&apos;s what came out the other side.
            </motion.p>
          </motion.div>

          <motion.ul
            variants={staggerContainer(0.1, 0.05)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="border-faded mt-14 border-t"
          >
            {projects.map((p, i) => (
              <motion.li key={p.slug} variants={fadeUp}>
                <Link
                  to={projectPath(p.slug)}
                  className="group border-faded grid grid-cols-1 gap-4 border-b py-8 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:grid-cols-[auto_1fr_auto] md:items-baseline md:gap-8"
                >
                  <span className="text-faded font-mono text-detail-xs tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-display-m font-semibold">{p.name}</h2>
                      <StatusChip status={p.status} />
                    </div>
                    <p className="mt-3 max-w-xl text-paragraph-s text-pretty text-muted-foreground">
                      {p.summary}
                    </p>
                    <p className="text-faded mt-3 font-mono text-detail-xs uppercase">
                      {p.field}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                    Open
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </Container>
      </section>
    </ProjectShell>
  )
}
