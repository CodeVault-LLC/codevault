import { useQuery } from "@tanstack/react-query";
import { fetchGithub } from "../fetch/github";

export const useGithub = (url: string) => {
  return useQuery({
    queryKey: ["github", url],
    queryFn: () => fetchGithub(url),
  });
};
