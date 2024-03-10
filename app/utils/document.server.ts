import * as graymatter from "gray-matter";

const owner = "TanStack";

export const getGithubContent = async (
  product: string,
  branch: string,
  file: string
) => {
  let originFrontmatter: graymatter.GrayMatterFile<string> | undefined;
  product = "query";
  branch = "main";

  const response = await fetch(
    `https://raw.githubusercontent.com/${owner}/${product}/${branch}/docs/${file}`,
    {
      headers: {
        Accept: "application/vnd.github.v3.raw",
      },
    }
  );

  let text = await response.text();
  if (text === null) {
    return null;
  }
  try {
    const frontmatter = extractFrontMatter(text);
    // If file does not have a ref in front-matter, replace necessary content
    if (!frontmatter.data.ref) {
      if (originFrontmatter) {
        text = replaceContent(text, originFrontmatter);
        text = replaceSections(text, originFrontmatter);
      }
      return Promise.resolve(text);
    }
    originFrontmatter = frontmatter;

    return Promise.resolve(text);
  } catch (error) {
    console.error(`Error while processing ${file}: ${error}`);
    return Promise.resolve(null);
  }
};

/**
 * Perform global string replace in text for given key-value map
 */
function replaceContent(
  text: string,
  frontmatter: graymatter.GrayMatterFile<string>
) {
  let result = text;
  const replace = frontmatter.data.replace as
    | Record<string, string>
    | undefined;
  if (replace) {
    Object.entries(replace).forEach(([key, value]) => {
      result = result.replace(new RegExp(key, "g"), value);
    });
  }

  return result;
}

/**
 * Perform tokenized sections replace in text.
 * - Discover sections based on token marker via RegExp in origin file.
 * - Discover sections based on token marker via RegExp in target file.
 * - replace sections in target file staring from the end, with sections defined in origin file
 * @param text File content
 * @param frontmatter Referencing file front-matter
 * @returns File content with replaced sections
 */
function replaceSections(
  text: string,
  frontmatter: graymatter.GrayMatterFile<string>
) {
  let result = text;
  // RegExp defining token pair to dicover sections in the document
  // [//]: # (<Section Token>)
  const sectionRegex =
    /\[\/\/\]: # '([a-zA-Z\d]*)'[\S\s]*?\[\/\/\]: # '([a-zA-Z\d]*)'/g;

  // Find all sections in origin file
  const substitutes = new Map<string, RegExpMatchArray>();
  for (const match of frontmatter.content.matchAll(sectionRegex)) {
    if (match[1] !== match[2]) {
      console.error(
        `Origin section '${match[1]}' does not have matching closing token (found '${match[2]}'). Please make sure that each section has corresponsing closing token and that sections are not nested.`
      );
    }

    substitutes.set(match[1], match);
  }

  if (substitutes.size > 0) {
    // Find all sections in target file
    const sections = new Map<string, RegExpMatchArray>();
    for (const match of result.matchAll(sectionRegex)) {
      if (match[1] !== match[2]) {
        console.error(
          `Target section '${match[1]}' does not have matching closing token (found '${match[2]}'). Please make sure that each section has corresponsing closing token and that sections are not nested.`
        );
      }

      sections.set(match[1], match);
    }

    Array.from(substitutes.entries())
      .reverse()
      .forEach(([key, value]) => {
        const sectionMatch = sections.get(key);
        if (sectionMatch) {
          result =
            result.slice(0, sectionMatch.index!) +
            value[0] +
            result.slice(
              sectionMatch.index! + sectionMatch[0].length,
              result.length
            );
        }
      });
  }

  return result;
}

export function extractFrontMatter(content: string) {
  return graymatter.default(content, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    excerpt: (file: any) =>
      (file.excerpt = file.content.split("\n").slice(0, 4).join("\n")),
  });
}

export function getGithubRelease(product: string) {
  return fetch(`https://api.github.com/repos/${owner}/${product}/releases`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}
