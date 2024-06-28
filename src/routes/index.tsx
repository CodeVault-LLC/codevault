import { createFileRoute } from "@tanstack/react-router";
import React, { useMemo, useState } from "react";
import { ImageIcon, InfinityIcon, InfoIcon } from "lucide-react";
import { ProductComponent } from "@/components/ProductComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { seo } from "@/lib/seo";
import { products } from "@/products";

const Home: React.FC = () => {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="flex justify-center items-center flex-col">
        <div className="flex flex-row items-center justify-between gap-4 mb-4">
          <img
            src="https://avatars.githubusercontent.com/u/160372018?s=48&v=4"
            alt="CodeVault"
            className="w-16 h-16 rounded-full"
          />

          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text uppercase">
            CodeVault
          </h1>
        </div>
        <span className="text-3xl line-clamp-2 font-bold max-w-lg text-center">
          High-quality tools made for developers,{" "}
          <span className="uppercase bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">
            by developers
          </span>
        </span>

        <span className="mt-1 dark:text-muted-foreground max-w-xl text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          CodeVault is a perfect solution when in needs of products! It offers a
          wide range of products that are made by developers for developers.
        </span>
      </div>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Our Core Values
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Integrity, Innovation, and Impact
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                At CodeVault LLC, we are driven by a commitment to delivering
                exceptional results, pushing the boundaries of creativity, and
                making a meaningful difference for our clients and their
                audiences.
              </p>
            </div>
          </div>
          <div className="mx-auto grid justify-center max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="grid gap-1">
              <InfinityIcon className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Integrity</h3>
              <p className="text-muted-foreground">
                We are committed to honesty, transparency, and ethical practices
                in all that we do.
              </p>
            </div>
            <div className="grid gap-1">
              <InfoIcon className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Innovation</h3>
              <p className="text-muted-foreground">
                We constantly push the boundaries of creativity to deliver
                unique and impactful solutions.
              </p>
            </div>
            <div className="grid gap-1">
              <ImageIcon className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Impact</h3>
              <p className="text-muted-foreground">
                We strive to make a lasting positive impact on developers and
                their communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="text-center space-y-4 mb-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Explore the Possibilities with CodeVault
          </h1>
          <p className="text-center text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Search for one of our powerful products to get started.
          </p>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter your search..."
                className="max-w-lg flex-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={() => setSearch(search)} type="button">
                Explore
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-28 justify-center items-center">
          {filteredProducts.map((product) => (
            <ProductComponent key={product.id} product={product} />
          ))}
        </div>
      </section>

      <div className="mt-8" />
    </div>
  );
};

export const Route = createFileRoute("/")({
  component: Home,
  meta: () => {
    return seo({
      title: "Home | Codevault",
      description:
        "The marketing and documentation site for CodeVault Products.",
      keywords: "codevault, products, documentation, marketing",
    });
  },
});
