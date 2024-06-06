import { useGithub } from "@/client/hooks/useGithub";
import { Markdown } from "@/components/Markdown";
import { getProductById } from "@/products";
import { Product } from "@/types/product";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

const ReleaseNotes: React.FC = () => {
  const { product }: { product: Product } = useLoaderData({
    strict: false,
  });

  const { data } = useGithub(product.githubContentUrl + "/main/CHANGELOG.md");

  return (
    <>
      <h2 className="text-2xl font-bold">Release Notes</h2>
      <p className="text-gray-500">
        Stay up-to-date with the latest changes to {product.name}.
      </p>

      <div className="mt-8">
        <Markdown value={data} />
      </div>
    </>
  );
};

export const Route = createFileRoute("/product/$productId/docs/releases")({
  component: ReleaseNotes,
  loader: (ctx) => {
    const { productId } = ctx.params;
    const product = getProductById(productId);

    return {
      product,
    };
  },
});
