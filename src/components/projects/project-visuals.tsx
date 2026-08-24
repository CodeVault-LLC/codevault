import type { Project } from "@/core/config/projects"

import { projectsPage } from "@/core/config/site"

export function ProjectVisual({ project }: { project: Project }) {
  switch (project.slug) {
    case "orbit":
      return <OrbitVisual />
    case "plant-pi":
      return <PlantVisual />
    case "git-story":
      return <GitStoryVisual project={project} />
    case "seamark":
      return <SeamarkVisual />
    case "tex":
      return <TexVisual />
    case "sandbox":
      return <SandboxVisual />
    default:
      return <FallbackVisual />
  }
}

function OrbitVisual() {
  const copy = projectsPage.visuals.orbit

  return (
    <div className="relative flex h-full min-h-[inherit] overflow-hidden bg-foreground text-background">
      <svg
        aria-hidden="true"
        viewBox="0 0 760 460"
        className="absolute inset-0 h-full w-full"
      >
        <g
          fill="none"
          stroke="currentColor"
          className="text-background/35 transition-colors duration-500 group-hover/visual:text-background/50"
        >
          <ellipse cx="380" cy="230" rx="270" ry="86" />
          <ellipse
            cx="380"
            cy="230"
            rx="238"
            ry="118"
            transform="rotate(24 380 230)"
          />
          <ellipse
            cx="380"
            cy="230"
            rx="190"
            ry="140"
            transform="rotate(-32 380 230)"
          />
          <ellipse
            cx="380"
            cy="230"
            rx="128"
            ry="188"
            transform="rotate(52 380 230)"
          />
          <circle cx="380" cy="230" r="54" />
          <circle cx="380" cy="230" r="33" />
        </g>
        <g fill="currentColor" className="text-background">
          <circle cx="151" cy="184" r="4" />
          <circle cx="314" cy="333" r="4" />
          <circle cx="548" cy="151" r="4" />
          <circle cx="618" cy="291" r="4" />
        </g>
        <g fill="none" stroke="currentColor" className="text-olive">
          <circle cx="476" cy="300" r="18" />
          <circle cx="476" cy="300" r="6" fill="currentColor" />
          <path d="M494 300h72" />
        </g>
      </svg>
      <div className="relative mt-auto flex w-full items-end justify-between gap-6 p-6 sm:p-8">
        <p className="font-mono text-detail-xs text-background/65">
          {copy.measure}
        </p>
        <p className="font-mono text-detail-xs text-olive">{copy.signal}</p>
      </div>
    </div>
  )
}

function PlantVisual() {
  const copy = projectsPage.visuals["plant-pi"]

  return (
    <div className="relative flex h-full min-h-[inherit] flex-col justify-between overflow-hidden bg-secondary p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-detail-xs text-muted-foreground">
          {copy.reading}
        </p>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 720 330"
        className="my-6 h-auto w-full"
      >
        <g fill="none" stroke="currentColor" className="text-border">
          <path d="M30 56h660M30 124h660M30 192h660" />
          <path d="M30 30v190M195 30v190M360 30v190M525 30v190M690 30v190" />
        </g>
        <path
          d="M30 122C70 114 86 84 124 104s54 68 91 42 57-45 93-13 64 52 100 12 61-76 99-30 58 64 92 20 54-51 91-32"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-olive"
        />
        <g fill="none" stroke="currentColor" className="text-foreground/70">
          <rect x="92" y="258" width="120" height="46" />
          <rect x="300" y="246" width="94" height="58" />
          <rect x="508" y="258" width="120" height="46" />
          <path d="M212 281h88M394 275h114" />
          <path d="M347 246v-30h208v42" strokeDasharray="8 8" />
        </g>
      </svg>

      <div className="grid grid-cols-2 gap-6 font-mono text-detail-xs text-muted-foreground">
        <p>{copy.reservoir}</p>
        <p>{copy.pump}</p>
      </div>
    </div>
  )
}

function GitStoryVisual({ project }: { project: Project }) {
  const copy = projectsPage.visuals["git-story"]

  return (
    <div className="grid h-full min-h-[inherit] min-w-0 bg-foreground text-background sm:grid-cols-2">
      <div className="min-w-0 border-b border-background/15 p-6 sm:border-r sm:border-b-0 sm:p-8">
        <p className="font-mono text-detail-xs text-background/55">
          {copy.input}
        </p>
        <ol className="mt-8 font-mono text-detail-xs text-background/70">
          {project.log.slice(0, 3).map((entry) => (
            <li
              key={entry.date}
              className="border-t border-background/15 py-4 first:border-t-0 first:pt-0"
            >
              <span>{entry.title}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex min-w-0 flex-col justify-end p-6 sm:p-8">
        <p className="font-mono text-detail-xs text-background/55">
          {copy.output}
        </p>
        <p className="mt-8 text-paragraph-m text-pretty text-background/85">
          {project.notes[0]}
        </p>
      </div>
    </div>
  )
}

function SeamarkVisual() {
  const copy = projectsPage.visuals.seamark
  const paths = [
    "M-30 90C140 20 230 190 410 106S650 30 810 96",
    "M-20 164C130 228 282 36 454 162S674 274 800 198",
    "M-40 238C118 156 266 328 448 236S646 132 812 286",
    "M-20 338C146 246 256 418 438 326S650 222 800 356",
    "M86 -20C132 112 34 184 118 286s46 138 26 202",
    "M646 -30C586 98 722 176 632 278s-36 148-12 204",
  ]

  return (
    <div className="relative flex h-full min-h-[inherit] overflow-hidden bg-foreground text-background">
      <svg
        aria-hidden="true"
        viewBox="0 0 760 460"
        className="absolute inset-0 h-full w-full"
      >
        <g
          fill="none"
          stroke="currentColor"
          className="text-background/18 transition-colors duration-500 group-hover/visual:text-background/28"
        >
          {paths.map((path) => (
            <path key={path} d={path} />
          ))}
        </g>
        <path
          d="M-20 382C88 348 155 272 246 292s121 68 194 22 132-142 218-120 86 98 146 76"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-olive"
        />
        <g fill="currentColor" className="text-olive">
          <circle cx="247" cy="292" r="5" />
          <circle cx="440" cy="314" r="5" />
          <circle cx="659" cy="194" r="5" />
        </g>
      </svg>
      <div className="relative mt-auto flex w-full items-end justify-between gap-6 p-6 sm:p-8">
        <p className="font-mono text-detail-xs text-background/55">
          {copy.field}
        </p>
        <p className="font-mono text-detail-xs text-olive">{copy.signal}</p>
      </div>
    </div>
  )
}

function TexVisual() {
  const copy = projectsPage.visuals.tex

  return (
    <div className="grid h-full min-h-[inherit] min-w-0 bg-secondary sm:grid-cols-2">
      <div className="border-faded min-w-0 border-b p-6 sm:border-r sm:border-b-0 sm:p-8">
        <p className="font-mono text-detail-xs text-muted-foreground">
          {copy.source}
        </p>
        <pre className="mt-8 max-w-full overflow-hidden font-mono text-paragraph-s leading-loose whitespace-pre-wrap text-foreground/70">
          <code>{`\\section{${copy.heading}}\n\n${copy.body}\n\n\\emph{${copy.emphasis}}`}</code>
        </pre>
      </div>
      <div className="relative min-w-0 overflow-hidden p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="border-faded pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_calc(2rem-1px),var(--border)_2rem)] bg-size-[100%_2rem] opacity-40"
        />
        <p className="relative font-mono text-detail-xs text-muted-foreground">
          {copy.page}
        </p>
        <div className="relative mt-8 max-w-sm">
          <p className="text-display-m font-semibold text-balance">
            {copy.heading}
          </p>
          <p className="mt-6 text-paragraph-m text-pretty text-foreground/80">
            {copy.body}
          </p>
          <p className="mt-5 font-serif text-paragraph-m italic">
            {copy.emphasis}
          </p>
        </div>
      </div>
    </div>
  )
}

function SandboxVisual() {
  const copy = projectsPage.visuals.sandbox

  return (
    <div className="relative flex h-full min-h-[inherit] items-center bg-foreground p-6 text-background sm:p-8">
      <div className="grid w-full grid-cols-1 border border-background/25 sm:grid-cols-[0.72fr_1.1fr_0.72fr]">
        <div className="border-b border-background/25 p-5 sm:border-r sm:border-b-0">
          <p className="font-mono text-detail-xs text-background/55">
            {copy.host}
          </p>
          <div className="mt-8 h-px bg-background/30" />
        </div>
        <div className="border-b border-background/25 p-5 sm:border-r sm:border-b-0">
          <p className="font-mono text-detail-xs text-olive">{copy.guest}</p>
          <div className="mt-8 border border-background/25 p-5">
            <p className="font-mono text-detail-xs text-background/80">
              {copy.run}
            </p>
            <div className="mt-6 flex gap-2">
              <span className="h-1 w-1/3 bg-olive" />
              <span className="h-1 w-1/4 bg-background/35" />
              <span className="h-1 w-1/5 bg-background/20" />
            </div>
          </div>
        </div>
        <div className="p-5">
          <p className="font-mono text-detail-xs text-background/55">
            {copy.network}
          </p>
          <div className="mt-8 flex items-center gap-2">
            <span className="size-2 bg-olive" />
            <span className="h-px flex-1 bg-background/30" />
          </div>
        </div>
      </div>
    </div>
  )
}

function FallbackVisual() {
  return (
    <div aria-hidden="true" className="h-full min-h-[inherit] bg-secondary" />
  )
}
