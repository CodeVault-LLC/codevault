import { useState } from "react"
import { Check, LockKeyhole, ShieldAlert } from "lucide-react"

import { sandboxBoundaries } from "@/core/config/sandbox"
import type { SandboxBoundary } from "@/core/config/sandbox"
import { cn } from "@/lib/utils"

const stateMeta = {
  trusted: { label: "Host trusted", icon: Check },
  controlled: { label: "Controlled crossing", icon: LockKeyhole },
  untrusted: { label: "Treated as untrusted", icon: ShieldAlert },
} as const

function BoundaryRow({
  boundary,
  selected,
  onSelect,
}: {
  boundary: SandboxBoundary
  selected: boolean
  onSelect: () => void
}) {
  const meta = stateMeta[boundary.state]
  const Icon = meta.icon

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group grid w-full grid-cols-[1fr_auto] items-center gap-4 border-b border-background/15 py-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-background/60 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground",
        selected
          ? "text-background"
          : "text-background/70 hover:text-background"
      )}
    >
      <span className="text-paragraph-s font-medium">{boundary.label}</span>
      <Icon
        aria-hidden="true"
        className={cn(
          "size-4",
          boundary.state === "trusted" && "text-olive",
          boundary.state === "untrusted" && "text-destructive"
        )}
      />
    </button>
  )
}

export function ContainmentMap() {
  const [activeId, setActiveId] = useState(sandboxBoundaries[1].id)
  const active =
    sandboxBoundaries.find((boundary) => boundary.id === activeId) ??
    sandboxBoundaries[1]
  const meta = stateMeta[active.state]
  const ActiveIcon = meta.icon

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
      <div>
        <div className="border-t border-background/20">
          {sandboxBoundaries.map((boundary) => (
            <BoundaryRow
              key={boundary.id}
              boundary={boundary}
              selected={boundary.id === active.id}
              onSelect={() => setActiveId(boundary.id)}
            />
          ))}
        </div>
        <p className="mt-4 text-paragraph-s text-background/70">
          Select a crossing to inspect what moves through it and what stays
          outside.
        </p>
      </div>

      <div className="relative min-h-[28rem] overflow-hidden rounded-2xl bg-background p-5 text-foreground sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-border"
        />

        <div className="relative grid h-full content-between gap-3">
          {sandboxBoundaries.map((boundary) => {
            const selected = boundary.id === active.id

            return (
              <button
                key={boundary.id}
                type="button"
                onClick={() => setActiveId(boundary.id)}
                aria-label={`Inspect ${boundary.title}`}
                aria-pressed={selected}
                className={cn(
                  "relative z-10 mx-auto flex w-full max-w-md items-center justify-between gap-4 rounded-xl border bg-background px-4 py-3 text-left transition-[border-color,background-color,transform] outline-none focus-visible:ring-2 focus-visible:ring-ring/60 motion-reduce:transform-none motion-reduce:transition-none",
                  selected
                    ? "border-foreground bg-secondary sm:scale-[1.025]"
                    : "border-border hover:border-foreground/30"
                )}
              >
                <span>
                  <span className="block font-mono text-detail-xs text-muted-foreground uppercase">
                    {boundary.label}
                  </span>
                  <span className="mt-1 block text-paragraph-s font-medium">
                    {boundary.title}
                  </span>
                </span>
                <span
                  className={cn(
                    "size-2.5 shrink-0 rounded-full border",
                    boundary.state === "trusted" && "border-olive bg-olive",
                    boundary.state === "controlled" &&
                      "border-foreground/40 bg-background",
                    boundary.state === "untrusted" &&
                      "border-destructive bg-destructive"
                  )}
                />
              </button>
            )
          })}
        </div>
      </div>

      <div
        className="border-t border-background/20 pt-6 lg:col-start-2"
        aria-live="polite"
      >
        <p className="flex items-center gap-2 font-mono text-detail-xs text-background/70 uppercase">
          <ActiveIcon className="size-3.5" aria-hidden="true" />
          {meta.label}
        </p>
        <h3 className="mt-3 text-display-s font-semibold text-background">
          {active.title}
        </h3>
        <p className="mt-3 max-w-2xl text-paragraph-s text-pretty text-background/70">
          {active.body}
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {active.keeps.map((item) => (
            <li
              key={item}
              className="rounded-full border border-background/20 px-3 py-1.5 font-mono text-detail-xs text-background/75"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
