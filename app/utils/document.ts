import { extractFrontMatter, getGithubContent } from "./document.server";
import RemoveMarkdown from "remove-markdown";

export const loadProject = async (project: string, file: string) => {
  const response = await getGithubContent(project, "main", file);

  const content = response ? extractFrontMatter(response as string) : null;
  if (content === null) {
    return null;
  }

  const excerpt = RemoveMarkdown(content.content);

  return {
    content: content.content,
    excerpt,
  };
};
