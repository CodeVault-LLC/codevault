import { useRef } from "react"

import { images } from "@/core/config/images"
import { electrical } from "@/core/config/electrical"
import { gsap, motionQuery, useGSAP } from "@/core/lib/motion"

/**
 * From the building to the route: a scroll sequence. The frame stays pinned
 * while the page scrolls past it, and scrolling plays it, forwards and back.
 *
 * 1. A photographed ceiling, half built, settles in.
 * 2. A scan line sweeps across and leaves its drawing behind: the same
 *    ceiling, edge for edge (the drawing is traced from the photograph).
 * 3. A junction box and an end point are picked, and a route is suggested
 *    along the ceiling, dashed.
 * 4. A check runs along it, and it's added: solid.
 *
 * The route follows the conduit that's in the photograph, and photo,
 * drawing and route share one 3:2 stage, so they stay in register however
 * the frame crops and scales. With reduced
 * motion it isn't pinned and shows its last stage.
 */

/** The run along the ceiling, in the photograph's pixels (1536 × 1024). */
const ROUTE = "M 640 114 H 1140 Q 1182 114 1182 156 V 288"
/** The junction box the run starts from, as it is in the photograph. */
const BOX = { x: 553, y: 81, width: 86, height: 68 }
/** Where the run ends, at the beam. */
const END = { x: 1182, y: 302 }

/** Where the camera pushes in: around the run, as a fraction of the stage. */
const FOCUS = "58% 14%"

/** When each stage begins, on the timeline (10 units long). */
const STAGES = [0, 2.6, 5, 8.2]

export function ModelReveal() {
  const root = useRef<HTMLElement>(null)
  const { heading, steps } = electrical.model

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()

      mm.add(motionQuery.ok, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top+=88",
            end: "bottom bottom",
            scrub: 0.8,
          },
        })

        // Phones show a narrower slice of the ceiling, so move in less.
        const closeUp = window.matchMedia("(max-width: 639px)").matches
          ? 1.1
          : 1.32

        // 1. The photograph settles.
        gsap.set(q("[data-stage]"), { transformOrigin: FOCUS })
        tl.fromTo(
          q("[data-stage]"),
          { scale: 1.12 },
          { scale: 1, duration: 3.4, ease: "power1.out" },
          0
        )
          // The camera moves in on the run while it's picked and drawn,
          // and back out once it's added.
          .to(
            q("[data-stage]"),
            { scale: closeUp, duration: 1.4, ease: "power2.inOut" },
            4.6
          )
          .to(
            q("[data-stage]"),
            { scale: 1, duration: 1.2, ease: "power2.inOut" },
            9.4
          )

        // 2. The scan line turns it into the drawing.
        tl.fromTo(
          q("[data-photo]"),
          { clipPath: "inset(0% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 100%)",
            duration: 2.4,
            ease: "power2.inOut",
          },
          2.6
        )
          .fromTo(
            q("[data-scan]"),
            { left: "0%" },
            { left: "100%", duration: 2.4, ease: "power2.inOut" },
            2.6
          )
          .fromTo(
            q("[data-scan]"),
            { opacity: 0 },
            { opacity: 1, duration: 0.2 },
            2.6
          )
          .to(q("[data-scan]"), { opacity: 0, duration: 0.3 }, 4.7)

        // 3. Picked, and a route suggested.
        tl.fromTo(
          q("[data-pick=a]"),
          { opacity: 0, scale: 0.7 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(2.2)",
            transformOrigin: "50% 50%",
          },
          5
        )
          .fromTo(
            q("[data-draw]"),
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 2.2, ease: "power1.inOut" },
            5.5
          )
          .fromTo(
            q("[data-pick=b]"),
            { opacity: 0, scale: 0.7 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.5,
              ease: "back.out(2.2)",
              transformOrigin: "50% 50%",
            },
            7.5
          )

        // 4. Checked along its length, then added.
        tl.set(q("[data-check]"), { opacity: 1 }, 8.3)
          .fromTo(
            q("[data-check]"),
            { strokeDashoffset: 0 },
            { strokeDashoffset: -1, duration: 1.2, ease: "power1.inOut" },
            8.3
          )
          .to(q("[data-check]"), { opacity: 0, duration: 0.2 }, 9.4)
          .fromTo(
            q("[data-solid]"),
            { opacity: 0 },
            { opacity: 1, duration: 0.5 },
            9.4
          )
          .to(q("[data-dashed]"), { opacity: 0, duration: 0.5 }, 9.4)

        // The line under the frame says which stage this is.
        const lines = q("[data-step]")
        const ticks = q("[data-tick]")
        lines.forEach((line, i) => {
          if (i > 0)
            tl.fromTo(
              line,
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.35 },
              STAGES[i]
            ).fromTo(
              ticks[i],
              { opacity: 0.25 },
              { opacity: 1, duration: 0.35 },
              STAGES[i]
            )
          if (i < lines.length - 1)
            tl.to(
              line,
              { opacity: 0, y: -10, duration: 0.35 },
              STAGES[i + 1] - 0.35
            )
        })

        // Hold the last stage a moment before the page moves on.
        tl.to({}, { duration: 0.8 })
      })

      mm.add(motionQuery.reduce, () => {
        // Not pinned: show the drawing with the route added.
        gsap.set(q("[data-photo]"), { clipPath: "inset(0% 0% 0% 100%)" })
        gsap.set(q("[data-pick], [data-solid]"), { opacity: 1 })
        gsap.set(q("[data-dashed]"), { opacity: 0 })
        gsap.set(q("[data-step]"), { opacity: 0 })
        gsap.set(q("[data-step]:last-child"), { opacity: 1 })
        gsap.set(q("[data-tick]"), { opacity: 1 })
      })
    },
    { scope: root }
  )

  const photo = images.conduitCeiling
  const src = (name: string, width: number) => `/images/${name}-${width}.webp`

  return (
    <section
      ref={root}
      aria-labelledby="model-reveal"
      className="relative h-[340vh] motion-reduce:h-auto"
    >
      <h2 id="model-reveal" className="sr-only">
        {heading}
      </h2>
      <div className="sticky top-[5.5rem] motion-reduce:static">
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ivory-medium sm:aspect-auto sm:h-[min(calc(100vh-8rem),46rem)]"
          style={{ containerType: "size" }}
        >
          {/* The photograph's own 3:2, covering the frame the way
              object-fit: cover would, but anchored to the ceiling and
              centred on the run, so nothing that matters is cropped. Photo,
              drawing and route all live inside it, in register. */}
          <div
            data-stage=""
            className="absolute top-0"
            style={{
              width: "max(100cqw, 150cqh)",
              height: "max(100cqh, 66.667cqw)",
              left: "calc((100cqw - max(100cqw, 150cqh)) * 0.62)",
            }}
          >
            <img
              src={src(`${photo.name}-drawing`, 1536)}
              alt=""
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full opacity-85"
            />
            <div data-photo="" className="absolute inset-0">
              <img
                src={src(photo.name, 1536)}
                srcSet={`${src(photo.name, 960)} 960w, ${src(photo.name, 1536)} 1536w`}
                sizes="(min-width: 1280px) 1200px, 100vw"
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                className="size-full"
              />
            </div>
            <Route />
            <div
              data-scan=""
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-px bg-persimmon shadow-[0_0_28px_6px_var(--persimmon)]"
              style={{ left: 0, opacity: 0 }}
            />
          </div>

          <div className="absolute inset-x-3 bottom-3 flex items-center gap-4 rounded-2xl bg-background/90 px-4 py-3 backdrop-blur sm:inset-x-auto sm:bottom-5 sm:left-5 sm:px-5">
            <div aria-hidden className="flex shrink-0 gap-1">
              {steps.map((step, i) => (
                <span
                  key={step}
                  data-tick=""
                  className="h-1 w-4 rounded-full bg-persimmon"
                  style={{ opacity: i === 0 ? 1 : 0.25 }}
                />
              ))}
            </div>
            <ol className="relative grid min-w-0 flex-1 sm:w-[26rem] sm:flex-none">
              {steps.map((step, i) => (
                <li
                  key={step}
                  data-step=""
                  className="col-start-1 row-start-1 font-sans text-caption sm:text-ui"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * The picks and the route, drawn over the photograph and its drawing in the
 * photograph's own pixels.
 */
function Route() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1536 1024"
      className="absolute inset-0 size-full"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* Draws the suggestion in along its length. */}
        <mask id="route-reveal" maskUnits="userSpaceOnUse">
          <path
            data-draw=""
            d={ROUTE}
            pathLength={1}
            stroke="white"
            strokeWidth={40}
            strokeDasharray="1 1"
            strokeDashoffset={1}
          />
        </mask>
      </defs>

      <g data-dashed="" mask="url(#route-reveal)">
        <path d={ROUTE} className="stroke-ivory" strokeWidth={18} />
        <path
          d={ROUTE}
          className="stroke-persimmon"
          strokeWidth={8}
          strokeDasharray="20 14"
        />
      </g>
      <g data-solid="" style={{ opacity: 0 }}>
        <path d={ROUTE} className="stroke-ivory" strokeWidth={18} />
        <path d={ROUTE} className="stroke-persimmon" strokeWidth={8} />
      </g>

      {/* The check: a ring that runs the length of the route. */}
      <path
        data-check=""
        d={ROUTE}
        pathLength={1}
        className="stroke-persimmon"
        strokeWidth={26}
        strokeDasharray="0 2"
        style={{ opacity: 0 }}
      />
      <path
        data-check=""
        d={ROUTE}
        pathLength={1}
        className="stroke-ivory"
        strokeWidth={13}
        strokeDasharray="0 2"
        style={{ opacity: 0 }}
      />

      <g data-pick="a" style={{ opacity: 0 }}>
        <rect
          x={BOX.x - 8}
          y={BOX.y - 8}
          width={BOX.width + 16}
          height={BOX.height + 16}
          rx={6}
          className="stroke-persimmon"
          strokeWidth={4}
        />
        <Tag x={BOX.x - 8} y={BOX.y - 8} label="A" />
      </g>
      <g data-pick="b" style={{ opacity: 0 }}>
        <rect
          x={END.x - 18}
          y={END.y - 18}
          width={36}
          height={36}
          rx={4}
          className="fill-ivory stroke-persimmon"
          strokeWidth={5}
        />
        <Tag x={END.x + 18} y={END.y - 18} label="B" />
      </g>
    </svg>
  )
}

/** A device's letter, on a small persimmon tab at a corner. */
function Tag({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-17}
        y={-17}
        width={34}
        height={34}
        rx={6}
        className="fill-persimmon"
      />
      <text
        y={1}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-ivory font-mono"
        fontSize={20}
        fontWeight={600}
      >
        {label}
      </text>
    </g>
  )
}
