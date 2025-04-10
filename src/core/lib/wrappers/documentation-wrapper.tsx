import { useGithub } from "@/client/state/github-store";
import { AppSidebar } from "@/core/docs-sidebar/docs-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IProject } from "@/types/project";
import { FC, useEffect } from "react";
import { DocsHeader } from "@/core/header/docs-header";

type TDocumentationWrapper = {
  children: React.ReactNode;
  project: IProject;
};

export const DocumentationWrapper: FC<TDocumentationWrapper> = (props) => {
  const { requestDocumentation } = useGithub();

  if (!props.project.github?.documentationSource) {
    return <div>Documentation source not found</div>;
  }

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
