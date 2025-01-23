import { useQuery } from "@tanstack/react-query";
import { fetchGithub } from "../fetch/github";

export const useGithub = (url: string) => {
  return useQuery<Record<string, unknown>>({
    queryKey: ["github", url],
    queryFn: () => fetchGithub(url),
  });
};
