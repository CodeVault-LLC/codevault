import { NotFound } from "@/components/NotFound";
import { ProductPage } from "@/pages/Product";
import { TemplatePage } from "@/pages/Template";
import { getProductById } from "@/products";
import { Product } from "@/types/product";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

const RouteForm: React.FC = () => {
  const { product }: { product: Product | null } = useLoaderData({
    strict: false,
  });

  if (!product) return <NotFound />;

  if (product.category === "template")
    return <TemplatePage product={product} />;

  return <ProductPage product={product} />;
};

export const Route = createFileRoute("/product/$productId/")({
  loader: (ctx) => {
    const { productId } = ctx.params;
    const product = getProductById(productId);

    return {
      product,
    };
  },
  component: RouteForm,
});
