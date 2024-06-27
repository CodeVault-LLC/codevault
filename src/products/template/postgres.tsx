import { Product } from "@/types/product";
import { LockIcon, RocketIcon, Settings } from "lucide-react";

export const postgresTemplate: Product = {
  id: "postgres_template",
  name: "Postgres Template",
  tagline: `Easy and quick setup for Postgres database in your projects`,
  description: `Our Postgres template is a simple and easy way to get a Postgres database up and running with security and performance in mind.`,
  features: [
    {
      name: "Secure by Design",
      description:
        "Built-in security measures to protect your data and application.",
      icon: <LockIcon className="h-6 w-6 text-primary" />,
    },
    {
      name: "Easy Setup",
      description:
        "Streamlined installation and configuration process to get you up and running quickly.",
      icon: <RocketIcon className="h-6 w-6 text-primary" />,
    },
    {
      name: "Highly Customizable",
      description:
        "Tailor the template to your specific needs with extensive customization options.",
      icon: <Settings className="h-6 w-6 text-primary" />,
    },
  ],
  category: "template",
  badge: "comingSoon",

  isFree: true,
  releaseStatus: {
    released: false,
    phase: "alpha",
  },

  textStyle: "text-yellow-500",

  latestVersion: "v1.0.0",

  isDownloadable: true,
  downloadUrl:
    "https://github.com/CodeVault-LLC/postgres-template/releases/latest/download/dist.tar",

  github: {
    url: "https://github.com/CodeVault-LLC/postgres-template",
    roadmapUrl: "https://github.com/orgs/CodeVault-LLC/projects/3/views/1",
    contentUrl:
      "https://raw.githubusercontent.com/CodeVault-LLC/postgres-template/",
  },
};
