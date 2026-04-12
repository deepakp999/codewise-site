import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllCourseIds,
  getAllLessonSlugs,
  getLessonMarkdown,
  getLessonNav,
  getCourseMeta,
} from "@/lib/courses";
import { parseLesson } from "@/lib/markdown";
import { lessonJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import Prose from "@/components/Content/Prose";
import TableOfContents from "@/components/Lesson/TableOfContents";
import LessonNav from "@/components/Lesson/LessonNav";

// ─── Static Params ──────────────────────────────────

export async function generateStaticParams() {
  const courseIds = getAllCourseIds();
  const params: { course: string; slug: string }[] = [];

  for (const courseId of courseIds) {
    const slugs = getAllLessonSlugs(courseId);
    for (const slug of slugs) {
      params.push({ course: courseId, slug });
    }
  }

  return params;
}

// ─── Metadata ───────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string; slug: string }>;
}): Promise<Metadata> {
  const { course, slug } = await params;
  const rawMd = getLessonMarkdown(course, slug);
  if (!rawMd) return { title: "Not Found" };

  const { frontmatter } = await parseLesson(rawMd);
  const meta = getCourseMeta(course);

  return {
    title: `${frontmatter.title} — ${meta.title}`,
    description: frontmatter.description,
    keywords: frontmatter.tags,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: "article",
      url: `/${course}/${slug}`,
    },
  };
}

// ─── Page Component ─────────────────────────────────

interface LessonPageProps {
  params: Promise<{ course: string; slug: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { course, slug } = await params;

  // Get raw markdown
  const rawMd = getLessonMarkdown(course, slug);
  if (!rawMd) notFound();

  // Parse and render
  const { frontmatter, contentHtml, toc } = await parseLesson(rawMd);

  // Get prev/next for navigation
  const nav = getLessonNav(course, slug);

  // Get course title
  const courseMeta = getCourseMeta(course);

  // JSON-LD structured data
  const jsonLd = lessonJsonLd({
    title: frontmatter.title,
    description: frontmatter.description,
    courseId: course,
    slug,
    courseTitle: courseMeta.title,
  });
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Codewise", url: "/" },
    { name: courseMeta.title, url: `/${course}` },
    { name: frontmatter.title, url: `/${course}/${slug}` },
  ]);

  return (
    <main className="lesson-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {/* Article content */}
      <article className="lesson-article" data-pagefind-body>
        {/* Lesson header */}
        <header className="lesson-header">
          <div className="lesson-header__breadcrumb">
            <span className="lesson-header__course">{courseMeta.title}</span>
            <span className="lesson-header__sep">/</span>
            <span className="lesson-header__module">
              {frontmatter.module_title}
            </span>
          </div>
          <h1 className="lesson-header__title">{frontmatter.title}</h1>
          <p className="lesson-header__description">
            {frontmatter.description}
          </p>
        </header>

        {/* Rendered markdown */}
        <Prose html={contentHtml} />


        {/* Prev/Next navigation */}
        <LessonNav courseId={course} prev={nav.prev} next={nav.next} />
      </article>

      {/* Desktop TOC */}
      <aside className="lesson-toc">
        <TableOfContents entries={toc} />
      </aside>
    </main>
  );
}
