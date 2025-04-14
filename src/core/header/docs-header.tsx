import { FC } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const DocsHeader: FC = () => {
  const { _splat, branch, projectId } = useParams({
    from: "/project/$projectId/docs/$branch/$/",
  });

  const pathParts = _splat?.split("/").filter(Boolean) || [];

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-row items-center gap-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <Link to="/project/$projectId" params={{ projectId }}>
            <Button
              variant="link"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Button>
          </Link>
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            {pathParts.map((part, index) => {
              const isLastPart = index === pathParts.length - 1;
              const href = `/project/${projectId}/docs/${branch}/${pathParts
                .slice(0, index + 1)
                .join("/")}`;

              return (
                <BreadcrumbItem key={index}>
                  {isLastPart ? (
                    <BreadcrumbPage>
                      {part.slice(0, 1).toUpperCase() + part.slice(1)}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>
                      {part.slice(0, 1).toUpperCase() + part.slice(1)}
                    </BreadcrumbLink>
                  )}
                  {!isLastPart && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div />
      </div>
    </header>
  );
};
