"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface SidebarContextValue {
  /** Whether the mobile sidebar drawer is open */
  isOpen: boolean;
  /** Toggle the mobile drawer */
  toggle: () => void;
  /** Close the drawer */
  close: () => void;
  /** Whether a sidebar is currently registered (i.e. we're on a course page) */
  hasSidebar: boolean;
  /** Called by Sidebar on mount/unmount to register presence */
  registerSidebar: () => () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
  hasSidebar: false,
  registerSidebar: () => () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSidebar, setHasSidebar] = useState(false);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const close = useCallback(() => setIsOpen(false), []);

  const registerSidebar = useCallback(() => {
    setHasSidebar(true);
    return () => setHasSidebar(false);
  }, []);

  // Close drawer on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Close drawer on route change (resize as proxy for now)
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) close();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [close]);

  const value = useMemo(
    () => ({ isOpen, toggle, close, hasSidebar, registerSidebar }),
    [isOpen, toggle, close, hasSidebar, registerSidebar]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
