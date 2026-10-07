import { cn } from "@/lib/utils"

/** The page grid: 1280px wide at most, with a gutter that grows with the viewport. */
export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[86rem] px-4 sm:px-8 lg:px-10",
        className
      )}
      {...props}
    />
  )
}
