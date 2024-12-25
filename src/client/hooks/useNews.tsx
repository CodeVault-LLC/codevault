import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { News, NewsStatistics } from "@/types/news";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

export const useCreateNews = (productId: number) => {
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["news"],
    mutationFn: async (data: {
      status: string;
      title: string;
      content: string;
    }) => {
      const response = await api.post(`/products/${productId}/news`, data);
      return response.data;
    },
    onError: (error) => {
      toast({
        title: "Could not create news",
        description: error.message ?? "An error occurred",
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    },
  });
};

export const useUpdateNews = (productId: number, newsId: number) => {
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["news", productId, newsId],
    mutationFn: async (data: {
      status: string;
      title: string;
      content: string;
    }) => {
      const response = await api.put(
        `/products/${productId}/news/${newsId}`,
        data
      );
      return response.data;
    },
    onError: (error) => {
      toast({
        title: "Could not update news",
        description: error.message ?? "An error occurred",
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    },
  });
};

export const useRetrieveNews = (productId: number) => {
  return useQuery<News[]>({
    queryKey: ["news", productId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}/news`);
      return response.data;
    },
  });
};

export const useRetrieveNewsById = (productId: number, newsId: number) => {
  return useQuery<News>({
    queryKey: ["news", productId, newsId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}/news/${newsId}`);
      return response.data;
    },
  });
};

export const useRetrieveNewsStatistics = (productId: number) => {
  return useQuery<NewsStatistics>({
    queryKey: ["news", productId, "statistics"],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}/news/statistics`);
      return response.data;
    },
  });
};
