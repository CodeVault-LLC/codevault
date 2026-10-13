import { useEffect, useRef, useState } from "react"

import { electrical } from "@/core/config/electrical"
import { images } from "@/core/config/images"
import { gsap, motionQuery, useGSAP } from "@/core/lib/motion"
import { cn } from "@/lib/utils"
import { HeadlineWords } from "@/components/ui/headline-words"

/**
 * The Electrical page's hero: one building, the full width of the screen.
 *
 * It opens dark, like the building before the lights are on. The drawing of
 * the space blooms out from the middle in faint light lines, then the
 * photograph comes up out of the dark through it, the model becoming the
 * building, and the name and an index of the page follow. After
 * that the camera drifts very slowly. Scrolling away lifts the words off and
 * lets the picture go.
 *
 * The scene is in three lights, morning, noon and evening, one camera and
 * one composition. It opens in the light of the visitor's own time of day,
 * and the switch at the bottom changes it. With reduced motion it opens
 * finished and holds still.
 */

type Light = "morning" | "noon" | "evening"

const LIGHTS: Light[] = ["morning", "noon", "evening"]

const PHOTOS = {
  morning: images.heroMorning,
  noon: images.heroNoon,
  evening: images.heroEvening,
}

/** The light for the visitor's local hour. */
function lightNow(): Light {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 10) return "morning"
  if (hour >= 10 && hour < 17) return "noon"
  return "evening"
}

/** The page's sections, in order, for the index under the name. */
const INDEX = [
  { id: "tools", label: electrical.tools.heading },
  { id: "model", label: electrical.model.heading },
  { id: "how", label: electrical.principles.heading },
  { id: "status", label: electrical.status.heading },
  { id: "questions", label: electrical.faq.heading },
]

const src = (name: string, width: number) => `/images/${name}-${width}.webp`

export function ElectricalHero() {
  const { hero } = electrical
  const root = useRef<HTMLElement>(null)
  // The server renders noon; the visitor's own light fades in on arrival.
  const [light, setLight] = useState<Light>("noon")

  useEffect(() => setLight(lightNow()), [])

  // Scrolling away lifts the words off and lets the picture go.
  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()
      mm.add(motionQuery.ok, () => {
        const scroll = {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
        gsap.to(q("[data-lift]"), {
          y: -80,
          opacity: 0,
          ease: "none",
          scrollTrigger: { ...scroll, end: "60% top" },
        })
        gsap.to(q("[data-recede]"), {
          scale: 1.08,
          ease: "none",
          scrollTrigger: scroll,
        })
      })
    },
    { scope: root }
  )

  return (
    <section
      ref={root}
      aria-labelledby="electrical-hero"
      className="relative isolate flex h-[calc(100svh-4rem)] min-h-[36rem] flex-col overflow-hidden bg-slate lg:h-[calc(100svh-4.5rem)]"
    >
      <div data-recede="" className="absolute inset-0 -z-10">
        {/* The drawing, first, in faint light lines on the dark, blooming
            out from the middle. */}
        <img
          src={src("hero-drawing", 1536)}
          alt=""
          width={1536}
          height={1024}
          fetchPriority="high"
          decoding="async"
          className="hero-bloom absolute inset-0 size-full object-cover opacity-35 invert"
        />
        {/* Then the photograph, developing through it, in three lights. */}
        <div className="hero-develop absolute inset-0">
          <div className="hero-drift absolute inset-0">
            {LIGHTS.map((name) => {
              const photo = PHOTOS[name]
              return (
                <img
                  key={name}
                  src={src(photo.name, 1536)}
                  srcSet={`${src(photo.name, 960)} 960w, ${src(photo.name, 1536)} 1536w`}
                  sizes="100vw"
                  alt={name === light ? photo.alt : ""}
                  width={photo.width}
                  height={photo.height}
                  fetchPriority={name === "noon" ? "high" : "low"}
                  decoding="async"
                  className="absolute inset-0 size-full object-cover transition-opacity duration-[1800ms] ease-out-soft"
                  style={{ opacity: name === light ? 1 : 0 }}
                />
              )
            })}
          </div>
        </div>
        {/* A shade behind the words, so they read in every light. */}
        <div className="hero-shade absolute inset-0 bg-[radial-gradient(ellipse_62%_58%_at_50%_50%,color-mix(in_oklab,var(--slate-dark)_66%,transparent),transparent_78%),linear-gradient(to_top,color-mix(in_oklab,var(--slate-dark)_45%,transparent),transparent_35%)]" />
      </div>

      <div
        data-lift=""
        className="flex flex-1 flex-col items-center justify-center px-4 pt-10 text-center text-ivory [text-shadow:0_1px_18px_color-mix(in_oklab,var(--slate-dark)_55%,transparent)]"
      >
        <p
          className="fade-rise mb-5 font-mono text-label uppercase opacity-80"
          style={{ "--d": "2700ms" } as React.CSSProperties}
        >
          {hero.eyebrow}
        </p>
        <h1
          id="electrical-hero"
          className="font-serif text-display-xxl text-balance"
        >
          <HeadlineWords text={electrical.name} delay={2850} />
        </h1>

        <nav aria-label="On this page" className="mt-10 w-full max-w-[30rem]">
          <ol>
            {INDEX.map((entry, i) => (
              <li
                key={entry.id}
                className="fade-rise"
                style={{ "--d": `${3300 + i * 90}ms` } as React.CSSProperties}
              >
                <a
                  href={`#${entry.id}`}
                  className="group/index flex items-center gap-3 py-2 font-sans text-ui"
                >
                  <span className="font-mono text-label opacity-70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* A run to the label: dashed, until you point at it. */}
                  <span
                    aria-hidden
                    className="hero-leader relative flex flex-1 items-center"
                    style={
                      { "--d": `${3400 + i * 90}ms` } as React.CSSProperties
                    }
                  >
                    <span className="size-1.5 shrink-0 bg-ivory" />
                    <span className="h-0 flex-1 border-t border-dashed border-ivory/85 transition-colors duration-300 group-hover/index:border-solid group-hover/index:border-persimmon" />
                    <span className="size-1.5 shrink-0 bg-ivory transition-colors duration-300 group-hover/index:bg-persimmon" />
                  </span>
                  <span className="text-right">{entry.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div
        data-lift=""
        className="fade-rise flex items-end justify-between gap-4 px-4 pb-4 text-ivory sm:px-8 sm:pb-6"
        style={{ "--d": "3900ms" } as React.CSSProperties}
      >
        <div
          role="group"
          aria-label={hero.light.label}
          className="flex rounded-full bg-slate/35 p-1 backdrop-blur-md"
        >
          {LIGHTS.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={name === light}
              onClick={() => setLight(name)}
              className={cn(
                "rounded-full px-3 py-1.5 font-sans text-caption transition-colors duration-300",
                name === light
                  ? "bg-ivory text-slate"
                  : "text-ivory/80 hover:text-ivory"
              )}
            >
              {hero.light[name]}
            </button>
          ))}
        </div>
        <p className="hidden font-mono text-label uppercase opacity-60 sm:block">
          {hero.credit}
        </p>
      </div>
    </section>
  )
}
