import React from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Product } from "@/gql/gpl.d";

interface ProductProps {
  product: Product;
}

export const ProductPage: React.FC<ProductProps> = ({ product }) => {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-20">
          <p className="text-lg text-gray-400">{product.tagline}</p>
          <h1 className="mt-4 text-6xl font-bold tracking-tight">
            {product.name}
          </h1>
          <div className="mt-8 max-w-3xl">
            <p className="text-xl leading-relaxed text-gray-300">
              {product.description}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <NavigationLink href="/why-we-go" title="Why We Go" />
            <NavigationLink href="/what-we-learn" title="What We Can Learn" />
            <NavigationLink href="/how-we-go" title="How We Go" />
          </div>
          <div className="space-y-4">
            <NavigationLink href="/missions" title="Current Missions" />
            <NavigationLink
              href="/partnerships"
              title="International Partnerships"
            />
            <NavigationLink href="/next-steps" title="Path to Mars" />
          </div>
        </div>
      </div>
    </main>
  );
};

function NavigationLink({ href, title }: { href: string; title: string }) {
  return (
    <Link
      to={href}
      className="group flex items-center justify-between border-b border-gray-800 py-4 transition-colors hover:border-gray-600"
    >
      <span className="text-xl font-medium">{title}</span>
      <ChevronDown className="h-5 w-5 transform transition-transform group-hover:-rotate-180" />
    </Link>
  );
}
