import {
  createFileRoute,
  Outlet,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Unauthorized } from "@/components/Unauthorized";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProduct } from "@/gql/gpl";

const Project: FC = () => {
  const { id }: { id: number } = useParams({ strict: false });

  const {
    data: project,
    isError,
    isSuccess,
  } = useProduct(
    {
      createdAt: true,
      description: true,
      name: true,
      id: true,
      public: true,
      category: true,
      status: true,
      tagline: true,
      updatedAt: true,
    },
    { id: id.toString() }
  );
  const navigate = useNavigate();

  const tabs = [
    { name: "Overview", to: "/dashboard/products/$id" },
    { name: "Flows", to: "/dashboard/products/$id/flows" },
    { name: "News", to: "/dashboard/products/$id/news" },
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
      <>
        <div className="mt-8" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-row gap-8 items-center">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <Badge variant={project.public ? "default" : "destructive"}>
              {project.public ? "Public" : "Private"}
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
      </>
    );
  }
};

export const Route = createFileRoute("/dashboard/products/$id")({
  component: Project,
});
