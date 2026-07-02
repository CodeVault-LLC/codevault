import { cn } from "@/lib/utils"

type ContainerProps = {
  className?: string
  children: React.ReactNode
}

export function Container({ className, children }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6", className)}>
      {children}
    </div>
  )
}
