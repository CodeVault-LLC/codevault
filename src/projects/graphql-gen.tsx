import { Button } from "@/components/ui/button";
import { IProject, ReleasePhase } from "@/types/project";
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";

// eslint-disable-next-line react-refresh/only-export-components
export const GraphQLGen: IProject = {
  id: "graphql-generator",
  name: "GraphQL Generator",
  tagline: "Code Generation Tool",
  description:
    "GraphQL Generator is a powerful tool that simplifies the process of generating GraphQL schemas and resolvers. It allows developers to define their data models and automatically generates the necessary code, reducing boilerplate and improving productivity.",
  category: "Code Generation",
  tags: [
    "graphql",
    "code-generation",
    "schema",
    "api",
    "server",
    "typescript",
    "javascript",
    "schema-generator",
  ],
  downloadUrl: "https://github.com/CodeVault-LLC/graphql-generator/releases",
  release: {
    phase: ReleasePhase.alpha,
  },
  github: {
    url: "https://github.com/CodeVault-LLC/graphql-generator",
    documentationSource:
      "https://raw.githubusercontent.com/CodeVault-LLC/graphql-generator/refs/heads/master/docs/schema.json",
  },
};

export const GraphQLGenRender: FC = () => {
  const { t } = useTranslation();

  const features = [
    "Typesafe with Rust AST",
    "Comments/Descriptions",
    "Directives",
    "Scalars",
    "Interface, Enums, Unions, Input Types",
    "Plugins",
    "Extend Schemas",
  ];

  return (
    <div>
      <h2 className="text-4xl font-bold mb-4">{GraphQLGen.name}</h2>
      <p className="mb-4">{t("projects.graphql-generator.description")}</p>

      <div className="flex flex-row items-center gap-2">
        <Link
          to="/project/$projectId/docs"
          params={{ projectId: GraphQLGen.id }}
        >
          <Button variant="default">{t("common.documentation")}</Button>
        </Link>

        <Link
          to="/project/$projectId/support"
          params={{ projectId: GraphQLGen.id }}
        >
          <Button variant="outline">{t("common.support")}</Button>
        </Link>
      </div>

      <div className="mt-16 grid gap-px overflow-hidden rounded-lg border bg-input md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3 bg-background p-5 md:gap-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-globe size-6 shrink-0"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
            <path d="M2 12h20"></path>
          </svg>
          <div>
            <h2 className="text-sm font-semibold md:text-base">
              Robust Infrastructure
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Reliable and scalable infrastructure, easy to manage.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 bg-background p-5 md:gap-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-rocket size-6 shrink-0"
          >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
          </svg>
          <div>
            <h2 className="text-sm font-semibold md:text-base">Easy Setup</h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Quick and simple configuration for any use case.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 bg-background p-5 md:gap-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-expand size-6 shrink-0"
          >
            <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"></path>
            <path d="M3 16.2V21m0 0h4.8M3 21l6-6"></path>
            <path d="M21 7.8V3m0 0h-4.8M21 3l-6 6"></path>
            <path d="M3 7.8V3m0 0h4.8M3 3l6 6"></path>
          </svg>
          <div>
            <h2 className="text-sm font-semibold md:text-base">
              Effortless Scaling
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Built to handle increased demand with ease.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 bg-background p-5 md:gap-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-wrench size-6 shrink-0"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
          <div>
            <h2 className="text-sm font-semibold md:text-base">
              Low Maintenance
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Focus on building, not on maintenance tasks.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold my-8 mb-4 text-center">
        {t("common.features")}
      </h2>

      <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-row items-center space-x-2">
            <CheckCircle2 className="size-5 dark:text-green-400 text-green-600" />
            <p className="text-base">{feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
