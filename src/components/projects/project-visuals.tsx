import type { ReactNode } from "react"
import type { Project } from "@/core/config/projects"
import { projectsPage } from "@/core/config/site"
import { cn } from "@/lib/utils"

function VisualPlate({
  children,
  label,
  detail,
  dark = false,
}: {
  children: ReactNode
  label: string
  detail: string
  dark?: boolean
}) {
  return (
    <div
      className={cn(
        "relative h-full min-h-[inherit] overflow-hidden",
        dark ? "bg-slate-dark text-ivory-light" : "bg-secondary text-foreground"
      )}
    >
      <svg
        viewBox="0 0 760 460"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover/visual:scale-105 motion-reduce:transform-none"
      >
        {children}
      </svg>
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 px-6 py-5 font-mono text-detail-xs",
          dark ? "text-ivory-light/70" : "text-muted-foreground"
        )}
      >
        <span>{label}</span>
        <span>{detail}</span>
      </div>
    </div>
  )
}

export function ProjectVisual({ project }: { project: Project }) {
  switch (project.slug) {
    case "orbit":
      return <OrbitVisual />
    case "plant-pi":
      return <PlantVisual />
    case "git-story":
      return <GitStoryVisual />
    case "seamark":
      return <SeamarkVisual />
    case "tex":
      return <TexVisual />
    default:
      return <SandboxVisual />
  }
}

function OrbitVisual() {
  const copy = projectsPage.visuals.orbit
  return (
    <VisualPlate label={copy.measure} detail={copy.signal} dark>
      <g stroke="currentColor" opacity="0.35">
        {Array.from({ length: 15 }, (_, index) => (
          <ellipse
            key={index}
            cx="380"
            cy="215"
            rx={90 + index * 13}
            ry={70 + index * 5}
            transform={`rotate(${index * 11 - 75} 380 215)`}
          />
        ))}
        <path d="M70 215H690M380 30V400" strokeDasharray="2 7" opacity="0.5" />
      </g>
      <circle cx="380" cy="215" r="28" fill="currentColor" opacity="0.85" />
      <circle cx="566" cy="117" r="7" className="fill-olive" />
      <circle cx="566" cy="117" r="22" className="stroke-olive" />
      <path d="M589 117h50m-419 174h-50" stroke="currentColor" opacity="0.45" />
      <circle cx="220" cy="291" r="4" fill="currentColor" />
    </VisualPlate>
  )
}

function SandboxVisual() {
  const copy = projectsPage.visuals.sandbox
  return (
    <VisualPlate label={copy.guest} detail={copy.run} dark>
      <g stroke="currentColor" opacity="0.2">
        {Array.from({ length: 12 }, (_, index) => (
          <path
            key={index}
            d={`M${130 + index * 21} ${116 - index * 3}L${320 + index * 21} ${42 + index * 8}V${300 + index * 8}L${130 + index * 21} ${374 - index * 3}Z`}
          />
        ))}
      </g>
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.8">
        <path d="M130 116L320 42L632 164V340L442 414L130 292ZM130 116L442 238L632 164M442 238V414" />
        <path
          d="M320 42V218L632 340M130 292L320 218L442 266"
          strokeDasharray="4 6"
          opacity="0.4"
        />
      </g>
      <path
        d="M319 178L379 154L442 179V247L382 271L319 246Z"
        className="fill-olive/25 stroke-olive"
        strokeWidth="1.5"
      />
      <path d="M319 178L382 203L442 179M382 203V271" className="stroke-olive" />
      <circle cx="382" cy="203" r="4" className="fill-olive" />
    </VisualPlate>
  )
}

function PlantVisual() {
  const copy = projectsPage.visuals["plant-pi"]
  return (
    <VisualPlate label={copy.reading} detail={copy.pump}>
      <g stroke="currentColor" opacity="0.12">
        <path d="M80 330H680M80 240H680M80 150H680M80 60H680" />
        {Array.from({ length: 9 }, (_, index) => (
          <path key={index} d={`M${100 + index * 70} 45V365`} />
        ))}
      </g>
      <path
        d="M380 370C390 276 355 186 391 76"
        stroke="currentColor"
        strokeWidth="2"
      />
      <g className="stroke-olive" strokeWidth="1.2">
        {Array.from({ length: 12 }, (_, index) => (
          <g key={index}>
            <path
              d={`M380 ${330 - index * 19}Q${200 + index * 11} ${280 - index * 18} ${240 + index * 12} ${120 - index * 3}Q${370 - index * 2} ${170 - index * 7} 380 ${330 - index * 19}`}
            />
            <path
              d={`M380 ${300 - index * 17}Q${540 - index * 9} ${240 - index * 17} ${528 - index * 11} ${90 + index * 3}Q${411 + index * 2} ${150 - index * 5} 380 ${300 - index * 17}`}
            />
          </g>
        ))}
      </g>
      <path d="M342 368h76l-12 27h-52Z" stroke="currentColor" opacity="0.6" />
    </VisualPlate>
  )
}

function GitStoryVisual() {
  const copy = projectsPage.visuals["git-story"]
  return (
    <VisualPlate label={copy.input} detail={copy.output} dark>
      <g stroke="currentColor" opacity="0.25">
        {Array.from({ length: 13 }, (_, index) => (
          <path
            key={index}
            d={`M90 ${62 + index * 25}H${200 + index * 7}C320 ${62 + index * 25} 310 212 402 212H660`}
          />
        ))}
      </g>
      <path d="M90 212H660" className="stroke-olive" strokeWidth="2" />
      <g fill="currentColor">
        {[90, 180, 470, 555, 650].map((x) => (
          <circle key={x} cx={x} cy="212" r="5" />
        ))}
      </g>
      <circle
        cx="382"
        cy="212"
        r="40"
        className="fill-slate-dark stroke-olive"
      />
      <path
        d="M369 200L381 212L369 224M389 224H401"
        stroke="currentColor"
        strokeWidth="2"
      />
      <g fill="currentColor" opacity="0.4">
        {[87, 137, 287, 337].map((y) => (
          <circle key={y} cx="90" cy={y} r="3" />
        ))}
      </g>
    </VisualPlate>
  )
}

function SeamarkVisual() {
  const copy = projectsPage.visuals.seamark
  return (
    <VisualPlate label={copy.field} detail={copy.signal}>
      <g stroke="currentColor" opacity="0.12">
        {Array.from({ length: 12 }, (_, index) => (
          <path
            key={index}
            d={`M${60 + index * 60} 20V420M30 ${30 + index * 35}H730`}
          />
        ))}
      </g>
      <g stroke="currentColor" opacity="0.25">
        {Array.from({ length: 15 }, (_, index) => (
          <path
            key={index}
            d={`M${-60 + index * 13} 0C${220 + index * 8} 130 ${-60 + index * 10} 240 ${190 + index * 11} 450`}
          />
        ))}
      </g>
      <path
        d="M237 379C296 329 359 280 456 220S511 105 650 60"
        className="stroke-olive"
        strokeWidth="2"
      />
      <path
        d="M237 379L456 220L650 60"
        stroke="currentColor"
        strokeDasharray="4 6"
        opacity="0.35"
      />
      <g className="fill-olive">
        {[
          [237, 379],
          [348, 294],
          [456, 220],
          [552, 123],
          [650, 60],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="4" />
        ))}
      </g>
      <circle cx="456" cy="220" r="28" className="stroke-olive" />
      <circle cx="456" cy="220" r="40" className="stroke-olive/30" />
    </VisualPlate>
  )
}

function TexVisual() {
  const copy = projectsPage.visuals.tex
  return (
    <VisualPlate label={copy.source} detail={copy.page}>
      <g stroke="currentColor" opacity="0.15">
        {Array.from({ length: 16 }, (_, index) => (
          <path key={index} d={`M45 ${40 + index * 24}H715`} />
        ))}
      </g>
      <g transform="rotate(-8 275 225)">
        <path
          d="M155 52H395V358H155Z"
          className="fill-background stroke-foreground/30"
        />
        <g stroke="currentColor" opacity="0.3">
          {Array.from({ length: 14 }, (_, index) => (
            <path
              key={index}
              d={`M181 ${88 + index * 17}H${index % 3 === 0 ? 330 : 368}`}
            />
          ))}
        </g>
      </g>
      <g transform="rotate(7 477 226)">
        <path
          d="M359 66H599V380H359Z"
          className="fill-background stroke-foreground/40"
        />
        <path d="M389 106H546" stroke="currentColor" strokeWidth="5" />
        <path d="M389 121H495" stroke="currentColor" strokeWidth="5" />
        <path d="M389 148H569" className="stroke-olive" strokeWidth="2" />
        <g stroke="currentColor" opacity="0.55">
          {Array.from({ length: 12 }, (_, index) => (
            <path
              key={index}
              d={`M389 ${174 + index * 14}H${index % 4 === 3 ? 517 : 569}`}
            />
          ))}
        </g>
        <path d="M389 357H408" stroke="currentColor" />
      </g>
    </VisualPlate>
  )
}
