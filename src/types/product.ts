export enum ReleasePhase {
  alpha = "alpha",
  beta = "beta",
  stable = "stable",
  waitlist = "waitlist",
  comingSoon = "comingSoon",
  discontinued = "discontinued",
}

export interface Product {
  id: string; // ex: "minerva"
  name: string; // ex: "Minerva"
  tagline: string; // ex: "Advanced Reconnaissance Tool"
  description: string; // ex: "Minerva is an advanced reconnaissance tool designed to scan websites for vulnerabilities and exposed secrets."
  category: string; // ex: "Security" or "Development" or "Productivity"
  tags: string[]; // ex: ["security", "reconnaissance", "vulnerabilities"]

  release: {
    phase: ReleasePhase; // ex: "alpha" or "beta" or "stable"
  };

  downloadUrl: string;

  github?: {
    url?: string;
    roadmapUrl?: string;
    documentationSource?: string;
  };
}
