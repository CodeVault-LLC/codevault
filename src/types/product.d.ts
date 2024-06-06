export interface Product {
  id: string;
  name: string;

  tagline: string;
  description: string;
  features: string[];

  textStyle: string;

  latestVersion: string;

  badge?: "new" | "soon";

  downloable?: boolean;
  downloadUrl?: string;

  githubUrl?: string;
  githubRoadmapUrl?: string;
  githubContentUrl?: string;
}
