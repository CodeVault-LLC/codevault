import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";
import FeaturedNews from "@/components/NewsDisplay";
import { useNewsLatestPublished } from "@/gql";

const Home: React.FC = () => {
  const { data: news } = useNewsLatestPublished({
    id: true,
    title: true,
    content: true,
    publishedAt: true,
    createdAt: true,
    state: true,
    updatedAt: true,
  });

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
            <h1 className="text-5xl font-bold mb-4">
              CodeVault&apos;s Humblebrag
            </h1>
            <p className="text-xl mb-4 max-w-2xl">
              Humblebrag has seen drastic improvements in the last few months.
            </p>
            <Button className="bg-red-600 hover:bg-red-700 text-white w-fit">
              Mission Updates
            </Button>
          </div>
        </section>

        <FeaturedNews />
      </main>

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
