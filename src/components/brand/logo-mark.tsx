import { cn } from "@/lib/utils"
import { site } from "@/core/config/site"

type LogoMarkProps = {
  className?: string
  withWordmark?: boolean
}

export function LogoMark({ className, withWordmark = true }: LogoMarkProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-6"
        aria-hidden
      >
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="7"
          className="fill-foreground"
        />
        <path d="M11 22V10h2.6v9.6H19V22H11Z" className="fill-background" />
        <path d="M21 10h2.6v12H21V10Z" className="fill-background" />
        <circle cx="25" cy="11.4" r="1.4" className="fill-background" />
      </svg>
      {withWordmark && (
        <span className="text-[15px] font-semibold tracking-tight">
          {site.name}
        </span>
      )}
    </div>
  )
}
