import {
  createFileRoute,
  Outlet,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { useRetrieveProduct } from "@/client/hooks/useProject";
import { Unauthorized } from "@/components/Unauthorized";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Project: FC = () => {
  const { id }: { id: number } = useParams({ strict: false });

  const { data: project, isError, isSuccess } = useRetrieveProduct(id);
  const navigate = useNavigate();

  const tabs = [
    { name: "Overview", to: "/dashboard/products/$id" },
    { name: "Users", to: "/dashboard/products/$id/users" },
    { name: "Settings", to: "/dashboard/products/$id/settings" },
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
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-row gap-8 items-center">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <Badge variant={project.isPublic ? "default" : "destructive"}>
              {project.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          <caption className="text-sm text-gray-500 dark:text-gray-400 text-start">
            {project.tagline}
          </caption>
        </div>

        <hr className="mt-4 mb-4" />
        <Tabs
          className="relative mr-auto w-full"
          defaultValue={tabs[0].name.toLowerCase()}
        >
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.name}
                value={tab.name.toLowerCase()}
                onClick={() => {
                  navigate({
                    to: tab.to.replace("$id", id.toString()),
                  });
                }}
                className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none "
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Outlet />
      </div>
    );
  }
};

export const Route = createFileRoute("/dashboard/products/$id")({
  component: Project,
});
