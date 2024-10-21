import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";

const Home: React.FC = () => {
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
            <h1 className="text-5xl font-bold mb-4">CodeVault's Humblebrag</h1>
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
        </section>
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
