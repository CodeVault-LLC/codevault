import { Outlet, createRootRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { getAppConfig } from "@/configs/app";
import { Scripts, Meta, Html, Head, Body } from "@tanstack/start";
import { seo } from "@/lib/seo";

export const RootPage: React.FC = () => {
  return (
    <Html lang="en">
      <Head>
        <Meta />
      </Head>
      <Body>
        <ThemeProvider
          defaultTheme={getAppConfig("color_mode.default")}
          storageKey={getAppConfig("color_mode.storage_key")}
        >
          <div className="flex flex-col h-screen">
            <TooltipProvider delayDuration={50}>
              <Navbar />
              <Outlet />
            </TooltipProvider>
          </div>
        </ThemeProvider>
        <Scripts />
      </Body>
    </Html>
  );
};

export const Route = createRootRoute({
  component: RootPage,

  meta: () => [
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
  scripts: () => [
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
});
