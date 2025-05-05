import { Button } from "@/components/ui/button";
import { DefaultWrapper } from "@/core/lib/wrappers/default-wrapper";
import { seo } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";

const Home: React.FC = () => {
  return (
    <DefaultWrapper project={null}>
      <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 py-12 md:px-12 lg:py-24">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              We hear you, Developers
            </h1>
            <h4 className="text-lg md:text-xl font-medium dark:text-blue-200 text-blue-600">
              The people focused on advancing the future of software
            </h4>
          </div>
          <p className="dark:text-gray-300 text-gray-800 max-w-xl">
            CodeVault is aspired to provide developers with useful tools and
            knowledge to help them in their journey. We are committed to
            delivering exceptional results, pushing the boundaries of
            creativity, and making a meaningful difference for our clients and
            their audiences.
          </p>
          <p className="dark:text-gray-300 text-gray-800 max-w-xl">
            We empower you to enhance your productivity, reduce the cost of your
            projects, and strengthen your knowledge.
          </p>
          <div className="flex space-x-4 mt-8">
            <Link to="/projects">
              <Button
                variant="outline"
                className="bg-transparent dark:border-white dark:hover:bg-white dark:hover:text-black transition-colors border-gray-300  hover:bg-gray-100 text-gray-800 dark:text-white"
              >
                Explore our projects
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative hidden lg:block">
          <img
            src="/stock/people-working-together-laptops.avif?height=600&width=600"
            alt="People working together"
            loading="lazy"
            width={600}
            height={600}
            className="object-cover rounded-lg"
          />
        </div>
      </section>
    </DefaultWrapper>
  );
};

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: seo({
      title: "Home | Codevault",
      description:
        "The marketing and documentation site for CodeVault Products.",
      keywords: "codevault, products, documentation, marketing",
    }),
  }),
});
