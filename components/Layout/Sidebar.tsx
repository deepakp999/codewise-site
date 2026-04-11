"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSidebar } from "./SidebarContext";

export interface SidebarLesson {
  slug: string;
  title: string;
}

export interface SidebarModule {
  id: string;
  title: string;
  lessons: SidebarLesson[];
}

export interface SidebarProps {
  /** Course ID used for building URLs (e.g. "pyspark") */
  courseId: string;
  /** Modules with their lessons */
  modules: SidebarModule[];
  /** Currently active lesson slug (e.g. "what-is-spark") */
  activeSlug?: string;
}

/**
 * Sidebar — Course lesson navigation.
 *
 * Desktop: Sticky sidebar, scrolls independently.
 * Mobile: Slide-out drawer from the left, controlled via SidebarContext.
 *
 * Visual states per lesson:
 * - Default: gray dot
 * - Active: blue glowing dot + blue left bar accent
 */
export default function Sidebar({ courseId, modules, activeSlug }: SidebarProps) {
  const { isOpen, close, registerSidebar } = useSidebar();

  // Register with context so Navbar shows the hamburger
  useEffect(() => {
    const unregister = registerSidebar();
    return unregister;
  }, [registerSidebar]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar glass ${isOpen ? "sidebar--open" : ""}`}
        role="navigation"
        aria-label="Course lessons"
      >
        {/* Sidebar header */}
        <div className="sidebar__header">
          <Link
            href={`/${courseId}`}
            className="sidebar__course-title"
            onClick={close}
          >
            ← Course Overview
          </Link>
        </div>

        {/* Module / Lesson list */}
        <nav className="sidebar__nav">
          {modules.map((mod) => (
            <div key={mod.id} className="sidebar__module">
              <h3 className="sidebar__module-title">{mod.title}</h3>
              <ul className="sidebar__lesson-list">
                {mod.lessons.map((lesson) => {
                  const isActive = lesson.slug === activeSlug;
                  return (
                    <li key={lesson.slug}>
                      <Link
                        href={`/${courseId}/${lesson.slug}`}
                        className={`sidebar__lesson ${isActive ? "sidebar__lesson--active" : ""}`}
                        onClick={close}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span
                          className={`sidebar__dot ${isActive ? "sidebar__dot--active" : ""}`}
                          aria-hidden="true"
                        />
                        <span className="sidebar__lesson-title">
                          {lesson.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Site-wide nav links (mobile only) */}
        <div className="sidebar__site-nav">
          <Link href="/" className="sidebar__site-link" onClick={close}>
            All Courses
          </Link>
          <Link href="/about" className="sidebar__site-link" onClick={close}>
            About
          </Link>
          <a href="mailto:hey@lumivoxx.com" className="sidebar__site-link" onClick={close}>
            Contact
          </a>
        </div>
      </aside>
    </>
  );
}
