import {
  createFileRoute,
  Link,
  Outlet,
  useParams,
} from "@tanstack/react-router";
import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/client/hooks/useProject";
import { Unauthorized } from "@/components/Unauthorized";

const Project: FC = () => {
  const { id }: { id: number } = useParams({ strict: false });

  const { data: project, isError, isSuccess } = useProject(id);

  const tabs = [
    { name: "Overview", to: "/dashboard/projects/$id" },
    { name: "Users", to: "/dashboard/projects/$id/users" },
    { name: "Settings", to: "/dashboard/projects/$id/settings" },
  ];

  if (isError) return <Unauthorized />;

  if (!isSuccess && project === undefined)
    return (
      <div className="flex justify-center items-center h-32">
        <p>Project not found</p>
      </div>
    );

  if (isSuccess) {
    return (
      <div>
        <div className="mt-8" />
        <div className="flex flex-row justify-between items-center gap-2">
          <div className="flex flex-row gap-8 items-center">
            {/*<img src={project.data.images} alt={project.data.name} className="w-12 h-12 rounded-full" />*/}
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <Badge variant={project.isPublic ? "default" : "destructive"}>
              {project.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
        </div>
        <hr className="mt-4" />
        <div className="flex w-full p-1 rounded-lg border border-gray-300 dark:border-gray-700 mt-2 gap-4">
          {tabs.map((tab) => (
            <Link
              to={tab.to}
              params={{ id }}
              activeProps={{
                className: "bg-blue-500 dark:bg-blue-600 text-white shadow-lg",
              }}
              activeOptions={{
                exact: true,
              }}
              key={tab.name}
              className="w-full rounded-lg p-2 text-center transition-all duration-200 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white"
            >
              {tab.name}
            </Link>
          ))}
        </div>
        <Outlet />
      </div>
    );
  }
};

export const Route = createFileRoute("/dashboard/projects/$id")({
  component: Project,
});
