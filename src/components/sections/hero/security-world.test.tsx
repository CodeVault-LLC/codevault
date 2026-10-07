// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { SecurityWorld } from "@/components/sections/hero/security-world"
import { homePage } from "@/core/config/site"

vi.mock("framer-motion", () => ({ useReducedMotion: () => true }))
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("Security illustration accessibility", () => {
  it("ships the complete illustration and description in server-rendered HTML", () => {
    const html = renderToString(<SecurityWorld />)
    expect(html).toContain(homePage.hero.world.description)
    expect(html).toContain('viewBox="0 0 1200 570"')
    expect(html).toContain("world-core")
    expect(html).toContain(homePage.hero.world.views[0].caption)
  })

  it("keeps exploration available without starting animation under reduced motion", () => {
    const frame = vi.spyOn(window, "requestAnimationFrame")
    render(<SecurityWorld />)
    expect(frame).not.toHaveBeenCalled()
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe(
      homePage.hero.world.description
    )
    expect(
      screen
        .getByRole("button", {
          name: homePage.hero.world.reducedMotion,
        })
        .hasAttribute("disabled")
    ).toBe(true)
    const boundary = screen.getByRole("button", {
      name: "Question the boundary",
    })
    fireEvent.click(boundary)
    expect(boundary.getAttribute("aria-pressed")).toBe("true")
    expect(
      screen
        .getByRole("button", { name: "Follow the signal" })
        .getAttribute("aria-pressed")
    ).toBe("false")
    expect(screen.getByText(homePage.hero.world.views[1].caption)).toBeTruthy()
    expect(frame).not.toHaveBeenCalled()
  })
})
