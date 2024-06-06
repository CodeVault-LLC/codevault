import { mockgenProduct } from "./mockgen";

export const products = [mockgenProduct];

export const getProductById = (id: string) => {
  const product = products.find((product) => product.id === id);

  if (!product) {
    throw new Error(`Product with id ${id} not found`);
  }

  return product;
};
