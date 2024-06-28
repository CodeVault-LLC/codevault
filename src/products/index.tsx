import type { Product } from "@/types/product";
import { mockgenProduct } from "./mockgen";
import { logsyncProduct } from "./service/logsync";
import { postgresTemplate } from "./template/postgres";

export const products = [mockgenProduct, postgresTemplate, logsyncProduct];

export const getProductById = (id: string): Product | null => {
  const product = products.find((product) => product.id === id);

  if (!product) return null;

  return product;
};
