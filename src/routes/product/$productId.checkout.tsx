import {
  createFileRoute,
  redirect,
  useLoaderData,
} from "@tanstack/react-router";
import * as React from "react";
import { NotFound } from "@/components/NotFound";
import { seo } from "@/lib/seo";
import { getProductById } from "@/products";
import { Product } from "@/types/product";

const Checkout: React.FC = () => {
  const { product }: { product: Product | null } = useLoaderData({
    strict: false,
  });

  if (!product) return <NotFound />;

  return (
    <div>
      <h1 className="text-4xl font-bold text-center">{product.name}</h1>
      <p className="text-lg text-muted-foreground text-center">
        Remember to fill in your account details on here, so we can send you the
        product.
      </p>

      <stripe-pricing-table
        pricing-table-id={product.priceDetails?.pricing_table_id}
        publishable-key="pk_test_51PZYuuKxjco750Ed3FG4omRFh98PvNT1dxSW6D9H3bpKujZNcmlvkfnZP3MTOBqtNx1ApQVo2rLMiFC1cSXGlcWY00ioWUxUZz"
      />
    </div>
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

    if (product.isFree || product.priceDetails?.method !== "pricing-table") {
      throw redirect({
        to: "/product/$productId",
        params: { productId: product.id },
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
