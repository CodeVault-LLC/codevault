import { Outlet, createFileRoute } from "@tanstack/react-router";
import React from "react";
import { seo } from "@/lib/seo";
import { retrieveProduct } from "@/client/hooks/useProject";
import { Product } from "@/types/product";

const ProductLayout: React.FC = () => {
  return <Outlet />;
};

export const Route = createFileRoute("/product/$productId")({
  component: ProductLayout,
  loader: async (ctx) => {
    const { productId }: { productId: string } = ctx.params;
    const product = await retrieveProduct(parseInt(productId));

    return {
      product,
    };
  },
  meta: (ctx) => {
    const { product }: { product: Product | null } = ctx.loaderData.product;

    if (!product) {
      return seo({
        title: "Product Not Found | CodeVault",
        description: "The product you are looking for does not exist.",
      });
    }

    return seo({
      title: product.name
        ? `${product.name} | CodeVault`
        : "CodeVault | High Quality Products for Developers",
      description: product?.description,
    });
  },
});
