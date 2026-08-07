import { cn } from "@/lib/utils"

/**
 * A key, drawn as a key.
 *
 * Small enough to sit inside a sentence and quiet enough not to turn a feature
 * list into a cheat sheet. The keys are given as an array so the separator is
 * ours rather than a hard-coded plus sign in the copy.
 */
export function Keycap({
  keys,
  className,
}: {
  keys: string[]
  className?: string
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      // Read as one shortcut rather than as loose letters.
      aria-label={`Shortcut: ${keys.join(" ")}`}
    >
      {keys.map((key) => (
        <kbd
          key={key}
          className="border-faded inline-flex min-w-6 items-center justify-center rounded border bg-ivory-medium px-1.5 py-0.5 font-mono text-detail-xs"
        >
          {key}
        </kbd>
      ))}
    </span>
  )
}
