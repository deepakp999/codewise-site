import { getCourseMeta } from "@/lib/courses";
import SidebarWrapper from "./SidebarWrapper";

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ course: string }>;
}

/**
 * Course layout — wraps all /[course]/* pages with the sidebar.
 * Reads module data at build time and passes it to the client sidebar.
 */
export default async function CourseLayout({
  children,
  params,
}: CourseLayoutProps) {
  const { course } = await params;

  let modules: { id: string; title: string; lessons: { slug: string; title: string }[] }[] = [];
  try {
    const meta = getCourseMeta(course);
    modules = meta.modules.map((m) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map((l) => ({ slug: l.slug, title: l.title })),
    }));
  } catch {
    // Course not found — no sidebar
  }

  return (
    <SidebarWrapper courseId={course} modules={modules}>
      {children}
    </SidebarWrapper>
  );
}
