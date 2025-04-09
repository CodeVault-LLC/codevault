import { Project } from "@/types/project";
import { Minerva } from "./minerva";

export const projects = [Minerva];

export const getProjectById = (id: string): Project | null => {
  const product = projects.find((product) => product.id === id);

  if (!product) return null;

  return product;
};
