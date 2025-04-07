import { useGithub } from "@/client/hooks/useGithub";
import { MDXProvider } from "@mdx-js/react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { DownloadCloudIcon } from "lucide-react";
import { getProductById } from "@/products";
import { useEffect, useState } from "react";

const Documentation: React.FC = () => {
  const { product }: { product: Product } = useLoaderData({
    from: "/product/$productId/docs",
  });
  const [mdxContent, setMdxContent] = useState<React.ReactNode>(null);

  const {
    data: mdxSource,
    isLoading,
    error,
  } = useGithub(
    "https://raw.githubusercontent.com/CodeVault-LLC/graphql-generator/refs/heads/master/docs/getting-started/introduction.mdx"
  );

  useEffect(() => {
    const parseMdx = async () => {
      if (!mdxSource) return;

      try {
        const { default: Content } = await evaluate(mdxSource, {
          ...runtime,
          Fragment: runtime.Fragment,
        });

        setMdxContent(<Content />);
      } catch (err) {
        console.error("Failed to evaluate MDX:", err);
      }
    };

    parseMdx();
  }, [mdxSource]);

  return (
    <div className="space-y-6">
      {isLoading && <p>Loading documentation...</p>}
      {error && <p className="text-red-500">Failed to load documentation.</p>}

      {mdxContent && <MDXProvider>{mdxContent}</MDXProvider>}

      {product.downloadUrl && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <a
            href={product.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full"
          >
            <Button size="sm" variant="outline" className="w-full">
              Download <DownloadCloudIcon className="size-4 ml-2" />
            </Button>
          </a>
        </div>
      )}
    </div>
  );
};

export const Route = createFileRoute("/product/$productId/docs/")({
  component: Documentation,
  loader: ({ params }) => {
    const product = getProductById(params.productId);
    if (!product) {
      throw new Error(`Product with ID ${params.productId} not found.`);
    }
    
    return { product };
  },
});
