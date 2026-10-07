import { cn } from "@/lib/utils"

type ContainerProps = {
  className?: string
  children: React.ReactNode
}

export function Container({ className, children }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16",
        className
      )}
    >
      {children}
    </div>
  )
}
