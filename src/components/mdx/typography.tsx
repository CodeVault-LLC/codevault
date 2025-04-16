import { shiki } from "@/client/shiki";
import { Button } from "../ui/button";
import React from "react";
import { useTheme } from "../theme-provider";

export const typographyComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      {...props}
      className="text-3xl font-bold text-gray-900 dark:text-white"
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className="text-2xl font-semibold text-gray-900 dark:text-white"
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      {...props}
      className="text-xl font-semibold text-gray-900 dark:text-white"
    />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      {...props}
      className="text-lg font-semibold text-gray-900 dark:text-white"
    />
  ),
  h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5
      {...props}
      className="text-base font-semibold text-gray-900 dark:text-white"
    />
  ),
  h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6
      {...props}
      className="text-base font-semibold text-gray-900 dark:text-white"
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="text-gray-900 dark:text-white text-sm" />
  ),
  li: (props: { children: { props: { children: string } }[] }) => {
    return (
      <li className="text-gray-900 dark:text-white text-sm">
        {props.children[1]?.props?.children ?? props.children}
      </li>
    );
  },
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      {...props}
      className="list-disc list-inside text-gray-900 dark:text-white"
    />
  ),
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic text-gray-900 dark:text-white"
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    const theme = useTheme();
    const language = props.className?.match(/language-(\w+)/)?.[1];

    const codeString = typeof props.children === "string" ? props.children : "";

    if (!language) {
      return (
        <code
          {...props}
          className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded"
          style={{
            padding: "0.1rem 0.4rem",
          }}
          children={props.children}
        />
      );
    }

    const code = shiki.codeToHtml(codeString, {
      lang: language,
      theme: theme?.theme === "dark" ? "github-dark" : "github-light",
    });

    return (
      <code
        {...props}
        children={undefined}
        className="dark:text-white dark:bg-[#161b22] rounded"
        dangerouslySetInnerHTML={{ __html: code }}
        data-language={language}
      />
    );
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pre: (props: any) => {
    if (!props.children) {
      return <pre {...props} />;
    }

    if (!React.isValidElement(props.children) || !props.children.props) {
      return <pre {...props} />;
    }

    const language =
      props.children.props.className?.match(/language-(\w+)/)?.[1];

    return (
      <pre
        {...props}
        className="rounded dark:text-white dark:bg-[#161b22] bg-gray-100"
      >
        <div className="flex flex-row items-center border-b-2 font-mono p-1 px-2 dark:bg-zinc-800 bg-gray-200 rounded justify-between">
          {language}
          <Button
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(
                props.children.props.children as string
              );
            }}
          >
            Copy
          </Button>
        </div>

        <div className="px-1">{props.children}</div>
      </pre>
    );
  },
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="text-blue-600 dark:text-blue-400 hover:underline"
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong
      {...props}
      className="text-gray-900 dark:text-white font-semibold"
    />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em {...props} className="text-gray-900 dark:text-white italic" />
  ),
};
