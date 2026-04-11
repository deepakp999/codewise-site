import type { MetadataRoute } from "next";
import { getAllCourses, getCourseMeta } from "@/lib/courses";

export const dynamic = "force-static";

const SITE_URL = "https://learn.lumivoxx.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Home page
  entries.push({
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  });

  // About page
  entries.push({
    url: `${SITE_URL}/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  });

  // Course pages and lesson pages
  const courses = getAllCourses();
  for (const course of courses) {
    if (course.status !== "active") continue;

    // Course landing page
    entries.push({
      url: `${SITE_URL}/${course.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    });

    // Lesson pages
    const meta = getCourseMeta(course.id);
    for (const mod of meta.modules) {
      for (const lesson of mod.lessons) {
        entries.push({
          url: `${SITE_URL}/${course.id}/${lesson.slug}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.8,
        });
      }
    }
  }

  return entries;
}
