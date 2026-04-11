import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import type { LessonFrontmatter } from "./courses";
import { LIGHT_THEME, DARK_THEME } from "./shiki";
import type { Root, Element, ElementContent } from "hast";
import type { Transformer } from "unified";

// ───────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────

export interface ParsedLesson {
  /** Parsed frontmatter */
  frontmatter: LessonFrontmatter;
  /** Rendered HTML string */
  contentHtml: string;
  /** Table of contents extracted from H2 headings */
  toc: TocEntry[];
}

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

// ───────────────────────────────────────────────────
// Main Pipeline
// ───────────────────────────────────────────────────

/**
 * Parse a raw markdown string into frontmatter + rendered HTML + TOC.
 *
 * Pipeline:
 * 1. Extract frontmatter with gray-matter
 * 2. Parse markdown to AST (remark)
 * 3. Convert to HTML AST (rehype)
 * 4. Add IDs to headings (rehype-slug)
 * 5. Apply Shiki syntax highlighting (dual theme)
 * 6. Wrap special sections (LearnBox, MistakeCard, OutputBlock)
 * 7. Extract TOC from H2 headings
 * 8. Serialize to HTML string
 */
export async function parseLesson(rawMarkdown: string): Promise<ParsedLesson> {
  // 1. Extract frontmatter
  const { data, content } = matter(rawMarkdown);
  const frontmatter = data as LessonFrontmatter;

  // 2-8. Process markdown → HTML
  const toc: TocEntry[] = [];

  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeShiki, {
      themes: {
        light: LIGHT_THEME,
        dark: DARK_THEME,
      },
      defaultColor: false,
    })
    .use(rehypeCodewiseSections)
    .use(rehypeExtractToc, { toc })
    .use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(content);
  const contentHtml = result.toString();

  return {
    frontmatter,
    contentHtml,
    toc,
  };
}

// ───────────────────────────────────────────────────
// Custom Rehype Plugin: Codewise Section Wrappers
// ───────────────────────────────────────────────────

/**
 * Wraps special sections in semantic divs with data attributes:
 *
 * - `## What You'll Learn` → <div data-cw-section="learn-box">
 * - `## Common Mistakes`   → <div data-cw-section="mistake-card">
 * - `### Expected Output`  → <div data-cw-section="output-block">
 * - Mermaid code blocks    → <div data-cw-section="mermaid">
 */
function rehypeCodewiseSections(): Transformer<Root, Root> {
  return (tree: Root) => {
    const children = tree.children as ElementContent[];
    const newChildren: ElementContent[] = [];
    let i = 0;

    while (i < children.length) {
      const node = children[i];

      // Check for H2 headings
      if (isElement(node, "h2")) {
        const text = getTextContent(node).toLowerCase().trim();

        if (text.includes("what you'll learn") || text.includes("what you will learn")) {
          // Collect everything until the next H2
          const section = collectUntilNextHeading(children, i, 2);
          newChildren.push(wrapSection(section.nodes, "learn-box"));
          i = section.endIndex;
          continue;
        }

        if (text.includes("common mistakes")) {
          const section = collectUntilNextHeading(children, i, 2);
          newChildren.push(wrapSection(section.nodes, "mistake-card"));
          i = section.endIndex;
          continue;
        }
      }

      // Check for H3 "Expected Output" followed by a code block
      if (isElement(node, "h3")) {
        const text = getTextContent(node).toLowerCase().trim();

        if (text.includes("expected output")) {
          // Grab the heading + the next code block (if present)
          const outputNodes: ElementContent[] = [node];
          let j = i + 1;
          while (j < children.length) {
            const next = children[j];
            if (isElement(next, "pre")) {
              // Mark this pre as an output block (no copy button)
              outputNodes.push(markAsOutput(next));
              j++;
              break;
            } else if (isElement(next, "h2") || isElement(next, "h3")) {
              break;
            } else {
              outputNodes.push(next);
              j++;
            }
          }
          newChildren.push(wrapSection(outputNodes, "output-block"));
          i = j;
          continue;
        }
      }

      // Check for Mermaid code blocks
      if (isElement(node, "pre")) {
        const codeEl = node.children?.find(
          (c): c is Element => isElement(c, "code")
        );
        if (codeEl) {
          const lang = getCodeLanguage(codeEl);
          if (lang === "mermaid") {
            const mermaidCode = getTextContent(codeEl);
            newChildren.push(createMermaidBlock(mermaidCode));
            i++;
            continue;
          }
        }
      }

      newChildren.push(node);
      i++;
    }

    tree.children = newChildren;
  };
}

// ───────────────────────────────────────────────────
// Custom Rehype Plugin: Extract TOC
// ───────────────────────────────────────────────────

function rehypeExtractToc(
  options: { toc: TocEntry[] }
): Transformer<Root, Root> {
  return (tree: Root) => {
    for (const node of tree.children) {
      if (isElement(node, "h2") || isElement(node, "h3")) {
        const id =
          (node.properties?.id as string) || "";
        const text = getTextContent(node);
        const level = node.tagName === "h2" ? 2 : 3;

        if (id && text) {
          options.toc.push({ id, text, level });
        }
      }

      // Also check inside wrapper divs we created
      if (isElement(node, "div")) {
        extractTocFromDiv(node, options.toc);
      }
    }
  };
}

function extractTocFromDiv(el: Element, toc: TocEntry[]) {
  for (const child of el.children) {
    if (isElement(child, "h2") || isElement(child, "h3")) {
      const id = (child.properties?.id as string) || "";
      const text = getTextContent(child);
      const level = child.tagName === "h2" ? 2 : 3;
      if (id && text) {
        toc.push({ id, text, level });
      }
    }
  }
}

// ───────────────────────────────────────────────────
// AST Helpers
// ───────────────────────────────────────────────────

function isElement(node: unknown, tagName?: string): node is Element {
  const el = node as Element;
  if (el?.type !== "element") return false;
  if (tagName && el.tagName !== tagName) return false;
  return true;
}

function getTextContent(node: Element | ElementContent): string {
  if ("value" in node && typeof (node as { value?: string }).value === "string") {
    return (node as { value: string }).value;
  }
  if ("children" in node && Array.isArray((node as Element).children)) {
    return (node as Element).children.map((c) => getTextContent(c)).join("");
  }
  return "";
}

function getCodeLanguage(codeEl: Element): string {
  const className = codeEl.properties?.className;
  if (Array.isArray(className)) {
    for (const cls of className) {
      if (typeof cls === "string" && cls.startsWith("language-")) {
        return cls.replace("language-", "");
      }
    }
  }
  return "";
}

/**
 * Collect nodes from startIndex (inclusive) until the next heading of
 * the same or lower level.
 */
function collectUntilNextHeading(
  children: ElementContent[],
  startIndex: number,
  headingLevel: number
): { nodes: ElementContent[]; endIndex: number } {
  const nodes: ElementContent[] = [children[startIndex]];
  let j = startIndex + 1;

  while (j < children.length) {
    const node = children[j];
    // Stop at same or higher-level heading
    if (
      isElement(node, "h1") ||
      (headingLevel <= 2 && isElement(node, "h2")) ||
      (headingLevel <= 3 && isElement(node, "h3") && j !== startIndex + 1)
    ) {
      // Don't stop at the very next H3 if we're collecting H2 section
      if (headingLevel === 2 && isElement(node, "h2")) break;
      if (headingLevel === 2 && isElement(node, "h3")) {
        // Include H3s within H2 sections
        nodes.push(node);
        j++;
        continue;
      }
      break;
    }
    nodes.push(node);
    j++;
  }

  return { nodes, endIndex: j };
}

function wrapSection(
  nodes: ElementContent[],
  sectionType: string
): Element {
  return {
    type: "element",
    tagName: "div",
    properties: { "data-cw-section": sectionType },
    children: nodes,
  };
}

function markAsOutput(preEl: Element): Element {
  return {
    ...preEl,
    properties: {
      ...preEl.properties,
      "data-cw-output": "true",
    },
  };
}

function createMermaidBlock(code: string): Element {
  return {
    type: "element",
    tagName: "div",
    properties: {
      "data-cw-section": "mermaid",
      "data-mermaid-code": code,
    },
    children: [
      {
        type: "element",
        tagName: "pre",
        properties: { className: ["mermaid"] },
        children: [{ type: "text", value: code }],
      },
    ],
  };
}
