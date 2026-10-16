import { electrical } from "@/core/config/electrical"
import { cn } from "@/lib/utils"
import { Container } from "@/components/layout/container"
import { ToolDiagram } from "@/components/electrical/tool-diagram"
import { Reveal } from "@/components/ui/reveal"

/**
 * One row per tool: a large drawing of what it does, with its name and one
 * line beside it. Rows alternate sides on wide screens. The drawing sits in a
 * 16:10 frame so a short screen recording can take its place later.
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
      <ul className="flex flex-col gap-14 lg:gap-20">
        {items.map((item, i) => (
          <li
            key={item.name}
            className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12"
          >
            <Reveal
              className={cn(
                "flex aspect-[16/10] items-center justify-center rounded-3xl bg-surface p-6 sm:p-10 lg:col-span-8",
                i % 2 === 1 && "lg:order-2 lg:col-start-5"
              )}
            >
              <ToolDiagram diagram={item.diagram} className="max-w-md" />
            </Reveal>
            <Reveal
              className={cn(
                "lg:col-span-3 lg:pb-2",
                i % 2 === 0 ? "lg:col-start-10" : "lg:order-1"
              )}
            >
              <h3 className="mb-2 font-sans text-display-xs font-semibold">
                {item.name}
              </h3>
              <p className="max-w-[32ch] text-paragraph-s text-muted-foreground">
                {item.body}
              </p>
            </Reveal>
          </li>
        ))}
      </ul>
    </Container>
  )
}
