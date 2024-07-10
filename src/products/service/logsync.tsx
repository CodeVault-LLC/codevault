import { LockIcon, Rocket, ShieldIcon } from "lucide-react";
import { Product } from "@/types/product";

export const logsyncProduct: Product = {
  id: "logsync",
  name: "LogSync",
  tagline: "Manage your logs with minimal effort and maximum efficiency.",
  description:
    "LogSync is a powerful log management tool that helps you centralize, analyze, and monitor your logs with ease.",
  features: [
    {
      name: "Secure by Design",
      description:
        "Built-in security measures to protect your data and application.",
      icon: <LockIcon className="h-6 w-6 text-primary" />,
    },
    {
      name: "Easily Managable",
      description:
        "Manage your log with maximum efficiency and minimal effort.",
      icon: <Rocket className="h-6 w-6 text-primary" />,
    },
    {
      name: "Roles and Permissions",
      description:
        "Define roles and permissions to control access to your logs.",
      icon: <ShieldIcon className="h-6 w-6 text-primary" />,
    },
  ],
  category: "service",
  badge: "soon",

  isFree: false,
  releaseStatus: {
    released: false,
    phase: "alpha",
  },

  textStyle: "text-yellow-500",

  latestVersion: "v1.0.0",

  isDownloadable: false,
  download: {
    linux: {
      url: "https://github.com/CodeVault-LLC/postgres-template/releases/latest/download/dist.tar",
    },
    mac: {
      url: "https://github.com/CodeVault-LLC/postgres-template/releases/latest/download/dist.tar",
    },
    windows: {
      url: "https://github.com/CodeVault-LLC/postgres-template/releases/latest/download/dist.tar",
    },
  },
};
