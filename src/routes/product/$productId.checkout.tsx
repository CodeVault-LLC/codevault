import {
  createFileRoute,
  redirect,
  useLoaderData,
} from "@tanstack/react-router";
import * as React from "react";
import { NotFound } from "@/components/NotFound";
import { seo } from "@/lib/seo";
import { Product } from "@/types/product";
import { retrieveProduct } from "@/client/hooks/useProject";

const Checkout: React.FC = () => {
  const { product }: { product: Product | null } = useLoaderData({
    strict: false,
  });

  if (!product) return <NotFound />;

  return (
    <div>
      <h1 className="text-4xl font-bold text-center">{product.name}</h1>
      <div className="text-center text-lg bg-muted my-8 rounded-lg p-2">
        <h5 className="text-2xl">Warning</h5>
        <p className="text-sm text-yellow-400">
          Enter your payment information correctly to avoid any issues. If you
          do however contact us at{" "}
          <a
            href="mailto:codevaultllc@gmail.com"
            className="underline text-blue-600 hover:text-blue-800"
          >
            codevaultllc@gmail.com
          </a>
        </p>
      </div>

      <stripe-pricing-table
        pricing-table-id={product.priceDetails?.pricing_table_id}
        publishable-key="pk_test_51PZYuuKxjco750Ed3FG4omRFh98PvNT1dxSW6D9H3bpKujZNcmlvkfnZP3MTOBqtNx1ApQVo2rLMiFC1cSXGlcWY00ioWUxUZz"
      />
    </div>
  );
};

export const Route = createFileRoute("/product/$productId/checkout")({
  component: Checkout,
  loader: async (ctx) => {
    const { productId } = ctx.params;
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

    if (product.isPublic) {
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
