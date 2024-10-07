import { useMutation, useQuery } from "@tanstack/react-query";
import { type z } from "zod";
import { Project } from "@/types/project";
import { queryClient } from "../query";
import { projectCreateSchema } from "../forms";
import { api } from "../api";
import { fullStripeProductSchema } from "../schema/stripe-product.schemas";

export const useProjects = () => {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await api.get("/projects");
      return response.data;
    },
  });
};

export const useProject = (id: number) => {
  return useQuery<Project>({
    queryKey: ["project", id],
    queryFn: async () => {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    },
  });
};

export const useCreateProject = () => {
  return useMutation({
    mutationKey: ["projects"],
    mutationFn: async (project: z.infer<typeof projectCreateSchema>) => {
      const response = await api.post<Project>("/projects", project);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      window.location.href = `/dashboard/projects/${data.id}`;
    },
  });
};

export const useCreatePricing = () => {
  return useMutation({
    mutationKey: ["pricing"],
    mutationFn: async (data: {
      projectId: number;
      body: z.infer<typeof fullStripeProductSchema>;
    }) => {
      const response = await api.post(`/projects/${data.projectId}/pricing`, {
        body: data.body,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      window.location.href = `/dashboard/projects/${data.id}`;
    },
  });
};
