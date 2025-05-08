import { NotFound } from "@/components/not-found";
import { DefaultWrapper } from "@/core/lib/wrappers/default-wrapper";
import { ProjectPage } from "@/pages/Product";
import { getProjectById } from "@/projects";
import { GraphQLGenRender } from "@/projects/graphql-gen";
import { MinervaPage } from "@/projects/minerva";
import { IProject } from "@/types/project";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

const RouteForm: React.FC = () => {
  const { project }: { project: IProject | null } = useLoaderData({
    strict: false,
  });

  if (!project) return <NotFound />;

  if (project.id === "minerva") return <MinervaPage />;

  switch (project.id) {
    case "graphql-generator":
      return (
        <DefaultWrapper project={project}>
          <GraphQLGenRender />
        </DefaultWrapper>
      );
  }

  return (
    <DefaultWrapper project={project}>
      <ProjectPage project={project} />
    </DefaultWrapper>
  );
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
