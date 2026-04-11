"use client";

import { useEffect, useRef } from "react";

interface ProseProps {
  html: string;
}

/**
 * Prose — Client component that renders markdown HTML and enhances it:
 * - Adds copy buttons + language labels to code blocks
 * - Initializes Mermaid diagrams
 */
export default function Prose({ html }: ProseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Add copy buttons and language labels to all code blocks
    const preElements = containerRef.current.querySelectorAll("pre");
    preElements.forEach((pre) => {
      // Skip output blocks and mermaid blocks
      if (
        pre.getAttribute("data-cw-output") === "true" ||
        pre.classList.contains("mermaid")
      ) {
        return;
      }

      // Already enhanced
      if (pre.querySelector(".code-header")) return;

      const codeEl = pre.querySelector("code");
      if (!codeEl) return;

      // Detect language from class or shiki data
      const lang = detectLanguage(codeEl);

      // Create header bar
      const header = document.createElement("div");
      header.className = "code-header";

      // Language label
      const langLabel = document.createElement("span");
      langLabel.className = "code-lang";
      langLabel.textContent = lang.toUpperCase();
      header.appendChild(langLabel);

      // Copy button
      const copyBtn = document.createElement("button");
      copyBtn.className = "code-copy";
      copyBtn.textContent = "Copy";
      copyBtn.setAttribute("aria-label", "Copy code to clipboard");
      copyBtn.addEventListener("click", () => {
        const text = codeEl.textContent || "";
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = "✓ Copied";
          copyBtn.classList.add("code-copy--done");
          setTimeout(() => {
            copyBtn.textContent = "Copy";
            copyBtn.classList.remove("code-copy--done");
          }, 1500);
        });
      });
      header.appendChild(copyBtn);

      // Insert header before the code
      pre.insertBefore(header, pre.firstChild);
      pre.classList.add("code-block--enhanced");
    });

    // Initialize Mermaid diagrams
    const mermaidBlocks = containerRef.current.querySelectorAll(
      '[data-cw-section="mermaid"]'
    );
    if (mermaidBlocks.length > 0) {
      import("mermaid").then((mod) => {
        mod.default.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains("dark")
            ? "dark"
            : "default",
          securityLevel: "loose",
        });
        mermaidBlocks.forEach(async (block, idx) => {
          const pre = block.querySelector("pre.mermaid");
          if (!pre) return;
          const code = pre.textContent || "";
          try {
            const { svg } = await mod.default.render(`mermaid-${idx}`, code);
            block.innerHTML = svg;
            block.classList.add("mermaid--rendered");
          } catch {
            // Leave the raw code visible on error
          }
        });
      });
    }
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="prose-column"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function detectLanguage(codeEl: Element): string {
  // Check the code element's classes
  for (const cls of Array.from(codeEl.classList)) {
    if (cls.startsWith("language-")) {
      return cls.replace("language-", "");
    }
  }

  // Check parent pre element's classes (Shiki puts language here)
  const preParent = codeEl.closest("pre");
  if (preParent) {
    for (const cls of Array.from(preParent.classList)) {
      if (cls.startsWith("language-")) {
        return cls.replace("language-", "");
      }
    }
    // Check data-language attribute
    const dataLang = preParent.getAttribute("data-language");
    if (dataLang) return dataLang;
  }

  // Check .shiki wrapper's classes
  const shikiEl = codeEl.closest(".shiki");
  if (shikiEl) {
    for (const cls of Array.from(shikiEl.classList)) {
      if (cls.startsWith("language-")) {
        return cls.replace("language-", "");
      }
    }
  }

  return "code";
}
