import { LockIcon, RocketIcon, Settings } from "lucide-react";
import { Product } from "@/types/product";

export const humblebragTool: Product = {
  id: "humblebrag",
  name: "Humblebrag",
  tagline: `A quick and easy way to see website data in a simple extension`,
  description: `Humblebrag is a browser extension that allows you to view website data and analysis in a simple and easy-to-understand format.`,
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
  category: "tool",
  badge: "new",

  isFree: false,
  releaseStatus: {
    released: false,
    phase: "alpha",
  },
  priceDetails: {
    method: "pricing-table",
    pricing_table_id: "prctbl_1PaL9QKxjco750EdIlY806EW",
  },

  textStyle: "text-yellow-500",

  latestVersion: "v0.1.0",

  isDownloadable: true,
  download: {
    windows: {
      url: "https://github.com/CodeVault-LLC/postgres-template/releases/latest/download/dist.tar",
    },
  },
};
