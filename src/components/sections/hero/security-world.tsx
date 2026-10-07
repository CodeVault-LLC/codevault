import { useEffect, useId, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { ArrowRight, Pause, Play } from "lucide-react"

import { SecurityWorldArt } from "@/components/sections/hero/security-world-art"
import { homePage } from "@/core/config/site"
import { securityWorldMotion } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

export function SecurityWorld() {
  const stage = useRef<HTMLDivElement>(null)
  const elapsed = useRef(0)
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [view, setView] = useState(0)
  const captionId = useId()
  const copy = homePage.hero.world

  useEffect(() => {
    const element = stage.current
    if (!element) return
    const camera = element.querySelector<SVGGElement>("[data-world-camera]")!
    const scan = element.querySelector<SVGEllipseElement>("[data-world-scan]")!
    const beacon = element.querySelector<SVGGElement>("[data-world-beacon]")!
    if (reduced) camera.removeAttribute("transform")
    if (reduced !== false || paused) return

    const routes = [
      ...element.querySelectorAll<SVGPathElement>("[data-signal-route]"),
    ]
    const lengths = routes.map((route) => route.getTotalLength())
    const dots = [
      ...element.querySelectorAll<SVGCircleElement>("[data-signal-dot]"),
    ]
    let frame = 0
    let last = 0
    let visible = false
    const pointer = { x: 0, y: 0 }
    const position = { x: 0, y: 0 }

    const draw = (now: number) => {
      elapsed.current += last ? Math.min((now - last) / 1000, 0.05) : 0
      last = now
      const time = elapsed.current
      dots.forEach((dot) => {
        const index = Number(dot.dataset.route)
        const progress =
          (time / (securityWorldMotion.signalSeconds + index * 0.7) +
            Number(dot.dataset.offset) +
            index * 0.13) %
          1
        const p = routes[index].getPointAtLength(progress * lengths[index])
        dot.setAttribute("cx", String(p.x))
        dot.setAttribute("cy", String(p.y))
      })
      position.x += (pointer.x - position.x) * 0.035
      position.y += (pointer.y - position.y) * 0.035
      // One loop writes directly to SVG. No per-frame React state or layout reads.
      camera.setAttribute(
        "transform",
        `translate(${position.x} ${position.y + Math.sin(time / 5) * 2})`
      )
      const scanPhase =
        (Math.sin(time / securityWorldMotion.scanSeconds) + 1) / 2
      scan.setAttribute("cy", String(178 + scanPhase * 145))
      scan.setAttribute("rx", String(115 + scanPhase * 53))
      scan.setAttribute("ry", String(35 + scanPhase * 36))
      beacon.style.opacity = String(0.65 + Math.sin(time * 1.6) * 0.25)
      frame = requestAnimationFrame(draw)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      last = 0
      const running = visible && !document.hidden
      element.dataset.running = String(running)
      if (running) frame = requestAnimationFrame(draw)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        sync()
      },
      { threshold: 0.05 }
    )
    observer.observe(element)
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      const bounds = element.getBoundingClientRect()
      pointer.x =
        ((event.clientX - bounds.left) / bounds.width - 0.5) *
        securityWorldMotion.parallax
      pointer.y =
        ((event.clientY - bounds.top) / bounds.height - 0.5) *
        securityWorldMotion.parallax
    }
    const leave = () => {
      pointer.x = 0
      pointer.y = 0
    }
    element.addEventListener("pointermove", move, { passive: true })
    element.addEventListener("pointerleave", leave)
    document.addEventListener("visibilitychange", sync)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      element.dataset.running = "false"
      element.removeEventListener("pointermove", move)
      element.removeEventListener("pointerleave", leave)
      document.removeEventListener("visibilitychange", sync)
    }
  }, [paused, reduced])

  return (
    <figure className="security-world" aria-label={copy.title}>
      <div
        ref={stage}
        data-view={view}
        className="security-world-stage"
        role="img"
        aria-label={copy.description}
      >
        <SecurityWorldArt />
        <div aria-hidden="true" className="world-plate-caption">
          <span className="inline-block size-1.5 rounded-full bg-olive" />
          {copy.title}
        </div>
      </div>
      <div className="world-toolbar">
        <div
          role="group"
          aria-label={copy.viewsLabel}
          className="world-view-controls"
        >
          {copy.views.map((item, index) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={view === index}
              aria-describedby={view === index ? captionId : undefined}
              onClick={() => setView(index)}
              className={cn(
                "world-view-button focus-ring",
                view === index && "world-view-active"
              )}
            >
              <span>{item.label}</span>
              <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          disabled={Boolean(reduced)}
          aria-label={
            reduced ? copy.reducedMotion : paused ? copy.play : copy.pause
          }
          aria-pressed={paused || Boolean(reduced)}
          className="world-pause focus-ring disabled:opacity-40"
        >
          {paused || reduced ? (
            <Play aria-hidden="true" className="size-4" />
          ) : (
            <Pause aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>
      <figcaption
        id={captionId}
        className="mt-4 flex flex-wrap justify-between gap-2 text-caption text-muted-foreground"
      >
        <span>{copy.captionLabel}</span>
        <span aria-live="polite" aria-atomic="true">
          {copy.views[view].caption}
        </span>
      </figcaption>
    </figure>
  )
}
