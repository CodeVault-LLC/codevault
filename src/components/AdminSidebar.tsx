import { useMemo, type ComponentProps, type FC } from "react";
import { Link, useParams, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "./ui/sidebar";
import { useMe } from "@/gql/gpl";

export const AdminSidebar: FC<ComponentProps<typeof Sidebar>> = (props) => {
  const { id }: { id?: number } = useParams({ strict: false });
  const routerState = useRouterState();
  const { data: user, isLoading } = useMe({
    role: true,
  });

  // Define the sidebar data with conditional project items
  const data = useMemo(() => {
    const commonItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        items: [
          {
            title: "Overview",
            url: "/dashboard",
          },
          {
            title: "Products",
            url: "/dashboard/products",
          },
        ],
      },
    ];

    // Add project-specific items only if `id` is present
    if (id) {
      commonItems.push({
        title: "Product",
        url: `/dashboard/products/${id}`,
        items: [
          {
            title: "Product Overview",
            url: `/dashboard/products/${id}`,
          },
          {
            title: "Settings",
            url: `/dashboard/products/${id}/settings`,
          },
          {
            title: "Pricing",
            url: `/dashboard/products/${id}/settings/pricing`,
          },
        ],
      });
    }

    return commonItems;
  }, [id]);

  // If the user is not an admin or the data is still loading, return null
  if (user?.role !== "admin" || isLoading) return null;

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* Optional components like VersionSwitcher or SearchForm */}
      </SidebarHeader>
      <SidebarContent>
        {data.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        routerState?.location.pathname ===
                        item.url.replace(":id", id ? id.toString() : "")
                      }
                    >
                      <Link to={item.url} params={{ id }}>
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};
