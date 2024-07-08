import { NotFound } from "@/components/NotFound";
import { seo } from "@/lib/seo";
import { getProductById } from "@/products";
import { Product } from "@/types/product";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

import * as React from "react";

// If using TypeScript, add the following snippet to your file as well.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

const Checkout: React.FC = () => {
  const { product }: { product: Product | null } = useLoaderData({
    strict: false,
  });

  if (!product) return <NotFound />;

  if (product.isFree || product.priceDetails?.method !== "pricing-table") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold">Free Product</h1>
        <p className="text-lg text-muted-foreground">
          This product is free to use.
        </p>
      </div>
    );
  }

  return (
    <stripe-pricing-table
      pricing-table-id={product.priceDetails?.pricing_table_id}
      publishable-key="pk_test_51PZYuuKxjco750Ed3FG4omRFh98PvNT1dxSW6D9H3bpKujZNcmlvkfnZP3MTOBqtNx1ApQVo2rLMiFC1cSXGlcWY00ioWUxUZz"
    ></stripe-pricing-table>
  );
};

export const Route = createFileRoute("/product/$productId/checkout")({
  component: Checkout,
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
        ? `${product.name} Checkout | CodeVault`
        : "CodeVault | High Quality Products for Developers",
      description: product?.description,
    });
  },
});
