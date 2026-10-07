// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"
import type { AnchorHTMLAttributes } from "react"
import { ProjectsIndex } from "@/components/projects/projects-index"
import { Navbar } from "@/components/layout/navbar"

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props} />
  ),
  useRouterState: () => "/projects",
}))

beforeEach(() => {
  document.documentElement.classList.remove("dark")
  const storage = new Map<string, string>()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  })
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("Project browsing", () => {
  it("combines search, field and status, then recovers from an empty result", () => {
    render(<ProjectsIndex />)
    const collection = screen.getByRole("region", { name: "The project index" })
    expect(within(collection).getAllByRole("article")).toHaveLength(6)
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "  ORBIT  " },
    })
    expect(within(collection).getAllByRole("article")).toHaveLength(1)
    expect(
      within(collection).getByRole("heading", { name: "Orbit" })
    ).toBeTruthy()
    fireEvent.change(screen.getByLabelText("Filter by status"), {
      target: { value: "Paused" },
    })
    expect(within(collection).queryAllByRole("article")).toHaveLength(0)
    expect(screen.getByText("No projects match these filters.")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }))
    expect(within(collection).getAllByRole("article")).toHaveLength(6)
    fireEvent.change(screen.getByLabelText("Filter by field"), {
      target: { value: "Security engineering" },
    })
    expect(within(collection).getAllByRole("article")).toHaveLength(1)
    expect(
      within(collection)
        .getByRole("link", { name: "Sandbox" })
        .getAttribute("href")
    ).toBe("/projects/sandbox")
  })
})

describe("Site navigation", () => {
  it("closes the mobile menu on Escape and returns focus to its trigger", () => {
    render(<Navbar />)
    const trigger = screen.getByRole("button", { name: "Open navigation" })
    fireEvent.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    fireEvent.keyDown(document, { key: "Escape" })
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    expect(document.activeElement).toBe(trigger)
  })

  it("applies and remembers a theme choice", () => {
    render(<Navbar />)
    const toggle = screen.getByRole("button", { name: "Switch color theme" })
    fireEvent.click(toggle)
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(localStorage.getItem("codevault-theme")).toBe("dark")
    fireEvent.click(toggle)
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(localStorage.getItem("codevault-theme")).toBe("light")
  })
})
