import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { ImageIcon, InfinityIcon, InfoIcon, Pause, Play } from "lucide-react";
import { ProductComponent } from "@/components/ProductComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { seo } from "@/lib/seo";
import { useRetrieveProducts } from "@/client/hooks/useProject";

const Home: React.FC = () => {
  const [search, setSearch] = useState("");
  const { data: products } = useRetrieveProducts();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <main>
        <section
          className="relative h-[60vh] bg-cover bg-center"
          style={{
            backgroundImage: "url('/placeholder.svg?height=800&width=1200')",
          }}
        >
          <div className="absolute inset-0 bg-opacity-50 flex flex-col justify-center px-8">
            <h1 className="text-5xl font-bold mb-4">NASA's SpaceX Crew-8</h1>
            <p className="text-xl mb-4 max-w-2xl">
              NASA and SpaceX have seen a marginal improvement in weather
              conditions for the return of the agency's Crew-8 mission from the
              International Space Station. Undocking is now targeted for no
              earlier than 9:05 p.m. EDT on Monday, Oct. 21.
            </p>
            <Button className="bg-red-600 hover:bg-red-700 text-white w-fit">
              Mission Updates
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="text-sm">
              <h3 className="font-semibold">STATION RESEARCH</h3>
              <p>Your Orbiting Laboratory</p>
            </div>
            <div className="text-sm">
              <h3 className="font-semibold">INDUSTRY PARTNERSHIPS</h3>
              <p>Commercial Crew</p>
            </div>
            <div className="text-sm">
              <h3 className="font-semibold">STATION UPDATES</h3>
              <p>NASA Blog</p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <Button variant="ghost" className="rounded-full p-2">
              <Play className="h-6 w-6" />
            </Button>
            <Button variant="ghost" className="rounded-full p-2">
              <Pause className="h-6 w-6" />
            </Button>
          </div>
        </section>
      </main>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center items-center">
          {products
            ? products.map((product) => (
                <ProductComponent key={product.id} product={product} />
              ))
            : null}
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
