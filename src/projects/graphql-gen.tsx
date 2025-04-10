import { IProject, ReleasePhase } from "@/types/project";

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
