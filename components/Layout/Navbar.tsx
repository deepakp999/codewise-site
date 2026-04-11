"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useSidebar } from "./SidebarContext";
import { SearchTrigger } from "@/components/Search/SearchDialog";
import { useState, useEffect } from "react";

/**
 * Navbar — Sticky glassmorphic top nav.
 *
 * Features:
 * - Glass background with blur
 * - Logo left, nav links center, theme toggle + search right
 * - Hamburger menu: on course pages toggles the sidebar drawer;
 *   on non-course pages opens a simple mobile nav menu
 */
export default function Navbar() {
  const { hasSidebar, toggle, isOpen } = useSidebar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when window resizes past mobile breakpoint
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleHamburgerClick = () => {
    if (hasSidebar) {
      // On course pages, toggle the sidebar drawer
      toggle();
      setMobileMenuOpen(false);
    } else {
      // On non-course pages, toggle the mobile nav menu
      setMobileMenuOpen((v) => !v);
    }
  };

  const menuIsOpen = hasSidebar ? isOpen : mobileMenuOpen;

  return (
    <>
      <header className="navbar glass" role="banner">
        <div className="navbar__inner">
          {/* Left: Hamburger + Logo */}
          <div className="navbar__left">
            <button
              className="navbar__hamburger"
              onClick={handleHamburgerClick}
              aria-label={menuIsOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuIsOpen}
            >
              <span className={`navbar__hamburger-line ${menuIsOpen ? "navbar__hamburger-line--open" : ""}`} />
              <span className={`navbar__hamburger-line ${menuIsOpen ? "navbar__hamburger-line--open" : ""}`} />
              <span className={`navbar__hamburger-line ${menuIsOpen ? "navbar__hamburger-line--open" : ""}`} />
            </button>

            <Link href="/" className="navbar__logo" aria-label="Codewise Home">
              <span className="navbar__logo-accent">Code</span>wise
            </Link>
          </div>

          {/* Center: Nav links (desktop only) */}
          <nav className="navbar__nav" aria-label="Main navigation">
            <Link href="/" className="navbar__link">
              Courses
            </Link>
            <Link href="/about" className="navbar__link">
              About
            </Link>
          </nav>

          {/* Right: Search + Theme toggle */}
          <div className="navbar__right">
            <SearchTrigger />

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile navigation menu (non-course pages only) */}
      {!hasSidebar && mobileMenuOpen && (
        <>
          <div
            className="sidebar-overlay"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
            style={{ display: "block" }}
          />
          <nav className="mobile-nav-menu" aria-label="Mobile navigation">
            <Link
              href="/"
              className="mobile-nav-menu__link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </Link>
            <Link
              href="/about"
              className="mobile-nav-menu__link"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <a
              href="mailto:hey@lumivoxx.com"
              className="mobile-nav-menu__link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </a>
          </nav>
        </>
      )}
    </>
  );
}
