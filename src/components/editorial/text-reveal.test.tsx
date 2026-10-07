// @vitest-environment jsdom
import { createRef } from "react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { TextReveal } from "./text-reveal"

const motion = vi.hoisted(() => ({
  reduced: false,
  animate: vi.fn(() => ({ stop: vi.fn() })),
}))
vi.mock("framer-motion", () => ({
  useAnimate: () => [createRef<HTMLSpanElement>(), motion.animate],
  useInView: () => true,
  useReducedMotion: () => motion.reduced,
  stagger: () => 0,
}))
afterEach(() => {
  cleanup()
  motion.reduced = false
  motion.animate.mockClear()
})

describe("Animated heading accessibility", () => {
  it("exposes the full phrase once while decorative letters animate", () => {
    render(
      <h1>
        <TextReveal text="Curiosity, in practice." variant="letters" />
      </h1>
    )
    expect(
      screen.getByRole("heading", { name: "Curiosity, in practice." })
    ).toBeTruthy()
    expect(motion.animate).toHaveBeenCalledTimes(1)
  })

  it("shows static, readable text for reduced motion", () => {
    motion.reduced = true
    const { container } = render(
      <h2>
        <TextReveal text="Selected projects" />
      </h2>
    )
    expect(
      screen.getByRole("heading", { name: "Selected projects" })
    ).toBeTruthy()
    expect(motion.animate).not.toHaveBeenCalled()
    for (const part of container.querySelectorAll<HTMLElement>(
      "[data-text-part]"
    )) {
      expect(part.style.opacity).toBe("1")
      expect(part.style.transform).toBe("none")
    }
  })
})
