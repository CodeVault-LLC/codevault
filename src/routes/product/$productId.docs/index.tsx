import { useGithub } from "@/client/hooks/useGithub";
import { Markdown } from "@/components/Markdown";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProductById } from "@/products";
import { Product } from "@/types/product";
import { Link, createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Star } from "lucide-react";

const Documentation: React.FC = () => {
  const { product }: { product: Product } = useLoaderData({
    strict: false,
  });

  const { data } = useGithub(product.github.contentUrl + "/main/README.md");

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-6 w-full gap-4">
        <div className="col-span-1 md:col-span-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/product/$productId/docs"
              params={{
                productId: product.id,
              }}
              className="w-full h-full"
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-grow">
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>
                    Learn how to get started with {product.name} in your
                    project.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link
              to="/product/$productId/docs"
              params={{
                productId: product.id,
              }}
              className="w-full h-full"
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-grow">
                  <CardTitle>Tutorials</CardTitle>
                  <CardDescription>
                    Dive deep into {product.name} with our tutorials.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link
              to="/product/$productId/docs/releases"
              params={{
                productId: product.id,
              }}
              className="w-full h-full"
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-grow">
                  <CardTitle>Release Notes</CardTitle>
                  <CardDescription>
                    Stay up to date with the latest {product.name} releases.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <a
              href={product.github.roadmapUrl}
              className="w-full h-full"
              target="_blank"
              referrerPolicy="no-referrer"
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-grow">
                  <CardTitle>Roadmap</CardTitle>
                  <CardDescription>
                    Check out the future plans for {product.name}.
                  </CardDescription>
                </CardHeader>
              </Card>
            </a>
          </div>
        </div>

        <Card className="col-span-1 md:col-span-2 flex flex-col">
          <CardHeader className="flex-grow">
            <CardTitle>Open Source</CardTitle>
            <CardDescription>
              Beautifully designed components that you can copy and paste into
              your apps. Accessible. Customizable. Open Source.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-row gap-4 items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <div className="w-4 h-4 border border-blue-500 rounded-full" />
              <span>Typescript</span>
            </div>

            <div className="flex flex-row items-center gap-2">
              <Star className="size-6" />
              <span>1.2k</span>
            </div>

            <div className="flex flex-row items-center gap-2">
              <span>Updated April 2023</span>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Separator className="my-2" />
      <Markdown value={data} />
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
