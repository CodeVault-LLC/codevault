import { useMutation, useQuery } from "@tanstack/react-query";
import type { User } from "@/types/user";
import { api } from "../api";

export const useCurrentUser = () => {
  return useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => {
      const responses = await api.get("/users/me");
      return responses.data;
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post("/users/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("jwt", data.token);

      window.location.href = "/";
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationKey: ["register"],
    mutationFn: async (data: {
      email: string;
      password: string;
      username: string;
      avatar: File;
    }) => {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("password", data.password);
      formData.append("email", data.email);
      formData.append("avatar", data.avatar);

      const response = await api.post("/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: () => {
      window.location.href = "/login";
    },
  });
};
