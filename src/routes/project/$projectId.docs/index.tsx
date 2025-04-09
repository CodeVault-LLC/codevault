import { useGithub } from "@/client/hooks/useGithub";
import { MDXProvider } from "@mdx-js/react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { DownloadCloudIcon } from "lucide-react";
import { getProjectById } from "@/products";
import { useEffect, useState } from "react";
import { AlertMDX } from "@/components/mdx/alert";
import { typographyComponents } from "@/components/mdx/typography";

const Documentation: React.FC = () => {
  const { project }: { project: Project } = useLoaderData({
    from: "/project/$projectId/docs",
  });
  const [mdxContent, setMdxContent] = useState<React.ReactNode>(null);

  const {
    data: mdxSource,
    isLoading,
    error,
  } = useGithub(
    "https://raw.githubusercontent.com/CodeVault-LLC/graphql-generator/refs/heads/master/docs/getting-started/introduction.mdx"
  );

  useEffect(() => {
    const parseMdx = async () => {
      if (!mdxSource) return;

      const components = {
        Alert: AlertMDX,
        ...typographyComponents,
      };

      try {
        const { default: Content } = await evaluate(mdxSource, {
          ...runtime,
          Fragment: runtime.Fragment,
          useMDXComponents: () => components,
          remarkPlugins: [],
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
      {isLoading && <p>Loading documentation...</p>}
      {error && <p className="text-red-500">Failed to load documentation.</p>}

      <div className="text-inherit tracking-wide leading-8 flex flex-col gap-4">
        {mdxContent && (
          <MDXProvider components={{ Alert: AlertMDX }}>
            {mdxContent}
          </MDXProvider>
        )}
      </div>

      {project.downloadUrl && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <a
            href={project.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full"
          >
            <Button size="sm" variant="outline" className="w-full">
              Download <DownloadCloudIcon className="size-4 ml-2" />
            </Button>
          </a>
        </div>
      )}
    </div>
  );
};

export const Route = createFileRoute("/project/$projectId/docs/")({
  component: Documentation,
  loader: ({ params }) => {
    const project = getProjectById(params.projectId);
    if (!project) {
      throw new Error(`Project with ID ${params.projectId} not found.`);
    }

    return { project };
  },
});
