import { IProject } from "@/types/project";
//import { Minerva } from "./minerva";
import { GraphQLGen } from "./graphql-gen";

export const projects = [GraphQLGen];

export const getProjectById = (id: string): IProject | null => {
  const product = projects.find((product) => product.id === id);

  if (!product) return null;

  return product;
};
