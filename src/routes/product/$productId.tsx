import { seo } from "@/lib/seo";
import { getProductById } from "@/products";
import { Outlet, createFileRoute } from "@tanstack/react-router";

const ProductLayout: React.FC = () => {
  return <Outlet />;
};

export const Route = createFileRoute("/product/$productId")({
  component: ProductLayout,
  meta: (ctx) => {
    const product = getProductById(ctx.params.productId);

    return seo({
      title: product.name
        ? `${product.name} | CodeVault`
        : "CodeVault | High Quality Products for Developers",
      description: product?.description,
    });
  },
});
