import { mockgenProduct } from "./mockgen";
import { postgresTemplate } from "./template/postgres";

export const products = [mockgenProduct, postgresTemplate];

export const getProductById = (id: string) => {
  const product = products.find((product) => product.id === id);

  if (!product) {
    throw new Error(`Product with id ${id} not found`);
  }

  return product;
};
