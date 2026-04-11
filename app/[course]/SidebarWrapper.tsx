"use client";

import Sidebar from "@/components/Layout/Sidebar";
import { usePathname } from "next/navigation";

interface SidebarModule {
  id: string;
  title: string;
  lessons: { slug: string; title: string }[];
}

interface SidebarWrapperProps {
  courseId: string;
  modules: SidebarModule[];
  children: React.ReactNode;
}

/**
 * SidebarWrapper — Client component that renders the Sidebar
 * with the active slug derived from the current URL path.
 */
export default function SidebarWrapper({
  courseId,
  modules,
  children,
}: SidebarWrapperProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  // URL: /pyspark/what-is-spark → activeSlug = "what-is-spark"
  const activeSlug = segments.length >= 2 ? segments[1] : undefined;

  return (
    <>
      <Sidebar
        courseId={courseId}
        modules={modules}
        activeSlug={activeSlug}
      />
      {children}
    </>
  );
}
