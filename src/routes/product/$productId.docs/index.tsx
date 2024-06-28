import { useGithub } from "@/client/hooks/useGithub";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { getProductById } from "@/products";
import { Product } from "@/types/product";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

const Documentation: React.FC = () => {
  const { product }: { product: Product } = useLoaderData({
    strict: false,
  });

  const { data } = useGithub(
    product.github?.contentUrl + "/main/README.md" ?? ""
  );

  return (
    <>
      <Markdown value={data} />
      {product.isDownloadable && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Download Now
            </h2>
            <p className="mt-4 max-w-[700px] text-muted-foreground md:text-lg">
              Get started with our product today. Choose the version that best
              suits your needs.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Object.entries(product.download).map(([platform, data]) => (
              <div className="rounded-lg bg-background p-6 transition-all border border-muted">
                <h3 className="text-xl font-bold">
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Download the{" "}
                  {platform.charAt(0).toUpperCase() + platform.slice(1)} version
                  of our product.
                </p>
                <div className="mt-4 flex flex-row items-center justify-between">
                  {data && data.virustotal && (
                    <a
                      href={data.virustotal.toString()}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm" variant="outline">
                        <ShieldCheck className="size-6 text-green-400" />
                      </Button>
                    </a>
                  )}

                  {data && data.url && (
                    <a
                      href={data.url.toString()}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm" variant="outline">
                        Download
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
