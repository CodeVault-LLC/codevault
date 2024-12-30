import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import React from "react";
import { NotFound } from "@/components/NotFound";
import { ProductPage } from "@/pages/Product";
import { TemplatePage } from "@/pages/Template";
import { Waitlist } from "@/pages/Waitlist";
import { requestProduct } from "@/gql/index";
import { Product } from "@/gql/gpl.d";

const RouteForm: React.FC = () => {
  const { product }: { product: Product | null } = useLoaderData({
    strict: false,
  });

  if (!product) return <NotFound />;

  if (product.status === "alpha") return <Waitlist product={product} />;

  if (product.category === "template")
    return <TemplatePage product={product} />;

  return <ProductPage product={product} />;
};

export const Route = createFileRoute("/product/$productId/")({
  loader: async (ctx) => {
    const { productId }: { productId: string } = ctx.params;
    const product = await requestProduct(
      {
        id: true,
        name: true,
        description: true,
        category: true,
        status: true,
        public: true,
        createdAt: true,
        updatedAt: true,
        tagline: true,
      },
      {
        id: productId,
      }
    );

    return {
      product,
    };
  },
  component: RouteForm,
});
