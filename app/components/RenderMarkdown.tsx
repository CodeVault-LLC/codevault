import type { FC } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { MarkdownLink } from "./MarkdownLink";
import { CodeBlock } from "./CodeBlock";

const defaultComponents: Record<string, FC> = {
  a: MarkdownLink,
  pre: CodeBlock,
  iframe: (props) => (
    <iframe {...props} className="w-full" title="Embedded Content" />
  ),
  code: ({ className = "", ...props }: React.HTMLProps<HTMLElement>) => {
    return (
      <code
        {...props}
        className={`border border-gray-500 border-opacity-20 bg-gray-500 bg-opacity-10 rounded p-1${
          className ?? ` ${className}`
        }`}
      />
    );
  },
};

type Props = {
  children: string;
  components?: Record<string, FC>;
};

export const RenderMarkdown = (props: Props) => {
  const { components, children } = props;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug, rehypeRaw]}
      components={{ ...defaultComponents, ...components }}
    >
      {children}
    </ReactMarkdown>
  );
};
