import { NotFound } from "@/components/not-found";
import { ProjectPage } from "@/pages/Product";
import { TemplatePage } from "@/pages/Template";
import { getProjectById } from "@/products";
import { MinervaPage } from "@/products/minerva";
import { IProject } from "@/types/project";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

const RouteForm: React.FC = () => {
  const { project }: { project: IProject | null } = useLoaderData({
    strict: false,
  });

  if (!project) return <NotFound />;

  if (project.id === "minerva") return <MinervaPage />;

  if (project.category === "template")
    return <TemplatePage project={project} />;

  return <ProjectPage project={project} />;
};

export const Route = createFileRoute("/project/$projectId/")({
  loader: (ctx) => {
    const { projectId } = ctx.params;
    const project = getProjectById(projectId);

    return {
      project,
    };
  },
  component: RouteForm,
});
