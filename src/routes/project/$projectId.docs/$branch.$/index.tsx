import { useFetchGithub } from "@/client/hooks/useGithub";
import { AlertMDX } from "@/components/mdx/alert";
import { typographyComponents } from "@/components/mdx/typography";
import { evaluate } from "@mdx-js/mdx";
import { createFileRoute, useParams } from "@tanstack/react-router";
import * as runtime from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { MDXProvider } from "@mdx-js/react";
import { LoadingSpinner } from "@/core/loader/loading-spinner";
import { DocLink } from "@/components/mdx/doclink";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/project/$projectId/docs/$branch/$/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId, branch, _splat } = useParams({
    from: "/project/$projectId/docs/$branch/$/",
    strict: true,
  });

  const [mdxContent, setMdxContent] = useState<React.ReactNode>(null);

  const {
    data: mdxSource,
    isLoading,
    error,
  } = useFetchGithub(
    `https://raw.githubusercontent.com/CodeVault-LLC/${projectId}/refs/heads/${branch}/docs/${_splat}.mdx`
  );

  useEffect(() => {
    const parseMdx = async () => {
      if (!mdxSource) return;

      const components = {
        ...typographyComponents,

        Alert: AlertMDX,
        DocLink: DocLink,
      };

      try {
        const { default: Content } = await evaluate(mdxSource, {
          ...runtime,
          Fragment: runtime.Fragment,
          useMDXComponents: () => components,
          remarkPlugins: [remarkGfm],
          stylePropertyNameCase: "css",
          rehypePlugins: [],
        });

        setMdxContent(<Content />);
      } catch (err) {
        console.error("Failed to evaluate MDX:", err);
      }
    };

    parseMdx();
  }, [mdxSource]);

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && !mdxSource && (
        <p className="text-red-500">Documentation not found.</p>
      )}

      {error && <p className="text-red-500">Failed to load documentation.</p>}

      <div className="text-inherit tracking-wide leading-8 flex flex-col gap-4">
        {mdxContent && (
          <MDXProvider components={{ Alert: AlertMDX }}>
            {mdxContent}
          </MDXProvider>
        )}
      </div>
    </div>
  );
}
