import { createHighlighter, type Highlighter } from "shiki";

/**
 * Singleton Shiki highlighter instance.
 *
 * We cache the highlighter since creating it is expensive (loads WASM + themes).
 * Uses dual themes: github-light for light mode, one-dark-pro for dark.
 */
let highlighterPromise: Promise<Highlighter> | null = null;

const LIGHT_THEME = "github-light";
const DARK_THEME = "one-dark-pro";

// Languages we expect in the PySpark course
const PRELOADED_LANGS = [
  "python",
  "bash",
  "shell",
  "sql",
  "json",
  "yaml",
  "toml",
  "javascript",
  "typescript",
  "csv",
  "markdown",
  "text",
  "plaintext",
];

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [LIGHT_THEME, DARK_THEME],
      langs: PRELOADED_LANGS,
    });
  }
  return highlighterPromise;
}

/**
 * Highlight a code string with dual themes (light + dark).
 *
 * Returns HTML that uses CSS `data-theme` attributes for theme switching.
 * The light theme is shown by default; dark is shown when `.dark` class is on <html>.
 */
export async function highlightCode(
  code: string,
  lang: string
): Promise<string> {
  const highlighter = await getHighlighter();

  // Normalize language name
  const normalizedLang = normalizeLang(lang);

  // Use multi-theme HTML output
  const html = highlighter.codeToHtml(code, {
    lang: normalizedLang,
    themes: {
      light: LIGHT_THEME,
      dark: DARK_THEME,
    },
    defaultColor: false,
  });

  return html;
}

function normalizeLang(lang: string): string {
  const map: Record<string, string> = {
    py: "python",
    sh: "bash",
    zsh: "bash",
    console: "bash",
    js: "javascript",
    ts: "typescript",
    yml: "yaml",
    txt: "text",
    "": "text",
  };
  return map[lang.toLowerCase()] ?? lang.toLowerCase();
}

export { LIGHT_THEME, DARK_THEME };
