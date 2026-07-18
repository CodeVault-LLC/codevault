import type { LinkProps } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"

export type AdminShellProps = {
  children: React.ReactNode
  /** Shown in the sidebar so it is obvious which account is acting. */
  userName: string
}

export type NavItem = {
  title: string
  /**
   * Null means the screen is planned but not built — rendered disabled.
   * Typed from the generated route tree, so a nav entry cannot point at a
   * route that does not exist.
   */
  href: LinkProps["to"] | null
  icon: LucideIcon
}

export type NavGroup = {
  label: string
  items: NavItem[]
}
