import { cn } from "@/lib/utils"

/** The hand-drawn arc under a title. Draws itself in once. */
export function ArcRule({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 80"
      preserveAspectRatio="none"
      className={cn("h-10 w-full overflow-visible sm:h-16", className)}
    >
      <defs>
        <filter id="chalk" x="-5%" y="-50%" width="110%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="4"
          />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
        </filter>
      </defs>
      <path
        d="M 0 76 Q 500 -10 1000 76"
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        vectorEffect="non-scaling-stroke"
        filter="url(#chalk)"
        className="draw-line"
        style={{ "--d": "300ms" } as React.CSSProperties}
      />
    </svg>
  )
}
