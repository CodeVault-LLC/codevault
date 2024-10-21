import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Product } from "@/types/product";
import { queryClient } from "../query";
import { productCreateSchema } from "../forms";
import { api } from "../api";
import {
  localizationSchema,
  pricingSchema,
  stripeProductSchema,
} from "../schema/stripe-product.schemas";

export const useRetrieveProducts = () => {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get("/products");
      return response.data;
    },
  });
};

export const retrieveProduct = async (id: number) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const useRetrieveProduct = (id: number) => {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => retrieveProduct(id),
  });
};

export const useCreateProduct = () => {
  return useMutation({
    mutationKey: ["products"],
    mutationFn: async (project: z.infer<typeof productCreateSchema>) => {
      const response = await api.post<Product>("/products", project);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });

      window.location.href = `/dashboard/products/${data.id}`;
    },
  });
};

export const useEditProduct = (id: number) => {
  return useMutation({
    mutationKey: ["projects", id],
    mutationFn: async (project: z.infer<typeof productCreateSchema>) => {
      const response = await api.put<Product>(`/products/${id}`, project);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });
};

export const useRetrieveProductPricing = (id: number) => {
  return useQuery<
    (typeof stripeProductSchema._type & {
      pricing: typeof pricingSchema._type;
    })[]
  >({
    queryKey: ["pricing", id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}/pricing`);
      return response.data;
    },
  });
};

export const useRetrieveProductPricingDetails = (
  id: number,
  pricingId: number
) => {
  return useQuery<
    typeof stripeProductSchema._type & {
      pricing: typeof pricingSchema._type;
      localization: typeof localizationSchema._type;
    }
  >({
    queryKey: ["pricing", id, pricingId],
    queryFn: async () => {
      const response = await api.get(`/products/${id}/pricing/${pricingId}`);
      return response.data;
    },
  });
};

export const useCreatePricing = (id: number) => {
  return useMutation({
    mutationKey: ["pricing"],
    mutationFn: async (data: { body: z.infer<typeof stripeProductSchema> }) => {
      const response = await api.post(`/products/${id}/pricing`, {
        ...data.body,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing", id] });
    },
  });
};
