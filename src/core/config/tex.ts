// Content for the TeX project page. TeX carries more material than the shared
// `Project` model in projects.ts holds — a build pipeline, a diagnostic
// translation table, a benchmark corpus — so it lives here, the way Seamark's
// does in seamark.ts.
//
// Everything below is the project's own record: what it parses, what it builds,
// what it says when something breaks, and what it refuses to claim. Page
// components own structure and presentation only.

export type Entry = {
  term: string
  body: string
}

// A bare label/value pair for the figure strips, where the number needs no
// caveat attached to it.
export type Figure = {
  label: string
  value: string
}

export type Feature = {
  name: string
  body: string
  // The binding, as keycaps. Omitted where the thing has no key.
  keys?: string[]
  // Why it exists — the observation that produced it, not the feature blurb.
  why: string
}

export type BuildStep = {
  code: string
  name: string
  // Short form, for the timeline plate where there is no room for the name.
  short: string
  body: string
  // Wall-clock for this step on the reference document (the 182-page thesis,
  // warm cache). The plate lays these out to scale; the ladder's bars use
  // `weight`, which is deliberately not linear — a 6 ms step against a 704 ms
  // one is a bar you cannot see.
  ms: number
  weight: number
  // Restored from cache rather than run. The whole argument of the section.
  cached?: boolean
}

export type Diagnostic = {
  // What the engine actually prints, wrapped as it appears in the log.
  log: string
  // What the editor puts in the problem list instead.
  message: string
  // The suggested repair, where there is one honest enough to suggest.
  fix?: string
  severity: "Error" | "Warning" | "Hint"
}

export type Benchmark = {
  name: string
  detail: string
  cold: string
  warm: string
  save: string
  // 0–1, for the bars. Scaled against the slowest document in the corpus.
  weight: { cold: number; warm: number; save: number }
}

export type Metric = {
  label: string
  value: string
  note: string
}

export type Reference = {
  label: string
  detail: string
}

export const lede =
  "Writing LaTeX still means keeping a compiler in your head — which files it will read, how many passes it needs, and where in a thousand lines of log the real error is. TeX is an editor that keeps that in its head instead: it parses the document as you type, rebuilds only what changed, and turns the transcript into something you can act on."

// The sheet's panels, in order. Titles live here so the contents band and the
// section headers cannot drift apart; `measure` is the mono label held at the
// right margin of each header — specimen-sheet furniture, and occasionally the
// one figure that section is about.
export const sheet = [
  { index: "01", title: "What writing LaTeX is like", measure: "the log file" },
  { index: "02", title: "The document, parsed", measure: "4 ms / keystroke" },
  { index: "03", title: "Editing", measure: "the surface" },
  { index: "04", title: "The build pipeline", measure: "41 s → 0.9 s" },
  { index: "05", title: "One save, end to end", measure: "912 ms" },
  {
    index: "06",
    title: "What the log says, and what we say",
    measure: "191 rules",
  },
  { index: "07", title: "The preview", measure: "SyncTeX, both ways" },
  { index: "08", title: "How fast it actually is", measure: "corpus of 12" },
  { index: "09", title: "What it does not do", measure: "scope" },
  { index: "10", title: "Trial, experience, adjustment, result", measure: "" },
  { index: "11", title: "Working log", measure: "2 Mar – 8 Jul" },
  { index: "12", title: "Standing back", measure: "notes" },
] as const

export type Panel = (typeof sheet)[number]

export function panel(index: Panel["index"]): Panel {
  return sheet.find((s) => s.index === index)!
}

// Section 01 — the loop the project is trying to break, and why it is shaped
// the way it is rather than simply being slow.
export const status = {
  body: "TeX was written for a machine that ran jobs, not for one you sit in front of. You hand it a file, it typesets the whole document, and it tells you how that went in a transcript addressed to nobody in particular. Every editor since has been a text field bolted to that batch job, and almost all of the friction in writing LaTeX comes from the seam between the two rather than from either side of it.",
  properties: [
    {
      term: "The compiler is a batch job",
      body: "One invocation typesets the entire document, whether you changed a chapter or a comma. There is no protocol for asking it what changed, so most tools do not ask.",
    },
    {
      term: "The log is the interface",
      body: "Errors, warnings and progress arrive interleaved in one transcript, line-wrapped at 79 characters, with the position TeX noticed the problem rather than the position that caused it.",
    },
    {
      term: "A build is several builds",
      body: "Cross-references, citations and indices only settle after the run that reads what the previous run wrote. Knowing how many passes a document needs is, conventionally, your job.",
    },
    {
      term: "Nobody parses the document",
      body: "Macros can redefine the language they are written in, so tooling mostly gives up and matches text. That is why your editor can highlight \\section and still not know which file it lives in.",
    },
  ] satisfies Entry[],
  figures: [
    { label: "Full rebuild, 182-page thesis", value: "41.2 s" },
    { label: "Passes before it settles", value: "3–4" },
    { label: "Lines of log for a clean build", value: "≈ 2,900" },
    { label: "Of those, worth reading", value: "0" },
  ] satisfies Figure[],
}

// Section 02 — the model everything else is built on.
export const model = {
  body: "The first version matched text with regular expressions, like most LaTeX tooling, and it was wrong often enough that nothing could be built on top of it. It now parses: a tree-sitter grammar re-parses the file on every keystroke, and a resolver walks \\input, \\include and \\bibliography to hold the whole project as one graph rather than a folder of unrelated buffers.",
  properties: [
    {
      term: "Incremental",
      body: "A keystroke re-parses the region it touched, not the file. The median edit costs 4 ms on a 6,000-line chapter, which is the budget that lets everything downstream run on every keystroke instead of on save.",
    },
    {
      term: "Macro-aware, to a point",
      body: "Definitions from \\newcommand and \\DeclareMathOperator are tracked and expanded one level for completion and go-to-definition. Anything cleverer is left alone.",
    },
    {
      term: "Project-wide",
      body: "The file graph is the unit, not the buffer. Renaming a label updates its references across chapters, and a citation completes from every .bib the root document loads.",
    },
    {
      term: "Honest about its limits",
      body: "TeX's macro language is Turing-complete and this is not an interpreter for it. Where the model cannot resolve something it says so and degrades to text — silently guessing is how the previous version lost our trust.",
    },
  ] satisfies Entry[],
}

// Section 03 — the editing surface. `why` matters more than `body` here: every
// one of these came out of watching someone write rather than from a list.
export const editing: Feature[] = [
  {
    name: "Math, rendered where you wrote it",
    body: "An equation renders under the caret as you type it, and folds back to source the moment you leave the line. The source is never rewritten — this is a rendering, not a WYSIWYG surface.",
    keys: ["⌘", "M"],
    why: "Almost every compile we watched people trigger was to check whether one equation came out right. That is a preview question, not a build question.",
  },
  {
    name: "Structural motion",
    body: "Move by environment, section and paragraph rather than by line. Select the enclosing environment, cycle to the next sibling, jump to the matching \\end.",
    keys: ["⌥", "↑"],
    why: "The tree is already there for the parser. Not offering it to the caret was leaving the good part of parsing on the floor.",
  },
  {
    name: "Citations from your bibliography",
    body: "\\cite{ completes against every .bib the project loads, matching on author, year and title, and shows the entry inline so you can tell two papers apart before you commit to one.",
    keys: ["⌃", "Space"],
    why: "The alternative is a second window, a text search, and a nine-character key copied by hand. Most wrong citations we found were transcription, not judgement.",
  },
  {
    name: "Environments as one object",
    body: "Type an environment name and it opens and closes together. Rename either end and both change; delete the \\begin and the \\end goes with it.",
    why: "Unbalanced environments are the single most common way to make a document stop compiling, and the error TeX gives for one is the least useful error it has.",
  },
  {
    name: "Labels that keep up",
    body: "Rename a label and every \\ref, \\eqref and \\autoref across the project follows. Unreferenced labels and dangling references are marked while you write, not after a build.",
    keys: ["F2"],
    why: "Reference errors are silent until the pass that resolves them, which is usually the pass you were not going to run.",
  },
  {
    name: "Click the page, land on the line",
    body: "Click anywhere in the preview to put the caret on the source that set it, and put the preview on the caret when you move. Both directions, at the character.",
    keys: ["⌘", "click"],
    why: "On a 182-page document, finding the paragraph you are looking at is a genuine search problem. SyncTeX has solved it since 2008 and hardly anything uses it well.",
  },
]

// A still of the editor as it appears mid-sentence, drawn in the page. The
// source is real LaTeX; the diagnostics are the ones this document produces.
export const editorStill = {
  file: "thesis/ch4-methods.tex",
  root: "thesis/main.tex",
  lines: [
    { n: 408, text: "\\subsection{Reception model}" },
    { n: 409, text: "" },
    {
      n: 410,
      text: "The per-cell estimate follows \\citet{knuth1986}, with",
    },
    { n: 411, text: "the coverage term taken from \\eqref{eq:coverage}:" },
    { n: 412, text: "" },
    { n: 413, text: "\\begin{equation}\\label{eq:coverage}" },
    { n: 414, text: "  P(\\text{heard}) = 1 - \\prod_{i=1}^{n}(1 - p_i)" },
    { n: 415, text: "\\end{equation}" },
    { n: 416, text: "" },
    { n: 417, text: "\\includegrpahics[width=0.8\\textwidth]{fig/coverage}" },
  ],
  // Which line the caret sits on, and which one is underlined as a problem.
  caret: 414,
  problem: 417,
  problems: [
    {
      severity: "Error" as const,
      line: 417,
      text: "Unknown command \\includegrpahics — did you mean \\includegraphics?",
    },
    {
      severity: "Warning" as const,
      line: 410,
      text: "Citation knuth1986 is not in refs.bib.",
    },
  ],
  rendered: "P(heard) = 1 − ∏ (1 − pᵢ)",
}

// Section 04 — the build pipeline, which is most of what this project is.
export const build = {
  body: "A build is a graph, not a command. TeX resolves what a save can possibly have affected, restores everything unchanged from a content-addressed cache, runs the engine only for the passes that can still change the output, and stops as soon as the auxiliary files stop moving. The engine itself is untouched — pdfTeX, XeTeX, LuaTeX and Tectonic all run exactly as they would from a shell.",
  ideas: [
    {
      term: "Content-addressed, not timestamped",
      body: "Every input is hashed: source files, class and package files, images, fonts, the engine binary and the flags it was given. A build is a lookup on that hash before it is a process. Touching a file changes nothing; changing it changes everything downstream and nothing else.",
    },
    {
      term: "Convergence, detected",
      body: "The classic advice is to run LaTeX twice, or three times, or until it stops complaining. TeX hashes the auxiliary files after each pass and runs one more only when they moved. Four in five builds settle in two passes; the fourth pass, when it happens, is a real one.",
    },
    {
      term: "Sandboxed and reproducible",
      body: "Each pass runs in a scratch directory with a pinned distribution, a fixed SOURCE_DATE_EPOCH and no network. The same inputs produce the same bytes, which is the only reason the cache is safe to trust.",
    },
    {
      term: "Parallel where it is allowed to be",
      body: "Independent targets — a paper, its supplement, six standalone TikZ figures — build at once, and figures that compile to their own PDFs are cached separately from the document that includes them. The dependency graph decides; nothing is parallel by assumption.",
    },
  ] satisfies Entry[],
  // The reference build: the 182-page thesis, one paragraph edited, warm cache.
  reference: "182-page thesis · one paragraph edited · warm cache",
  steps: [
    {
      code: "01",
      name: "Resolve",
      short: "Resolve",
      body: "The saved file is diffed against the parsed tree to find what actually changed, and the project graph decides which targets that reaches. An edit inside a paragraph reaches one; an edit to a preamble macro reaches all of them.",
      ms: 6,
      weight: 0.04,
    },
    {
      code: "02",
      name: "Hash inputs",
      short: "Hash",
      body: "Every input of every reachable target is hashed — 1,140 files here, of which 1,138 are the distribution and have not changed since the first build of the day.",
      ms: 31,
      weight: 0.1,
    },
    {
      code: "03",
      name: "Restore",
      short: "Restore",
      body: "Cached outputs are restored for everything whose hash is unchanged: 41 standalone figures, the index, and the bibliography. None of these run.",
      ms: 48,
      weight: 0.14,
      cached: true,
    },
    {
      code: "04",
      name: "Pass 1 · pdfTeX",
      short: "Engine pass",
      body: "The one unavoidable step. The engine typesets the document and writes the auxiliary files that the next pass would read.",
      ms: 704,
      weight: 1,
    },
    {
      code: "05",
      name: "Compare aux",
      short: "Compare aux",
      body: "The auxiliary files are hashed against the previous build. Nothing moved — no label, citation or page number changed — so there is no second pass to run.",
      ms: 9,
      weight: 0.05,
      cached: true,
    },
    {
      code: "06",
      name: "Diff pages",
      short: "Diff pages",
      body: "The new PDF is compared against the old one page by page. One page differs, so one page is re-rastered rather than the document.",
      ms: 72,
      weight: 0.18,
    },
    {
      code: "07",
      name: "Repaint",
      short: "Repaint",
      body: "The preview replaces the changed page and holds the scroll position on the line the caret is in. The typo is on screen.",
      ms: 42,
      weight: 0.12,
    },
  ] satisfies BuildStep[],
  cold: "41.2 s",
}

// The number the section is about, summed rather than typed in a second time.
export const buildTotalMs = build.steps.reduce((total, s) => total + s.ms, 0)

// Section 06 — the log, translated. `log` is the engine's own wording; the
// project's contribution is everything to the right of it.
export const diagnostics: Diagnostic[] = [
  {
    log: "! Undefined control sequence.\nl.417 \\includegrpahics\n                     [width=0.8\\textwidth]{fig/coverage}",
    message:
      "Unknown command \\includegrpahics on line 417 of ch4-methods.tex.",
    fix: "Did you mean \\includegraphics? One edit distance, and it is defined by graphicx, which this document already loads.",
    severity: "Error",
  },
  {
    log: "! Missing $ inserted.\n<inserted text>\n                $\nl.88 ...the coefficient \\alpha_i\n                              is fixed",
    message:
      "Math command \\alpha used outside math mode on line 88 of ch2-background.tex.",
    fix: "TeX reports this where it gave up, which is often the next paragraph. The position above is where the unbalanced math actually starts.",
    severity: "Error",
  },
  {
    log: "LaTeX Warning: Citation `knuth1986' on page 112 undefined on\ninput line 410.",
    message:
      "Citation knuth1986 is not in any bibliography this document loads.",
    fix: "refs.bib has knuth1984 and knuth1986a. If you added the entry since the last build, the bibliography has not been rebuilt — it will be on the next save.",
    severity: "Warning",
  },
  {
    log: "! LaTeX Error: File `algorithm2e.sty' not found.\nType X to quit or <RETURN> to proceed,\nor enter new name. (Default extension: sty)",
    message: "Package algorithm2e is not installed in the pinned distribution.",
    fix: "Add it to the project manifest and it is installed into the sandbox on the next build, so everyone else gets it too.",
    severity: "Error",
  },
  {
    log: "Overfull \\hbox (12.9pt too wide) in paragraph at lines\n88--92",
    message:
      "A line runs 12.9 pt past the right margin on page 41 — a URL with no break point.",
    severity: "Hint",
  },
  {
    log: "LaTeX Warning: Label(s) may have changed. Rerun to get\ncross-references right.",
    message: "Nothing.",
    fix: "This one is an instruction to the build system rather than to you, and the build system has already followed it — the rerun happened before you finished reading the sentence.",
    severity: "Hint",
  },
]

export const diagnosticsNote =
  "There are 191 of these rules. They are hand-written, boring to maintain, and the highest-value code in the project — a message that names the file, the line and the likely repair is the difference between a two-minute detour and a bad afternoon. The raw transcript is always one keystroke away, because a translation is a claim, and sometimes it is wrong."

// Section 07 — the preview.
export const preview = {
  body: "The preview is not a PDF viewer that happens to sit next to an editor; it is the half of the editor where the output lives. It is addressed by source position rather than by page, it repaints the pages that changed rather than the document, and it never loses your place — the single most common complaint about every other setup we tried.",
  figures: [
    { label: "Pages re-rastered per save", value: "1.4 median" },
    { label: "Repaint, p95", value: "18 ms" },
    { label: "Scroll position kept", value: "Always" },
    { label: "Sync accuracy", value: "Character" },
  ] satisfies Figure[],
  properties: [
    {
      term: "Forward and inverse search",
      body: "Caret to page, page to caret, at the character rather than the paragraph. Built on SyncTeX, which every engine has emitted since 2008 and almost nothing uses well.",
    },
    {
      term: "Page-level diffing",
      body: "The rasteriser is given the pages whose content hash changed. A typo in chapter four does not redraw chapter one, and the difference is visible: the page appears to correct itself in place.",
    },
    {
      term: "Warnings, in the margin",
      body: "Overfull boxes, bad line breaks and float placements are drawn where they happen instead of listed as line numbers. A typographic problem is easier to judge than to read about.",
    },
  ] satisfies Entry[],
}

// Section 08 — the numbers, with the caveat stated before them.
export const evaluation = {
  caveat:
    "Benchmarks measured by the people who wrote the thing being measured are marketing, so here is everything needed to disbelieve these. One machine — an M2 Pro laptop, 16 GB, on mains power. TeX Live 2025, pinned. Cold means an empty cache and a cleared distribution; warm means the second build of the same document; save means the time from ⌘S to the corrected page appearing, which is the only one of the three a person actually experiences. The corpus is twelve public documents, and the six below are the ones we quote because they are the ones that hurt.",
  corpus: [
    {
      name: "PhD thesis",
      detail: "182 pp · 41 figures · biblatex + index",
      cold: "41.2 s",
      warm: "6.8 s",
      save: "0.91 s",
      weight: { cold: 0.43, warm: 0.47, save: 0.57 },
    },
    {
      name: "Two-column conference paper",
      detail: "11 pp · 6 figures · natbib",
      cold: "4.9 s",
      warm: "1.2 s",
      save: "0.21 s",
      weight: { cold: 0.05, warm: 0.08, save: 0.13 },
    },
    {
      name: "Book with an index",
      detail: "320 pp · makeindex · 12 chapters",
      cold: "96.4 s",
      warm: "14.4 s",
      save: "1.62 s",
      weight: { cold: 1, warm: 1, save: 1 },
    },
    {
      name: "Lecture notes, TikZ-heavy",
      detail: "88 pp · 214 inline diagrams",
      cold: "74.1 s",
      warm: "9.1 s",
      save: "1.08 s",
      weight: { cold: 0.77, warm: 0.63, save: 0.67 },
    },
    {
      name: "Beamer deck",
      detail: "64 slides · overlays",
      cold: "12.7 s",
      warm: "2.9 s",
      save: "0.44 s",
      weight: { cold: 0.13, warm: 0.2, save: 0.27 },
    },
    {
      name: "A CV",
      detail: "2 pp · one class file",
      cold: "1.6 s",
      warm: "0.4 s",
      save: "0.12 s",
      weight: { cold: 0.02, warm: 0.03, save: 0.07 },
    },
  ] satisfies Benchmark[],
  metrics: [
    {
      label: "Saves that never reach the engine",
      value: "37%",
      note: "Edits to comments, whitespace or a file the target does not read. The fastest build is the one that is not run.",
    },
    {
      label: "Cache hit rate",
      value: "0.88",
      note: "Across a working day on the thesis. Standalone figures account for most of it, and they are the expensive part.",
    },
    {
      label: "Settled in two passes",
      value: "79%",
      note: "How often the auxiliary files stop moving after one rerun. The rest genuinely needed the third pass.",
    },
    {
      label: "Stale outputs served",
      value: "0",
      note: "Since the March rewrite. Under timestamps it was not zero, which is why there was a rewrite.",
    },
    {
      label: "Median parse, per keystroke",
      value: "4 ms",
      note: "6,000-line chapter. The budget everything interactive is held to.",
    },
    {
      label: "Log lines shown to you",
      value: "2 of 2,900",
      note: "A clean build of the thesis. The other 2,898 are still there if you want them.",
    },
  ] satisfies Metric[],
}

// Section 09 — the scope, stated as a specification rather than a disclaimer.
export const limits: Entry[] = [
  {
    term: "It is not a TeX engine",
    body: "Nothing here typesets anything. Every page is set by pdfTeX, XeTeX, LuaTeX or Tectonic exactly as it would be from a shell, and a document that renders wrong renders wrong identically in both.",
  },
  {
    term: "It is not WYSIWYG",
    body: "The source is the document. Math renders under the caret and the preview sits alongside, but nothing in this editor writes LaTeX on your behalf or reformats what you wrote.",
  },
  {
    term: "It cannot fix your packages",
    body: "A package that breaks under XeTeX still breaks. The pipeline can tell you which build the breakage arrived in and pin the version that worked, which is help, but it is not a fix.",
  },
  {
    term: "It is not collaborative",
    body: "One machine, local files, your own version control. Multi-user editing is a different project with a different hard part, and pretending otherwise would compromise the part we care about.",
  },
  {
    term: "It does not read your prose",
    body: "No grammar checking, no phrasing suggestions, no generated text. The document is yours; the tooling is about getting it built.",
  },
  {
    term: "Windows support is behind",
    body: "The sandbox is built on Linux and macOS process isolation. Windows runs today without the sandbox, which means without the reproducibility guarantee the cache depends on.",
  },
]

export const glossary: Entry[] = [
  {
    term: "Engine",
    body: "The program that turns TeX source into pages — pdfTeX, XeTeX, LuaTeX, or Tectonic. LaTeX is not an engine; it is a large set of macros that any of them can run.",
  },
  {
    term: "Pass",
    body: "One complete run of the engine over the document. Cross-references need at least two, because the first one is what writes down where everything ended up.",
  },
  {
    term: ".aux",
    body: "The auxiliary file a pass writes and the next pass reads: labels, page numbers, citation keys. When it stops changing between passes, the document has settled.",
  },
  {
    term: "SyncTeX",
    body: "A position map emitted alongside the PDF, tying each box on the page back to the source line that produced it. The reason clicking a page can move the caret.",
  },
  {
    term: "Overfull hbox",
    body: "A line TeX could not break within the margin, so it let it run over. Reported in points of overflow, and the most common warning in any real document.",
  },
  {
    term: "Tectonic",
    body: "A modern redistribution of the TeX engine that fetches only the packages a document needs. The reason a reproducible sandbox is practical rather than a 6 GB proposition.",
  },
  {
    term: "Content-addressed",
    body: "Keyed by a hash of the bytes rather than by name or timestamp. Two builds with the same inputs are the same build, and can share an answer.",
  },
]

export const references: Reference[] = [
  {
    label: "Knuth, The TeXbook (1984)",
    detail:
      "Still the specification. Chapter 27, on error messages, explains why the log reads the way it does better than any complaint about it.",
  },
  {
    label: "source2e — the LaTeX2e kernel, documented",
    detail:
      "The commented source of everything \\documentclass sets up. Most of the diagnostic rules started as a page of this.",
  },
  {
    label: "SyncTeX, Laurens (2008)",
    detail: "The format and the algorithm behind forward and inverse search.",
  },
  {
    label: "tree-sitter-latex",
    detail:
      "The incremental grammar the document model is built on, with local changes for macro definitions.",
  },
  {
    label: "texlab",
    detail:
      "A LaTeX language server that got there first. We read it before writing the resolver, and it is why several things here are shaped sensibly.",
  },
]

// The name, addressed once and left alone. It belongs in the appendix rather
// than the hero: it is a footnote about a word, not the point of the page.
export const name = {
  body: "TeX is Knuth's, and has been since 1978. Naming an editor after the thing it drives is a liberty, and we took it because the alternative was another portmanteau with a silent vowel. It is pronounced the way the original is — the X is a Greek chi, so it ends like the Scottish loch, not like a box.",
  note: "Everywhere on this page, TeX in the running text means the editor. Where the engine is meant, it is named: pdfTeX, XeTeX, LuaTeX, Tectonic.",
}
