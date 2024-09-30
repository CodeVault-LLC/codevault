import { useQuery } from "@tanstack/react-query";
import { Project } from "@/types/project";

export const useProjects = () => {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/projects");
      return response.json();
    },
  });
};
