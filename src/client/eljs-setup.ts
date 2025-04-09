import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import graphql from "highlight.js/lib/languages/graphql";
import golang from "highlight.js/lib/languages/go";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("graphql", graphql);
hljs.registerLanguage("go", golang);
