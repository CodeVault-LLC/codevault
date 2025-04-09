import hljs from "highlight.js";

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
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="text-gray-900 dark:text-white text-base" />
  ),
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic text-gray-900 dark:text-white"
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    const codeString = typeof props.children === "string" ? props.children : "";

    const highlighted = hljs.highlightAuto(codeString).value;

    return (
      <code
        {...props}
        children={undefined}
        className="hljs dark:text-white dark:bg-[#161b22] rounded px-1 py-0.5"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...props}
      className="dark:text-white dark:bg-[#161b22] rounded overflow-x-auto"
    />
  ),
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
