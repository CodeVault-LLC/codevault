import { useEffect } from "react"
import { stagger, useAnimate, useInView, useReducedMotion } from "framer-motion"
import { textTransitions } from "@/core/lib/motion"
import { cn } from "@/lib/utils"

type TextRevealProps = {
  text: string
  variant?: "letters" | "words" | "fade"
  delay?: number
  className?: string
}

/** Visible in SSR; motion starts only after hydration and viewport entry. */
export function TextReveal({
  text,
  variant = "words",
  delay = 0,
  className,
}: TextRevealProps) {
  const [scope, animate] = useAnimate<HTMLSpanElement>()
  const visible = useInView(scope, { once: true, amount: 0.3 })
  const reduced = useReducedMotion()
  const words = text.split(" ")

  useEffect(() => {
    if (reduced) {
      scope.current
        .querySelectorAll<HTMLElement>("[data-text-part]")
        .forEach((part) => {
          part.style.opacity = "1"
          part.style.transform = "none"
          part.style.filter = "none"
        })
      return
    }
    if (!visible || reduced !== false) return
    const transition = textTransitions[variant]
    const animation = animate("[data-text-part]", transition.keyframes, {
      duration: transition.duration,
      ease: [0.22, 1, 0.36, 1],
      delay: stagger(transition.stagger, { startDelay: delay }),
    })
    return () => animation.stop()
  }, [animate, delay, reduced, scope, variant, visible])

  return (
    <span ref={scope} className={cn("text-reveal", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span
            key={`${wordIndex}-${word}`}
            className="inline-block whitespace-nowrap"
          >
            <span
              className={cn(
                "inline-block",
                variant === "words" &&
                  "-mb-[0.12em] overflow-clip pb-[0.12em] align-bottom"
              )}
            >
              {variant === "letters" ? (
                Array.from(word).map((letter, index) => (
                  <span key={index} data-text-part className="inline-block">
                    {letter}
                  </span>
                ))
              ) : (
                <span data-text-part className="inline-block">
                  {word}
                </span>
              )}
            </span>
            {wordIndex < words.length - 1 ? "\u00a0" : null}
          </span>
        ))}
      </span>
    </span>
  )
}
