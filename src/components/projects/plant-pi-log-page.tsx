import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

import { Container } from "@/components/layout/container"
import { ProjectShell } from "@/components/projects/project-shell"
import { getProject } from "@/core/config/projects"
import { fadeUp, staggerContainer, viewportOnce } from "@/core/lib/motion"

const project = getProject("plant-pi")!

// Subpage: the full log, stripped back. No cards, no chrome — just the whole
// notebook, in order, the way you'd flip through it.
export function PlantPiLogPage() {
  return (
    <ProjectShell>
      <article>
        <Container className="py-16 md:py-24">
          <div className="mx-auto max-w-2xl">
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
            >
              <motion.div variants={fadeUp}>
                <Link
                  to="/projects/plant-pi"
                  className="text-faded inline-flex items-center gap-1.5 text-sm transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Back to the plant-watering Pi
                </Link>
              </motion.div>
              <motion.p
                variants={fadeUp}
                className="text-faded mt-10 text-detail-xs font-medium uppercase"
              >
                The plant-watering Pi · Full log
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="mt-4 text-display-l font-semibold text-balance"
              >
                Every entry, in{" "}
                <span className="font-serif font-normal italic">order</span>.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-5 text-paragraph-m text-pretty text-muted-foreground"
              >
                The whole month, unedited — the good mornings and the sad one.
                Dates as we wrote them at the time.
              </motion.p>
            </motion.div>

            <motion.ol
              variants={staggerContainer(0.07)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="border-faded mt-14 border-l pl-6"
            >
              {project.log.map((entry) => (
                <motion.li
                  key={entry.date}
                  variants={fadeUp}
                  className="relative pb-10 last:pb-0"
                >
                  <span
                    aria-hidden
                    className="absolute top-2 -left-[1.6875rem] size-2 rounded-full bg-olive ring-4 ring-ivory-light"
                  />
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <time className="text-sm font-medium">{entry.date}</time>
                    {entry.tag && (
                      <span className="text-faded text-detail-xs font-medium uppercase">
                        · {entry.tag}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-display-xs font-semibold">
                    {entry.title}
                  </h2>
                  <p className="mt-2 text-paragraph-s text-pretty text-muted-foreground">
                    {entry.body}
                  </p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </Container>
      </article>
    </ProjectShell>
  )
}
