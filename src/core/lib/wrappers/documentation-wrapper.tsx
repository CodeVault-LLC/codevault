import { useGithub } from "@/client/state/github-store";
import { AppSidebar } from "@/core/docs-sidebar/docs-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IProject } from "@/types/project";
import { FC, useEffect } from "react";
import { DocsHeader } from "@/core/header/docs-header";
import { useNavigate, useParams } from "@tanstack/react-router";
import { LoadingSpinner } from "@/core/loader/loading-spinner";

type TDocumentationWrapper = {
  children: React.ReactNode;
  project: IProject;
};

export const DocumentationWrapper: FC<TDocumentationWrapper> = (props) => {
  const { requestDocumentation, schema } = useGithub();

  const navigate = useNavigate();
  const { _splat, branch, projectId } = useParams({ strict: false });

  if (!props.project.github?.documentationSource) {
    return <div>Documentation source not found</div>;
  }

  useEffect(() => {
    console.log(schema);
    if (!schema || _splat) return;

    const currentBranch = branch ?? "";
    const currentProjectId = projectId ?? "";

    const legalGuides =
      schema.navigation[0].path + "/" + schema.navigation[0].children[0].path;

    if (schema.branches.branch_list.includes(currentBranch)) {
      navigate({
        to: "/project/$projectId/docs/$branch/$",
        params: {
          branch: currentBranch,
          _splat: legalGuides,
          projectId: currentProjectId,
        },
      });
    }

    const legalBranch = schema.branches.production;

    navigate({
      to: "/project/$projectId/docs/$branch/$",
      params: {
        branch: legalBranch,
        _splat: legalGuides,
        projectId: currentProjectId,
      },
    });
  }, [branch, projectId, schema]);

  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        await requestDocumentation(
          props.project.github?.documentationSource ?? ""
        );
      } catch (error) {
        console.error("Failed to fetch documentation:", error);
      }
    };

    fetchDocumentation();
  }, []);

  if (!_splat) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingSpinner className="size-8" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DocsHeader />

        <main className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden mt-4">
          <div className="flex flex-1 flex-col overflow-auto">
            {props.children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
