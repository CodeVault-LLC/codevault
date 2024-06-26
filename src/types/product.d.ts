interface Feature {
  name: string;
  description: string;
  icon?: JSX.Element | undefined; // Optional icon for the feature
}

interface Price {
  amount: number;
  currency: string;
  salePrice?: number; // Optional sale price
  isOnSale?: boolean; // Indicates if the product is currently on sale
}

interface ReleaseStatus {
  released: boolean;
  phase?: "alpha" | "beta" | "stable"; // Indicates the release phase
}

interface GitHubInfo {
  url?: string; // Main GitHub repository URL
  roadmapUrl?: string; // GitHub Roadmap URL
  contentUrl?: string; // URL for GitHub contents or files
}

interface TemplateAssets {
  name: string;
  icon: JSX.Element;
  description: string;
  url: string;
}

export interface Product {
  id: string; // Unique identifier for the product
  name: string; // Name of the product
  isFree: boolean; // Indicates if the product is free

  tagline: string; // Short tagline or slogan for the product
  description: string; // Detailed description of the product
  features: Feature[]; // List of product features

  textStyle: string; // Styling for product's display text

  latestVersion: string; // Latest version identifier of the product

  badge?: "new" | "comingSoon"; // Optional badge for product status
  category:
    | "template"
    | "tool"
    | "library"
    | "course"
    | "project"
    | "service"
    | "other"; // Product category

  templateAssets?: TemplateAssets[]; // List of template libraries and important notes (Kubernetes, Docker, etc.)

  isDownloadable?: boolean; // Indic<ates if the product is downloadable
  download: {
    linux?: {
      url: string;
      virustotal?: string;
    };
    mac?: {
      url: string;
      virustotal?: string;
    };
    windows?: {
      url: string;
      virustotal?: string;
    };
  };

  github?: GitHubInfo; // GitHub-related information

  releaseStatus: ReleaseStatus; // Status of the product's release

  priceDetails?: Price; // Pricing details for the product
}
