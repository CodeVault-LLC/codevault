import { Link } from "@tanstack/react-router";
import { CheckIcon, StarIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";

interface TemplateProps {
  product: Product;
}

export const TemplatePage: React.FC<TemplateProps> = ({ product }) => {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    {product.name}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {product.description}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    to="/product/$productId/docs"
                    params={{ productId: product.id }}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
          id="features"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Powerful Features
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  The PostgreSQL template comes packed with features to
                  streamline your development process and ensure a secure,
                  scalable application.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  {product.features.map((feature) => (
                    <li key={feature.name}>
                      <div className="grid gap-1">
                        <div className="flex items-center gap-2">
                          {feature.icon ?? (
                            <CheckIcon className="h-6 w-6 text-primary" />
                          )}
                          <h3 className="text-xl font-bold">{feature.name}</h3>
                        </div>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <img
                src="/placeholder.svg"
                alt="PostgreSQL Template Features"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32" id="setup">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Simple Setup
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get your PostgreSQL template up and running in just a few
                  steps.
                </p>
              </div>
              <div className="bg-background rounded-md p-6 shadow-md w-full max-w-2xl">
                <div className="bg-muted rounded-md p-4">
                  <pre className="text-sm font-mono">
                    <code>node template.js</code>
                  </pre>
                </div>
                <p className="text-muted-foreground mt-2">
                  This will prompt you for your Project Name, connection
                  details, and other configuration options.
                </p>
              </div>
            </div>
          </div>
        </section>

        {!product.isFree && (
          <section
            className="w-full py-12 md:py-24 lg:py-32 bg-muted"
            id="pricing"
          >
            <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Affordable Pricing
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our PostgreSQL template offers flexible pricing options to fit
                  your budget and needs.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row lg:justify-end">
                <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ffa500] rounded-md shadow-lg p-2">
                  <div className="bg-background rounded-md p-6 shadow-md">
                    <div className="flex items-center justify-between gap-8">
                      <h3 className="text-2xl font-bold">Starter Plan</h3>
                      <div className="bg-primary px-3 py-1 rounded-md text-primary-foreground text-sm font-medium">
                        40% OFF
                      </div>
                    </div>
                    <p className="text-muted-foreground text-lg">$9/month</p>
                    <p className="text-muted-foreground text-sm">
                      Billed annually at $99 $59
                    </p>
                    <Button className="mt-4 w-full">Get Started</Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {product.templateAssets ? (
          <div className="space-y-4 mb-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center">
              Explore our Template Assets
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6 text-white">
              {product.templateAssets.map((asset) => (
                <div
                  className="bg-muted rounded-lg shadow-md transition-colors duration-300"
                  key={asset.name}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4 gap-4">
                      {asset.icon}
                      <h3 className="text-xl font-bold">{asset.name}</h3>
                    </div>
                    <p className="text-[#e0e0e0] mb-4">{asset.description}</p>
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        className="text-[#326ce5] hover:bg-[#326ce5]/20 transition-colors duration-300"
                      >
                        Learn More
                      </Button>
                      <div className="flex items-center space-x-2">
                        <StarIcon className="w-5 h-5 text-[#9b59b6]" />
                        <span className="text-[#e0e0e0]">4.7</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};
