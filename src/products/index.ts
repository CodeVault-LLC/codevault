import { Product } from "@/types/product";
import { Minerva } from "./minerva";

export const products = [Minerva];

export const getProductById = (id: string): Product | null => {
  const product = products.find((product) => product.id === id);

  if (!product) return null;

  return product;
};
