import { electrical } from "@/core/config/electrical"
import { cn } from "@/lib/utils"
import { Container } from "@/components/layout/container"
import { StatusChip } from "@/components/electrical/status-chip"
import { ToolDiagram } from "@/components/electrical/tool-diagram"
import { Reveal } from "@/components/ui/reveal"

/**
 * One row per tool: a drawing of what it does beside what to know about it.
 * Rows alternate sides on wide screens. The drawing sits in a 16:10 frame so a
 * short screen recording can take its place without changing the layout.
 */
export function Features() {
  const { heading, items } = electrical.features

  return (
    <Container id="features" className="scroll-mt-24 pt-20 lg:pt-28">
      <Reveal>
        <h2 className="mb-10 font-sans text-display-s font-semibold lg:mb-16">
          {heading}
        </h2>
      </Reveal>
      <ol className="flex flex-col gap-16 lg:gap-24">
        {items.map((item, i) => (
          <li
            key={item.name}
            className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12"
          >
            <Reveal
              className={cn(
                "flex aspect-[16/10] items-center justify-center rounded-3xl bg-surface p-6 sm:p-10 lg:col-span-7",
                i % 2 === 1 && "lg:order-2 lg:col-start-6"
              )}
            >
              <ToolDiagram diagram={item.diagram} className="max-w-md" />
            </Reveal>
            <Reveal
              className={cn(
                "lg:col-span-4",
                i % 2 === 0 ? "lg:col-start-9" : "lg:order-1"
              )}
            >
              <div className="mb-3 flex items-center gap-4">
                <p className="font-mono text-label text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <StatusChip status={item.status} />
              </div>
              <h3 className="mb-3 font-sans text-display-xs font-semibold">
                {item.name}
              </h3>
              <p className="mb-6 max-w-[44ch] text-paragraph-s text-foreground/85">
                {item.body}
              </p>
              <ul className="border-t border-border">
                {item.details.map((detail) => (
                  <li
                    key={detail}
                    className="border-b border-border py-3 text-paragraph-s text-muted-foreground"
                  >
                    {detail}
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ol>
    </Container>
  )
}
