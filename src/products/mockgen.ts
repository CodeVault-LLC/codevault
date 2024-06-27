import { Product } from "@/types/product";

export const mockgenProduct: Product = {
  id: "mockgen",
  name: "Mockgen",
  tagline: `Easy and blazingly fast mock data generation for your tests and prototypes`,
  description: `Mock Gen is a data generation tool used in making test data or fake data based on options.`,
  features: [
    {
      name: "Easy to Use",
      description:
        "Mockgen is designed to be easy to use and fast to generate data.",
    },
    {
      name: "Customizable",
      description: "You can customize the data generation based on your needs.",
    },
    {
      name: "Blazingly Fast",
      description:
        "Mockgen is designed to be fast and efficient in generating data.",
    },
  ],
  badge: "new",
  category: "tool",

  isFree: true,
  releaseStatus: {
    released: true,
    phase: "stable",
  },

  textStyle: "from-yellow-400 to-purple-600",

  latestVersion: "v1.0.0",
  isDownloadable: true,
  downloadUrl: "https://github.com/CodeVault-LLC/mockgen/releases",

  github: {
    url: "https://github.com/CodeVault-LLC/mockgen",
    roadmapUrl: "https://github.com/orgs/CodeVault-LLC/projects/3/views/1",
    contentUrl: "https://raw.githubusercontent.com/CodeVault-LLC/mockgen/",
  },
};
