import { NotFound } from "@/components/not-found";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getProjectById } from "@/products";
import { Project } from "@/types/project";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import {
  Link,
  Outlet,
  createFileRoute,
  useLoaderData,
} from "@tanstack/react-router";
import { BugIcon } from "lucide-react";

const Documentation: React.FC = () => {
  const { project }: { project: Project | null } = useLoaderData({
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

        <div className="flex flex-row items-center gap-2 h-full">
          {socials.map((social, index) => (
            <>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    key={index}
                    variant="secondary"
                    asChild
                    className={cn(
                      social.issue
                        ? "cursor-not-allowed bg-yellow-600 hover:bg-yellow-700"
                        : "cursor-pointer"
                    )}
                  >
                    <Link
                      to={social.link}
                      className="flex flex-row items-center gap-2"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="ghost"
                        className="bg-transparent hover:bg-transparent gap-2"
                      >
                        {social.icon}
                        {social.name}
                      </Button>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={4} side="top">
                  {social.description}
                </TooltipContent>
              </Tooltip>
              {index !== socials.length - 1 && (
                <Separator orientation="vertical" className="h-9" />
              )}
            </>
          ))}
        </div>
      </div>
      <Separator className="my-4" />
      <Outlet />
    </div>
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
