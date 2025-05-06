import { IProject, ReleasePhase } from "@/types/project";

export const Manager: IProject = {
  id: "manager",
  name: "Manager",
  tagline: "Personal Management Tool",
  description:
    "Manager is a comprehensive personal management tool designed to connect all your data in one place.",
  category: "Productivity",
  tags: [
    "productivity",
    "management",
    "personal",
    "organization",
    "task-management",
  ],
  downloadUrl: "https://github.com/CodeVault-LLC/manager/releases",
  release: {
    phase: ReleasePhase.alpha,
  },
  github: {
    url: "https://github.com/CodeVault-LLC/manager",
    documentationSource:
      "https://raw.githubusercontent.com/CodeVault-LLC/manager/refs/heads/master/docs/schema.json",
  },
};
