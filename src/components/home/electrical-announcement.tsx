import { Link } from "@tanstack/react-router"

import { electrical } from "@/core/config/electrical"
import { RoutingScene } from "@/components/electrical/routing-scene"
import { Arrow, buttonClass } from "@/components/ui/button-link"

/**
 * The big announcement card. The canvas draws the routing scene; the product
 * name rides an arc above it. The whole card is one link, like Anthropic's.
 */
export function ElectricalAnnouncement() {
  return (
    <section
      aria-labelledby="electrical-announcement"
      className="fade-rise"
      style={{ "--d": "250ms" } as React.CSSProperties}
    >
      <Link
        to="/news/$slug"
        params={{ slug: electrical.announcementSlug }}
        className="group/card relative block h-[clamp(34rem,52vw,44rem)] overflow-hidden rounded-3xl bg-surface focus-visible:outline-offset-4"
      >
        <RoutingScene />

        <h2 id="electrical-announcement" className="sr-only">
          Introducing {electrical.name}
        </h2>
        <ArcTitle text={electrical.name} />

        <div className="absolute inset-x-0 bottom-[6%] flex flex-col items-center gap-5 px-6 text-center">
          <p className="max-w-[30ch] text-paragraph-m text-balance sm:text-paragraph-l">
            {electrical.tagline}
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
  // Sized to the arc: short titles at full size, longer ones scaled to fit.
  const size = Math.min(112, Math.round(1750 / text.length))
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 250"
      className="absolute top-[4%] left-1/2 w-[min(52rem,92%)] -translate-x-1/2 overflow-visible"
    >
      <defs>
        <path id="announcement-arc" d="M 40 236 A 1150 1150 0 0 1 960 236" />
      </defs>
      <text
        className="fill-foreground font-serif"
        fontSize={size}
        letterSpacing="-1"
      >
        <textPath
          href="#announcement-arc"
          startOffset="50%"
          textAnchor="middle"
        >
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
