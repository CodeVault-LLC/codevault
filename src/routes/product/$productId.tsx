import { Outlet, createFileRoute } from "@tanstack/react-router";
import React from "react";
import { seo } from "@/lib/seo";
import { Product } from "@/gql/gpl.d";
import { requestProduct } from "@/gql";

const ProductLayout: React.FC = () => {
  return <Outlet />;
};

export const Route = createFileRoute("/product/$productId")({
  component: ProductLayout,
  loader: async (ctx) => {
    const { productId }: { productId: string } = ctx.params;
    const product = requestProduct(
      {
        id: true,
        name: true,
        description: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        tagline: true,
        public: true,
        status: true,
      },
      { id: productId }
    );

    return {
      product,
    };
  },
  meta: (ctx) => {
    const product: Product | undefined = ctx.loaderData.product;

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
