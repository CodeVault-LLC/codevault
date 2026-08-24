import { useState } from "react"
import { Check, Copy, Terminal } from "lucide-react"

import { sandboxRuns } from "@/core/config/sandbox"
import { cn } from "@/lib/utils"

export function RunDeck() {
  const [activeId, setActiveId] = useState(sandboxRuns[1].id)
  const [copied, setCopied] = useState(false)
  const active =
    sandboxRuns.find((example) => example.id === activeId) ?? sandboxRuns[1]

  async function copyCommand() {
    await navigator.clipboard.writeText(active.command)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div
        className="flex overflow-x-auto border-b border-border bg-secondary"
        role="group"
        aria-label="Example sandbox runs"
      >
        {sandboxRuns.map((example) => (
          <button
            key={example.id}
            type="button"
            aria-pressed={example.id === active.id}
            onClick={() => {
              setActiveId(example.id)
              setCopied(false)
            }}
            className={cn(
              "min-w-fit border-r border-border px-5 py-3.5 font-mono text-detail-xs uppercase transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset",
              example.id === active.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            )}
          >
            {example.label}
          </button>
        ))}
      </div>

      <div
        aria-live="polite"
        className="grid min-w-0 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]"
      >
        <div className="min-w-0 border-b border-border p-6 sm:p-8 lg:border-r lg:border-b-0">
          <Terminal className="size-5 text-olive" aria-hidden="true" />
          <h3 className="mt-6 text-display-s font-semibold">{active.title}</h3>
          <p className="mt-3 text-paragraph-s text-pretty text-muted-foreground">
            {active.note}
          </p>

          <div className="mt-8 min-w-0 overflow-hidden rounded-xl bg-foreground text-background">
            <div className="flex items-center justify-between border-b border-background/15 px-4 py-2.5">
              <span className="font-mono text-detail-xs text-background/70 uppercase">
                Example command
              </span>
              <button
                type="button"
                onClick={copyCommand}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-detail-xs text-background/70 transition-colors outline-none hover:bg-background/10 hover:text-background focus-visible:ring-2 focus-visible:ring-background/60"
                aria-label="Copy example command"
              >
                {copied ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-paragraph-s leading-relaxed text-background/85">
              <code>{active.command}</code>
            </pre>
          </div>
        </div>

        <ol className="relative min-w-0 p-6 sm:p-8">
          {active.stages.map((stage, index) => (
            <li
              key={`${active.id}-${stage.label}`}
              className="relative grid grid-cols-[auto_1fr] gap-4 pb-7 last:pb-0"
            >
              {index < active.stages.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-8 bottom-0 left-3 w-px bg-border"
                />
              )}
              <span className="relative z-10 flex size-6 items-center justify-center rounded-full border border-border bg-background font-mono text-detail-xs text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-paragraph-s font-medium">
                    {stage.label}
                  </h4>
                  <span className="font-mono text-detail-xs text-muted-foreground uppercase">
                    {stage.boundary}
                  </span>
                </div>
                <p className="mt-1.5 text-paragraph-s text-pretty text-muted-foreground">
                  {stage.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
