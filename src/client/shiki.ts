import { createHighlighterCoreSync, createJavaScriptRegexEngine } from "shiki";
import githubDark from "@shikijs/themes/github-dark";

import typescript from "@shikijs/langs/typescript";
import graphql from "@shikijs/langs/graphql";
import json from "@shikijs/langs/json";
import bash from "@shikijs/langs/bash";

export const shiki = createHighlighterCoreSync({
  themes: [
    {
      ...githubDark,
      bg: "none",
    },
  ],
  langs: [typescript, graphql, json, bash],
  engine: createJavaScriptRegexEngine(),
});
