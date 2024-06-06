import { api } from "./api";

export const fetchGithub = async (url: string) => {
  const res = (await api.get(url)).data;
  return res;
};
