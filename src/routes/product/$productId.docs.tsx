import {
  Link,
  Outlet,
  createFileRoute,
  useLoaderData,
} from "@tanstack/react-router";
import React from "react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ShieldCheck, BugIcon } from "lucide-react";
import { NotFound } from "@/components/NotFound";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { getProductById } from "@/products";
import { Product } from "@/types/product";

const Documentation: React.FC = () => {
  const { product }: { product: Product | null } = useLoaderData({
    strict: false,
  });

  if (!product) return <NotFound />;

  const socials = [
    {
      name: "GitHub",
      description: "View the source code on GitHub",
      link: product?.github?.url,
      icon: <GitHubLogoIcon className="size-6" />,
      issue: false,
    },
    {
      name: "Report Issue",
      description: "Report an issue on GitHub",
      link: `${product?.github?.url}/issues/new/choose`,
      icon: <BugIcon className="size-6" />,
      issue: false,
    },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between gap-2 items-center">
        <div className="flex flex-row items-center gap-2">
          <img
            src="https://avatars.githubusercontent.com/u/160372018?s=48&v=4"
            alt="CryptoGuard Logo"
            className="w-8 h-8 rounded-md"
          />
          <h3 className="text-2xl font-bold text-center">{product.name}</h3>
        </div>

        <div className="flex flex-row items-center gap-2 h-full">
          {socials.map((social, index: number) => (
            <>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    key={social.name}
                    variant="secondary"
                    asChild
                    className={cn(
                      social.issue
                        ? "cursor-not-allowed bg-yellow-600 hover:bg-yellow-700"
                        : "cursor-pointer"
                    )}
                  >
                    <Link
                      to={social.link}
                      className="flex flex-row items-center gap-2"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {social.issue ? (
                        <ShieldCheck className="size-6" />
                      ) : (
                        social.icon
                      )}
                      <span>{social.name}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={4} side="top">
                  {social.description}
                </TooltipContent>
              </Tooltip>
              {index !== socials.length - 1 && (
                <Separator orientation="vertical" className="h-9" />
              )}
            </>
          ))}
        </div>
      </div>
      <Separator className="my-4" />
      <Outlet />
    </div>
  );
};

export const Route = createFileRoute("/product/$productId/docs")({
  component: Documentation,
  loader: (ctx) => {
    const { productId } = ctx.params;
    const product = getProductById(productId);

    return {
      product,
    };
  },
  meta: (ctx) => {
    const product = getProductById(ctx.params.productId);

    if (!product) {
      return seo({
        title: "Product Not Found | CodeVault",
        description: "The product you are looking for does not exist.",
      });
    }

    return seo({
      title: product.name
        ? `${product.name} Docs | CodeVault`
        : "CodeVault | High Quality Products for Developers",
      description: product?.description,
    });
  },
});
