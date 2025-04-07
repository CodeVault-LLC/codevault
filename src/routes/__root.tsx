import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import Navbar from "../components/Navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { getAppConfig } from "@/configs/app";
import { seo } from "@/lib/seo";
import { Footer } from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { QueryClient } from "@tanstack/react-query";

export const RootPage: React.FC = () => {
  return (
    <ThemeProvider
      defaultTheme={getAppConfig("color_mode.default")}
      storageKey={getAppConfig("color_mode.storage_key")}
    >
      <TooltipProvider delayDuration={100}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="container mx-auto my-8">
            <Outlet />
          </div>
          <Separator />
          <Footer />
        </div>
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
