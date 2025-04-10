import { useQuery } from "@tanstack/react-query";
import { fetchGithub } from "../fetch/github";

export const useFetchGithub = (url: string) => {
  return useQuery<Record<string, unknown>>({
    queryKey: ["github", url],
    queryFn: () => fetchGithub(url),
  });
};
