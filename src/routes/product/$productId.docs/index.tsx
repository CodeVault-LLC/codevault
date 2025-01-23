import { useGithub } from "@/client/hooks/useGithub";
import { MDXProvider } from "@mdx-js/react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { DownloadCloudIcon } from "lucide-react";
import { getProductById } from "@/products";

const Documentation: React.FC = () => {
  const { product }: { product: Product } = useLoaderData({
    strict: false,
  });

  const { data } = useGithub(
    "https://raw.githubusercontent.com/CodeVault-LLC/graphql-generator/refs/heads/master/docs/getting-started/introduction.mdx"
  );

  return (
    <>
      <MDXProvider>{data ?? ""}</MDXProvider>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {product.downloadUrl && (
          <a
            href={product.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full"
          >
            <Button size="sm" variant="outline" className="w-full">
              Download <DownloadCloudIcon className="size-4" />
            </Button>
          </a>
        )}
      </div>
    </>
  );
};

export const Route = createFileRoute("/product/$productId/docs/")({
  component: Documentation,
  loader: (ctx) => {
    const { productId } = ctx.params;
    const product = getProductById(productId);

    return {
      product,
    };
  },
});
