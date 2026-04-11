import fs from "fs";
import path from "path";

// ───────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────

export interface CourseInfo {
  id: string;
  title: string;
  description: string;
  status: "active" | "coming-soon";
  href: string;
  lessonCount: number;
  tags: string[];
}

export interface LessonRef {
  slug: string;
  title: string;
  file: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: LessonRef[];
}

export interface CourseMeta {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

export interface LessonFrontmatter {
  title: string;
  description: string;
  order: number;
  module: string;
  module_title: string;
  tags: string[];
  prev_slug: string | null;
  next_slug: string | null;
  [key: string]: unknown;
}

// ───────────────────────────────────────────────────
// Paths
// ───────────────────────────────────────────────────

const CONTENT_DIR = path.join(process.cwd(), "content");

// ───────────────────────────────────────────────────
// Course Registry
// ───────────────────────────────────────────────────

/**
 * Read the global course catalog from `content/courses.json`.
 */
export function getAllCourses(): CourseInfo[] {
  const filePath = path.join(CONTENT_DIR, "courses.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as CourseInfo[];
}

/**
 * Get a single course by ID.
 */
export function getCourse(courseId: string): CourseInfo | undefined {
  return getAllCourses().find((c) => c.id === courseId);
}

// ───────────────────────────────────────────────────
// Course Metadata (_meta.json)
// ───────────────────────────────────────────────────

/**
 * Read course metadata (modules + lesson ordering) from
 * `content/{courseId}/_meta.json`.
 */
export function getCourseMeta(courseId: string): CourseMeta {
  const filePath = path.join(CONTENT_DIR, courseId, "_meta.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as CourseMeta;
}

// ───────────────────────────────────────────────────
// Lesson File Reading
// ───────────────────────────────────────────────────

/**
 * Get the raw markdown string for a lesson.
 *
 * Finds the file by matching `{slug}` at the end of filenames like
 * `01-what-is-spark.md` → slug "what-is-spark".
 */
export function getLessonMarkdown(
  courseId: string,
  slug: string
): string | null {
  const courseDir = path.join(CONTENT_DIR, courseId);
  const files = fs.readdirSync(courseDir).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const fileSlug = fileNameToSlug(file);
    if (fileSlug === slug) {
      return fs.readFileSync(path.join(courseDir, file), "utf-8");
    }
  }

  return null;
}

/**
 * Get all lesson slugs for a course (used by generateStaticParams).
 */
export function getAllLessonSlugs(courseId: string): string[] {
  const meta = getCourseMeta(courseId);
  return meta.modules.flatMap((m) => m.lessons.map((l) => l.slug));
}

/**
 * Get all course IDs that have content directories.
 */
export function getAllCourseIds(): string[] {
  return getAllCourses()
    .filter((c) => c.status === "active")
    .map((c) => c.id);
}

/**
 * Find the previous and next lesson slugs for navigation.
 */
export function getLessonNav(
  courseId: string,
  currentSlug: string
): { prev: LessonRef | null; next: LessonRef | null } {
  const meta = getCourseMeta(courseId);
  const allLessons = meta.modules.flatMap((m) => m.lessons);
  const idx = allLessons.findIndex((l) => l.slug === currentSlug);

  return {
    prev: idx > 0 ? allLessons[idx - 1] : null,
    next: idx < allLessons.length - 1 ? allLessons[idx + 1] : null,
  };
}

// ───────────────────────────────────────────────────
// Utilities
// ───────────────────────────────────────────────────

/**
 * Convert a markdown filename to a URL slug.
 * `01-what-is-spark.md` → `what-is-spark`
 */
function fileNameToSlug(filename: string): string {
  return filename
    .replace(/\.md$/, "") // remove .md
    .replace(/^\d+-/, ""); // strip leading number prefix
}
