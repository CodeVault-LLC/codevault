import { Link } from "@tanstack/react-router"

import { kilo } from "@/core/config/kilo"
import { KiloScene } from "@/components/kilo/kilo-scene"
import { Arrow, buttonClass } from "@/components/ui/button-link"

/**
 * The big announcement card. The canvas draws Kilo's scene; the title rides
 * an arc above it. The whole card is one link, like Anthropic's.
 */
export function KiloAnnouncement() {
  return (
    <section
      aria-labelledby="kilo-announcement"
      className="fade-rise"
      style={{ "--d": "250ms" } as React.CSSProperties}
    >
      <Link
        to="/news/$slug"
        params={{ slug: kilo.announcementSlug }}
        className="group/card relative block h-[clamp(34rem,52vw,44rem)] overflow-hidden rounded-3xl bg-surface focus-visible:outline-offset-4"
      >
        <KiloScene />

        <h2 id="kilo-announcement" className="sr-only">
          {kilo.title}
        </h2>
        <ArcTitle text={kilo.title} />

        <div className="absolute inset-x-0 bottom-[7%] flex flex-col items-center gap-6 px-6 text-center">
          <p className="max-w-[30ch] text-paragraph-m text-balance sm:text-paragraph-l">
            {kilo.summary.split(".")[0]}.
          </p>
          <span className={buttonClass("primary")}>
            Read the announcement
            <Arrow />
          </span>
        </div>
      </Link>
    </section>
  )
}

/** The headline set along an arc, rising in letter by letter. */
function ArcTitle({ text }: { text: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 250"
      className="absolute top-[4%] left-1/2 w-[min(52rem,92%)] -translate-x-1/2 overflow-visible"
    >
      <defs>
        <path id="kilo-title-arc" d="M 40 236 A 1150 1150 0 0 1 960 236" />
      </defs>
      <text
        className="fill-foreground font-serif"
        fontSize="112"
        letterSpacing="-1"
      >
        <textPath href="#kilo-title-arc" startOffset="50%" textAnchor="middle">
          {[...text].map((ch, i) => (
            <tspan
              key={i}
              className="letter-in"
              style={{ "--i": i } as React.CSSProperties}
            >
              {ch}
            </tspan>
          ))}
        </textPath>
      </text>
    </svg>
  )
}
