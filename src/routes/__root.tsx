import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { getAppConfig } from "@/configs/app";
import { seo } from "@/lib/seo";
import { QueryClient } from "@tanstack/react-query";

export const RootPage: React.FC = () => {
  return (
    <ThemeProvider
      defaultTheme={getAppConfig("color_mode.default")}
      storageKey={getAppConfig("color_mode.storage_key")}
    >
      <HeadContent />
      <TooltipProvider delayDuration={100}>
        <Outlet />
      </TooltipProvider>
    </ThemeProvider>
  );
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootPage,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      },
      ...seo({
        title: "CodeVault | High Quality Products for Developers",
        description:
          "CodeVault is a perfect solution when in needs of products! It offers a wide range of products that are made by developers for developers.",
        keywords:
          "codevault,products,documentation,react,reactjs,typescript,open source,developers,rust,logs",
      }),
    ],
    scripts: [
      {
        src: "https://www.googletagmanager.com/gtag/js?id=G-8V6QQP5KVG",
        async: true,
      },
      {
        children: `
      window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-8V6QQP5KVG');
      `,
      },
    ],
  }),
});
