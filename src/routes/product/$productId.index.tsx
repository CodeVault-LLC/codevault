import { FeatureList } from "@/components/FeatureList";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getProductById } from "@/products";
import { Product } from "@/types/product";
import { Link, createFileRoute, useLoaderData } from "@tanstack/react-router";

const RouteForm: React.FC = () => {
  const { product }: { product: Product } = useLoaderData({
    strict: false,
  });

  return (
    <div className="flex justify-center items-center flex-col w-full gap-4">
      <h1
        className={cn(
          "inline-block font-black text-4xl md:text-6xl lg:text-7xl",
          product.textStyle
        )}
      >
        {product.name}
      </h1>
      <p className="font-bold text-2xl max-w-[600px] md:text-3xl lg:text-5xl lg:max-w-[800px] text-center">
        {product.tagline}
      </p>
      <Button variant="outline" asChild>
        <Link to="/product/$productId/docs" params={{ productId: product.id }}>
          Get me for free!
        </Link>
      </Button>

      <section className="py-8 w-full">
        <div className="flex items-center justify-center">
          <FeatureList features={product.features} />
        </div>
      </section>

      <section className="py-8 w-full">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="cryptoguard">
            <AccordionTrigger>What is CryptoGuard?</AccordionTrigger>
            <AccordionContent>
              CryptoGuard is a versatile encryption and decryption tool designed
              to provide robust file security.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="features">
            <AccordionTrigger>Features</AccordionTrigger>
            <AccordionContent>
              <ul>
                <li>File Encryption</li>
                <li>File Decryption</li>
                <li>CLI Interface</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
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
