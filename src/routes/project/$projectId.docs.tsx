import { NotFound } from "@/components/not-found";
import { Separator } from "@/components/ui/separator";
import { DefaultWrapper } from "@/core/lib/wrappers/default-wrapper";
import { getProjectById } from "@/products";
import { IProject } from "@/types/project";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Outlet, createFileRoute, useLoaderData } from "@tanstack/react-router";
import { BugIcon } from "lucide-react";

const Documentation: React.FC = () => {
  const { project }: { project: IProject | null } = useLoaderData({
    strict: false,
  });

  if (!project) return <NotFound />;

  const socials = [
    {
      name: "GitHub",
      description: "View the source code on GitHub",
      link: project?.github?.url,
      icon: <GitHubLogoIcon className="size-6" />,
      issue: false,
    },
    {
      name: "Report Issue",
      description: "Report an issue on GitHub",
      link: project?.github?.url + "/issues/new/choose",
      icon: <BugIcon className="size-6" />,
      issue: false,
    },
  ];

  return (
    <DefaultWrapper project={project}>
      <div className="w-full">
        <div className="flex flex-row justify-between gap-2 items-center">
          <div className="flex flex-row items-center gap-2">
            <img
              src="https://avatars.githubusercontent.com/u/160372018?s=48&v=4"
              alt="CryptoGuard Logo"
              className="w-8 h-8 rounded-md"
            />
            <h3 className="text-2xl font-bold text-center">{project.name}</h3>
          </div>
        </div>
        <Separator className="my-4" />
        <Outlet />
      </div>
    </DefaultWrapper>
  );
};

export const Route = createFileRoute("/project/$projectId/docs")({
  component: Documentation,
  loader: (ctx) => {
    const { projectId } = ctx.params;
    const project = getProjectById(projectId);

    return {
      project,
    };
  },
});
