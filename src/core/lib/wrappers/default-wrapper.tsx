import { IProject } from "@/types/project";
import { useLocation } from "@tanstack/react-router";
import { FC } from "react";
import { DocumentationWrapper } from "./documentation-wrapper";
import { DefaultHeader } from "@/core/header/header";
import { Footer } from "@/components/footer";

type TDefaultWrapper = {
  children: React.ReactNode;
  project: IProject | null;
};

export const DefaultWrapper: FC<TDefaultWrapper> = (props) => {
  const location = useLocation();

  if (location.pathname.includes("/docs")) {
    if (!props.project) {
      return <div>Project not found</div>;
    }

    return (
      <DocumentationWrapper project={props.project}>
        {props.children}
      </DocumentationWrapper>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-auto flex flex-col">
      <DefaultHeader />
      <div className="my-8 px-8">{props.children}</div>
      <Footer />
    </div>
  );
};
