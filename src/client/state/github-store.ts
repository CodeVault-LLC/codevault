import { z } from "zod";
import { create } from "zustand";
import { api } from "../fetch/api";

const githubSchema = z.object({
  branches: z.object({
    production: z.string(),
    branch_list: z.array(z.string()),
  }),
  navigation: z.array(
    z.object({
      title: z.string(),
      path: z.string(),
      children: z.array(
        z.object({
          title: z.string(),
          path: z.string(),
        })
      ),
    })
  ),
});

type GithubStore = {
  schema: z.infer<typeof githubSchema> | null;
  requestDocumentation: (url: string) => Promise<z.infer<typeof githubSchema>>;
};

export const useGithub = create<GithubStore>()((set) => ({
  schema: null,
  requestDocumentation: async (url: string) => {
    const sessionStorage = window.sessionStorage.getItem("github-schema");
    if (sessionStorage) {
      const parsedData = githubSchema.parse(JSON.parse(sessionStorage));
      set({ schema: parsedData });
      return parsedData;
    }

    const response = await api.get<z.infer<typeof githubSchema>>(url);

    if (response.status !== 200) {
      throw new Error("No data found in response");
    }

    const parsedData = githubSchema.parse(response.data);

    set({ schema: parsedData });
    window.sessionStorage.setItem("github-schema", JSON.stringify(parsedData));

    return parsedData;
  },
}));
