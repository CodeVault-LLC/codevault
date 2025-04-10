import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useGithub } from "@/client/state/github-store";
import { BranchSwitcher } from "./docs-branch-switcher";
import { SearchForm } from "./docs-search-form";
import { LoadingSpinner } from "../loader/loading-spinner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MinusIcon, PlusIcon } from "lucide-react";

type TNavigationItem = {
  title: string;
  url: string;
  items?: TNavigationItem[];
};

type TNavigationItems = Array<{
  title: string;
  url: string;
  items?: TNavigationItem[];
}>;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [navigationItems, setNavigationItems] =
    React.useState<TNavigationItems | null>(null);

  const { schema } = useGithub();

  const generateNavItems = () => {
    if (!schema) return null;

    const navItems = schema.navigation.map((item) => ({
      title: item.title,
      url: item.path,
      items: item.children.map((child) => ({
        title: child.title,
        url: child.path,
      })),
    }));

    setNavigationItems(navItems);
  };

  React.useEffect(() => {
    if (schema) {
      generateNavItems();
    }
  }, [schema]);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <BranchSwitcher />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {!navigationItems ? (
          <LoadingSpinner />
        ) : (
          <SidebarGroup>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <Collapsible
                  key={item.title}
                  open={true}
                  className="group/collapsible"
                >
                  <SidebarMenuItem key={item.title}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        {item.title}
                        <PlusIcon className="ml-auto group-data-[state=open]/collapsible:hidden" />
                        <MinusIcon className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    {item.items?.length ? (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((item) => (
                            <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuSubButton asChild isActive={true}>
                                <a href={item.url}>{item.title}</a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
