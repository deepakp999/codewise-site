"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

/**
 * SearchDialog — Modal fullscreen search powered by Pagefind.
 * Opens when the search icon in the navbar is clicked.
 * Loads Pagefind JS lazily on first open.
 */
export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pagefindRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load Pagefind on first open
  useEffect(() => {
    if (!open || pagefindRef.current) return;

    async function loadPagefind() {
      try {
        // @ts-expect-error — Pagefind is injected at build time
        const pf = await import(/* webpackIgnore: true */ "/pagefind/pagefind.js");
        await pf.init();
        pagefindRef.current = pf;
      } catch {
        // Pagefind not available (dev mode)
        console.warn("Pagefind not loaded — search index only available after build.");
      }
    }

    loadPagefind();
  }, [open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (!pagefindRef.current || !q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await pagefindRef.current.search(q);
      const items: SearchResult[] = [];
      for (const r of searchResults.results.slice(0, 8)) {
        const data = await r.data();
        items.push({
          url: data.url,
          title: data.meta?.title || "Untitled",
          excerpt: data.excerpt || "",
        });
      }
      setResults(items);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  function handleInput(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 200);
  }

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={() => setOpen(false)}>
      <div className="search-dialog glass" onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className="search-input-row">
          <svg
            className="search-input-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search lessons..."
            value={query}
            onChange={(e) => handleInput(e.target.value)}
          />
          <kbd className="search-kbd">ESC</kbd>
        </div>

        {/* Results */}
        <div className="search-results">
          {loading && (
            <div className="search-loading">Searching...</div>
          )}
          {!loading && query && results.length === 0 && (
            <div className="search-empty">No results for &quot;{query}&quot;</div>
          )}
          {results.map((result) => (
            <a
              key={result.url}
              href={result.url}
              className="search-result"
              onClick={() => setOpen(false)}
            >
              <span className="search-result__title">{result.title}</span>
              <span
                className="search-result__excerpt"
                dangerouslySetInnerHTML={{ __html: result.excerpt }}
              />
            </a>
          ))}
          {!query && !loading && (
            <div className="search-hint">
              Type to search across all lessons and courses.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * SearchTrigger — The search icon button that opens the dialog.
 */
export function SearchTrigger() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function handleClick() {
    // Dispatch Ctrl+K to trigger the dialog
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="nav__icon-btn"
        aria-label="Search"
        title="Search (Ctrl+K)"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {/* Render dialog alongside trigger */}
      {mounted && <SearchDialog />}
    </>
  );
}
