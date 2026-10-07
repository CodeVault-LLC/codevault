import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

const styles = {
  primary: "bg-foreground text-background hover:bg-foreground/85",
  secondary:
    "bg-transparent text-foreground ring-1 ring-border-strong ring-inset hover:bg-foreground/5",
} as const

export function buttonClass(
  variant: keyof typeof styles = "primary",
  className?: string
) {
  return cn(
    "group/button inline-flex h-10 items-center gap-2 rounded-lg px-4 font-sans text-ui whitespace-nowrap transition-colors duration-200",
    styles[variant],
    className
  )
}

/** The arrow that slides a step when its button or card is hovered. */
export function Arrow({ className }: { className?: string }) {
  return (
    <ArrowRight
      aria-hidden
      strokeWidth={1.75}
      className={cn(
        "size-4 transition-transform duration-300 ease-out-soft group-hover/button:translate-x-0.5 group-hover/card:translate-x-0.5",
        className
      )}
    />
  )
}

/** An internal link styled as a button. */
export function ButtonLink({
  to,
  children,
  variant = "primary",
  arrow = true,
  className,
}: {
  to: string
  children: React.ReactNode
  variant?: keyof typeof styles
  arrow?: boolean
  className?: string
}) {
  return (
    <Link to={to} className={buttonClass(variant, className)}>
      {children}
      {arrow && <Arrow />}
    </Link>
  )
}
