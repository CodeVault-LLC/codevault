import { productStatus, productCategory } from "@/client/forms";

export interface Product {
  id: number;
  name: string;
  description: string;
  tagline: string;
  category: typeof productCategory._type;
  status: typeof productStatus._type;

  isPublic: boolean;

  createdAt: string;
  updatedAt: string;
}
