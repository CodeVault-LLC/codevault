import type { FC } from "react"
import { motion } from "framer-motion"

import { Scout } from "@/components/brand/scout"

export const NotFound: FC = () => {
  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 h-100 w-100 rounded-full opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, #d97757 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute right-1/4 bottom-1/4 h-75 w-75 rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #eda100 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -25, 15, 0],
            y: [0, 25, -15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Floating dots */}
      <div className="pointer-events-none absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative text-center"
      >
        {/* Scout, sent to a page that isn't there */}
        <motion.div
          className="mb-6 flex justify-center text-foreground/70"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Scout className="size-20" />
        </motion.div>

        {/* 404 number */}
        <motion.div
          className="mb-6 leading-none font-semibold tracking-tighter text-primary/90"
          style={{
            fontSize: "clamp(5rem, 4rem + 5vw, 10rem)",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="inline-block">4</span>
          <motion.span
            className="inline-block"
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            0
          </motion.span>
          <span className="inline-block">4</span>
        </motion.div>

        {/* Divider line */}
        <motion.div
          className="mx-auto mb-6 h-px w-12 bg-primary/40"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />

        {/* Message */}
        <motion.p
          className="mb-2 text-lg font-medium tracking-tight text-foreground md:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Page not found
        </motion.p>

        <motion.p
          className="mx-auto mb-10 max-w-sm text-sm text-muted-foreground md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        {/* Back link */}
        <motion.a
          href="/"
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <span className="underline-[0.2em] underline decoration-border/40 underline-offset-[0.2em] transition-colors group-hover:decoration-primary/60">
            Back to home
          </span>
          <motion.span
            className="text-muted-foreground/40 transition-colors group-hover:text-primary/60"
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            →
          </motion.span>
        </motion.a>
      </motion.div>
    </div>
  )
}
