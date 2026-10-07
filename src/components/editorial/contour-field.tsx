import { cn } from "@/lib/utils"

// An original engraved aperture. Paths are deterministic so the server and
// client produce identical artwork, with no bitmap or WebGL dependency.
const contours = Array.from({ length: 50 }, (_, ring) => {
  const points = Array.from({ length: 181 }, (_point, step) => {
    const angle = (step / 180) * Math.PI * 2
    const ripple = Math.sin(angle * 3 + ring * 0.035) * (18 + ring * 0.5)
    const radius = 250 + ring * 9 + ripple
    const x = 700 + Math.cos(angle) * radius * 1.32
    const y = 440 + Math.sin(angle) * radius * 0.76 + Math.cos(angle * 2) * 30
    return `${step === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`
  })
  return `${points.join(" ")}Z`
})

export function ContourField({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1400 880"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("h-full w-full", className)}
    >
      {contours.map((d, index) => (
        <path
          key={index}
          d={d}
          stroke="currentColor"
          strokeWidth={index % 5 === 0 ? 1.1 : 0.65}
          opacity={index % 5 === 0 ? 0.6 : 0.35}
        />
      ))}
    </svg>
  )
}
