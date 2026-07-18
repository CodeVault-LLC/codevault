import {
  BookMarked,
  FileStack,
  FileUp,
  Import,
  LayoutDashboard,
  ScrollText,
  Users,
} from "lucide-react"

import type { NavGroup } from "./types"
import type { StaffRole } from "@/core/auth/permissions"
import { can } from "@/core/auth/permissions"

/**
 * The admin information architecture, from design §8.1.
 *
 * Routes that do not exist yet are listed with `href: null` and render as
 * disabled entries rather than being omitted. Two reasons: the shape of the
 * tool is legible before it is finished, and adding a screen becomes a matter
 * of filling in an href rather than rediscovering where it belongs. Showing an
 * unbuilt thing as visibly unbuilt is the honest-states rule, not a violation
 * of it — what would violate it is a link that looks live and 404s.
 *
 * `capability` is a different thing from `href: null`. An unbuilt screen is
 * shown to everyone as unbuilt; a screen this *role* cannot reach is not shown
 * at all, because "exists, but not for you" is noise in a sidebar someone looks
 * at every day. Neither is a security measure — the server function behind each
 * screen refuses on its own (design §7.6).
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Library",
    items: [
      { title: "Overview", href: "/admin", icon: LayoutDashboard },
      { title: "Reports", href: "/admin/reports", icon: FileStack },
      { title: "Deposit", href: "/admin/deposit", icon: FileUp },
    ],
  },
  {
    label: "Public",
    items: [
      // Leaves the admin surface entirely — this is the reader-facing archive.
      { title: "Archive", href: "/reports", icon: BookMarked },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
        capability: "users.read",
      },
      {
        title: "Audit log",
        href: "/admin/audit",
        icon: ScrollText,
        capability: "audit.read",
      },
      // Phase 5. Listed so the shape of the tool stays legible before it exists.
      { title: "Imports", href: null, icon: Import },
    ],
  },
]

/** The navigation as one role sees it. A group left empty is dropped whole. */
export function navGroupsFor(role: StaffRole): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.capability || can(role, item.capability)
    ),
  })).filter((group) => group.items.length > 0)
}
