import { IProject } from "@/types/project";
//import { Minerva } from "./minerva";
import { Manager } from "./manager";
import { GraphQLGen } from "./graphql-gen";

export const projects = [GraphQLGen, Manager];

export const getProjectById = (id: string): IProject | null => {
  const product = projects.find((product) => product.id === id);

  if (!product) return null;

  return product;
};
