import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Check, CircleDashed, X } from "lucide-react"

import { sandboxReadiness } from "@/core/config/sandbox"
import type { ReadinessStatus } from "@/core/config/sandbox"
import { cn } from "@/lib/utils"

const totalControls = sandboxReadiness.reduce(
  (total, group) => total + group.count,
  0
)

const statusMeta = {
  Implemented: { icon: Check, color: "bg-olive" },
  Partial: {
    icon: CircleDashed,
    color: "bg-foreground/35",
  },
  Missing: { icon: X, color: "bg-destructive" },
} as const

export function ReadinessLedger() {
  const reduceMotion = useReducedMotion()
  const [activeStatus, setActiveStatus] = useState<ReadinessStatus>("Partial")
  const active =
    sandboxReadiness.find((group) => group.status === activeStatus) ??
    sandboxReadiness[1]
  const activeMeta = statusMeta[active.status]
  const ActiveIcon = activeMeta.icon

  return (
    <div>
      <div
        className="flex h-5 w-full overflow-hidden rounded-full bg-secondary"
        role="img"
        aria-label={`Current source review: 2 of ${totalControls} control areas implemented, 9 partial, and 6 missing`}
      >
        {sandboxReadiness.map((group) => (
          <motion.span
            key={group.status}
            className={cn("h-full", statusMeta[group.status].color)}
            initial={reduceMotion ? false : { width: 0 }}
            whileInView={{
              width: `${(group.count / totalControls) * 100}%`,
            }}
            viewport={{ once: true }}
            transition={{
              duration: reduceMotion ? 0 : 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </div>

      <div className="bg-faded mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl">
        {sandboxReadiness.map((group) => {
          const selected = group.status === active.status
          const meta = statusMeta[group.status]
          const Icon = meta.icon

          return (
            <button
              key={group.status}
              type="button"
              onClick={() => setActiveStatus(group.status)}
              aria-pressed={selected}
              className={cn(
                "bg-background p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset sm:p-5",
                selected && "bg-secondary"
              )}
            >
              <span className="flex items-center gap-2 text-foreground">
                <Icon
                  className={cn(
                    "size-4",
                    group.status === "Implemented" && "text-olive"
                  )}
                  aria-hidden="true"
                />
                <span className="font-mono text-detail-xs uppercase">
                  {group.status}
                </span>
              </span>
              <span className="mt-3 block text-display-m font-semibold tabular-nums">
                {group.count}
                <span className="ml-1 text-paragraph-s font-normal text-muted-foreground">
                  / {totalControls}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-8 grid gap-8 border-t border-border pt-7 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div aria-live="polite">
          <p className="flex items-center gap-2 text-foreground">
            <ActiveIcon
              className={cn(
                "size-4",
                active.status === "Implemented" && "text-olive"
              )}
              aria-hidden="true"
            />
            <span className="font-mono text-detail-xs uppercase">
              {active.status} · {active.count} control areas
            </span>
          </p>
          <p className="mt-3 text-paragraph-m text-pretty">{active.summary}</p>
        </div>

        <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {active.controls.map((control) => (
            <li
              key={control}
              className="flex items-center gap-3 border-b border-border py-3 text-paragraph-s"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  activeMeta.color
                )}
              />
              {control}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
