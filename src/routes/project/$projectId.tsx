import { seo } from "@/lib/seo";
import { getProjectById } from "@/products";
import { Outlet, createFileRoute } from "@tanstack/react-router";

const ProductLayout: React.FC = () => {
  return <Outlet />;
};

export const Route = createFileRoute("/project/$projectId")({
  component: ProductLayout,
  head: (ctx) => {
    const project = getProjectById(ctx.params.projectId);

    if (!project) {
      return {
        meta: seo({
          title: "Product Not Found | CodeVault",
          description: "The product you are looking for does not exist.",
        }),
      };
    }

    return {
      meta: seo({
        title: project.name
          ? `${project.name} | CodeVault`
          : "CodeVault | High Quality Products for Developers",
        description: project?.description,
      }),
    };
  },
});
