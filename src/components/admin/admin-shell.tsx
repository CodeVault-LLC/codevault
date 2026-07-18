import { Link, useRouterState } from "@tanstack/react-router"

import type { AdminShellProps } from "./types"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AdminSidebar } from "./admin-sidebar"
import { NAV_GROUPS } from "./nav-items"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * Resolves the current screen's title from the nav config rather than from URL
 * segments, so the breadcrumb and the sidebar can never disagree about what a
 * screen is called. Falls back to null on a route with no nav entry, which
 * renders a one-level crumb instead of an invented label.
 */
function useCurrentTitle(): string | null {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const matches = NAV_GROUPS.flatMap((group) => group.items)
    .filter((item) => item.href && item.href !== "/admin")
    .filter((item) => pathname.startsWith(item.href!))

  return matches[0]?.title ?? null
}

/**
 * The admin layout: a third sibling to the marketing and archive shells, so
 * dashboard chrome cannot appear anywhere else.
 *
 * `admin-surface` is what swaps this branch onto IBM Plex and the fixed UI type
 * scale (globals.css). It is a scope class rather than a global token change
 * because the public site stays editorial — see design-rules.md §Surfaces.
 */
export function AdminShell({ children, userName, role }: AdminShellProps) {
  const currentTitle = useCurrentTitle()

  return (
    <TooltipProvider delay={300}>
      <SidebarProvider className="admin-surface">
        <AdminSidebar userName={userName} role={role} />

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/70">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-1 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList className="text-ui-sm">
                <BreadcrumbItem>
                  {currentTitle ? (
                    <BreadcrumbLink render={<Link to="/admin" />}>
                      Dashboard
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {currentTitle && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
