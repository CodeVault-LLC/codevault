import { useState } from "react"
import { Ban, Check, CircleDashed } from "lucide-react"

import { sandboxNetworkModes } from "@/core/config/sandbox"
import { cn } from "@/lib/utils"

const statusMeta = {
  enforced: { label: "Enforced", icon: Check },
  partial: { label: "Partial", icon: CircleDashed },
  blocked: { label: "Fails closed", icon: Ban },
} as const

export function NetworkRange() {
  const [activeId, setActiveId] = useState(sandboxNetworkModes[0].id)
  const active =
    sandboxNetworkModes.find((mode) => mode.id === activeId) ??
    sandboxNetworkModes[0]
  const activeMeta = statusMeta[active.status]
  const ActiveIcon = activeMeta.icon

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-14">
      <div>
        <div className="relative pt-7">
          <div
            aria-hidden="true"
            className="absolute top-10 right-[12.5%] left-[12.5%] h-px bg-border"
          />
          <div className="relative grid grid-cols-4 gap-2">
            {sandboxNetworkModes.map((mode) => {
              const selected = mode.id === active.id
              const Icon = statusMeta[mode.status].icon

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveId(mode.id)}
                  aria-pressed={selected}
                  className="group flex min-w-0 flex-col items-center text-center outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-4"
                >
                  <span
                    className={cn(
                      "relative z-10 flex size-7 items-center justify-center rounded-full border bg-background transition-[transform,border-color,background-color] motion-reduce:transform-none motion-reduce:transition-none",
                      selected && "scale-125 border-foreground bg-foreground",
                      !selected && mode.status === "enforced" && "border-olive",
                      !selected &&
                        mode.status === "partial" &&
                        "border-foreground/35",
                      !selected &&
                        mode.status === "blocked" &&
                        "border-foreground/40"
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className={cn(
                        "size-3.5",
                        selected ? "text-background" : "text-muted-foreground"
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "mt-4 truncate text-paragraph-s font-medium",
                      selected ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {mode.label}
                  </span>
                  <span className="mt-1 hidden font-mono text-detail-xs text-muted-foreground uppercase sm:block">
                    {statusMeta[mode.status].label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-4 border-y border-border py-3 font-mono text-detail-xs text-muted-foreground uppercase">
          <span className="text-left">Guest</span>
          <span className="text-center">Sinks</span>
          <span className="text-center">Targets</span>
          <span className="text-right">Internet</span>
        </div>
        <p className="mt-3 text-paragraph-s text-pretty text-muted-foreground">
          This axis shows intended reach, not a maturity score. The two wider
          modes remain unavailable where enforcement is incomplete.
        </p>
      </div>

      <div className="border-t border-border pt-6" aria-live="polite">
        <p className="flex items-center gap-2 font-mono text-detail-xs text-foreground uppercase">
          <ActiveIcon
            className={cn(
              "size-4",
              active.status === "enforced" && "text-olive"
            )}
            aria-hidden="true"
          />
          {activeMeta.label}
        </p>
        <h3 className="mt-4 text-display-s font-semibold">
          {active.label}: {active.summary}
        </h3>
        <p className="mt-3 text-paragraph-s text-pretty text-muted-foreground">
          {active.detail}
        </p>
      </div>
    </div>
  )
}
