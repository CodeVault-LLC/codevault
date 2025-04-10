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
            <p className="text-lg md:text-xl font-medium text-blue-200">
              The people focused on advancing the future of software
            </p>
          </div>
          <p className="text-gray-300 max-w-xl">
            CodeVault is aspired to provide developers with useful tools and
            knowledge to help them in their journey. We are committed to
            delivering exceptional results, pushing the boundaries of
            creativity, and making a meaningful difference for our clients and
            their audiences.
          </p>
          <p className="text-gray-300 max-w-xl">
            We empower you to enhance your productivity, reduce the cost of your
            projects, and strengthen your knowledge.
          </p>
          <div className="flex space-x-4 mt-8">
            <Link to="/projects" className="text-white">
              <Button
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white hover:text-black transition-colors"
              >
                Explore our projects
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative hidden lg:block">
          <img
            src="/placeholder.svg?height=600&width=600"
            alt="Satellite in space"
            width={600}
            height={600}
            className="object-cover"
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
