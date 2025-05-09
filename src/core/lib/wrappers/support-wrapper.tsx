import { FC } from "react";
import { DefaultHeader } from "@/core/header/header";
import { Footer } from "@/components/Footer";

type TSupportWrapper = {
  children: React.ReactNode;
};

export const SupportWrapper: FC<TSupportWrapper> = (props) => {
  return (
    <div className="relative h-screen w-screen overflow-auto flex flex-col">
      <DefaultHeader />
      <div className="my-8">{props.children}</div>
      <Footer />
    </div>
  );
};
