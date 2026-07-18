import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronsUpDown, LogOut } from "lucide-react"

import type { NavItem } from "./types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogoMark } from "@/components/brand/logo-mark"
import { NAV_GROUPS } from "./nav-items"
import { authClient } from "@/lib/auth-client"

/**
 * `/admin` is the only exact-match entry. Every other screen sits at its own
 * path, so a prefix match would light up Overview on every child route.
 */
function isActive(pathname: string, href: NonNullable<NavItem["href"]>) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
}

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/admin" />}
              tooltip="CodeVault Dashboard"
            >
              <LogoMark withWordmark={false} />
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">CodeVault</span>
                <span className="text-ui-xs text-sidebar-foreground/60">
                  Dashboard
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.href ? (
                      <SidebarMenuButton
                        render={<Link to={item.href} />}
                        isActive={isActive(pathname, item.href)}
                        tooltip={item.title}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    ) : (
                      // Not a Link: an unbuilt screen must not be reachable,
                      // and `aria-disabled` keeps it announced as present but
                      // unavailable rather than silently skipped.
                      <SidebarMenuButton
                        aria-disabled
                        tabIndex={-1}
                        tooltip={`${item.title} — not built yet`}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        <Badge
                          variant="secondary"
                          className="ml-auto px-1.5 py-0 text-ui-xs font-normal group-data-[collapsible=icon]:hidden"
                        >
                          Soon
                        </Badge>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg" tooltip={userName}>
                    <Avatar className="size-6 rounded-md">
                      <AvatarFallback className="rounded-md text-[10px]">
                        {userName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{userName}</span>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent
                side="top"
                align="start"
                className="min-w-56"
              >
                <DropdownMenuLabel className="font-normal">
                  <span className="block text-ui-xs text-muted-foreground">
                    Signed in as
                  </span>
                  <span className="block truncate font-medium">{userName}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => {
                      void authClient.signOut().then(() => {
                        // A full document load, not a client navigation: the
                        // session cookie is gone and every loader on the way
                        // out must re-resolve against the signed-out state.
                        window.location.href = "/login"
                      })
                    }}
                  >
                    <LogOut />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
