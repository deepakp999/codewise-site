"use client";

import { TocEntry } from "@/lib/markdown";
import { useEffect, useState } from "react";

interface TableOfContentsProps {
  entries: TocEntry[];
}

/**
 * TableOfContents — Sticky right-side TOC for desktop lesson pages.
 * Highlights the currently visible section using IntersectionObserver.
 */
export default function TableOfContents({ entries }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Observe all headings with TOC IDs
    const headingElements = entries
      .map((e) => document.getElementById(e.id))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (intersections) => {
        // Find the first heading that's currently visible
        for (const entry of intersections) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    headingElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav className="toc" aria-label="Table of contents">
      <h3 className="toc__title">On this page</h3>
      <ul className="toc__list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={`toc__link ${entry.level === 3 ? "toc__link--sub" : ""} ${
                activeId === entry.id ? "toc__link--active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(entry.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                setActiveId(entry.id);
              }}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
