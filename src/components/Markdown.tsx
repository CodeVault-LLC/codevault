import MDEditor from "@uiw/react-md-editor";
import React from "react";

type Props = {
  value: string;
};

export const Markdown: React.FC<Props> = ({ value }) => {
  return (
    <div className="w-full h-full p-4">
      <MDEditor.Markdown
        source={value}
        style={{ background: "transparent" }}
        className="dark:text-white text-black"
      />
    </div>
  );
};
