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

/**
 * The admin information architecture, from design §8.1.
 *
 * Routes that do not exist yet are listed with `href: null` and render as
 * disabled entries rather than being omitted. Two reasons: the shape of the
 * tool is legible before it is finished, and adding a screen becomes a matter
 * of filling in an href rather than rediscovering where it belongs. Showing an
 * unbuilt thing as visibly unbuilt is the honest-states rule, not a violation
 * of it — what would violate it is a link that looks live and 404s.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Library",
    items: [
      { title: "Overview", href: "/admin", icon: LayoutDashboard },
      { title: "Reports", href: null, icon: FileStack },
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
      { title: "Users", href: null, icon: Users },
      { title: "Audit log", href: null, icon: ScrollText },
      { title: "Imports", href: null, icon: Import },
    ],
  },
]
