import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCourseIds,
  getCourse,
  getCourseMeta,
} from "@/lib/courses";
import { courseJsonLd, breadcrumbJsonLd } from "@/lib/seo";

// ─── Static Params ──────────────────────────────────

export async function generateStaticParams() {
  return getAllCourseIds().map((id) => ({ course: id }));
}

// ─── Metadata ───────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string }>;
}): Promise<Metadata> {
  const { course } = await params;
  const info = getCourse(course);
  if (!info) return { title: "Not Found" };

  return {
    title: `${info.title} — CodewiseX`,
    description: info.description,
    alternates: {
      canonical: `/${course}`,
    },
    openGraph: {
      title: info.title,
      description: info.description,
      type: "website",
      url: `/${course}`,
    },
  };
}

// ─── Page Component ─────────────────────────────────

interface CoursePageProps {
  params: Promise<{ course: string }>;
}

export default async function CourseLandingPage({ params }: CoursePageProps) {
  const { course } = await params;

  const info = getCourse(course);
  if (!info || info.status !== "active") notFound();

  const meta = getCourseMeta(course);
  const totalLessons = meta.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );

  const jsonLd = courseJsonLd({
    title: meta.title,
    description: meta.description,
    courseId: course,
  });
  const breadcrumbs = breadcrumbJsonLd([
    { name: "CodewiseX", url: "/" },
    { name: meta.title, url: `/${course}` },
  ]);

  return (
    <main className="course-landing" data-pagefind-body>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {/* Hero Section */}
      <header className="course-hero">
        <div className="course-hero__inner">
          <div className="course-hero__badge">
            {info.tags.map((tag) => (
              <span key={tag} className="course-hero__tag">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="course-hero__title">{meta.title}</h1>
          <p className="course-hero__desc">{meta.description}</p>
          <div className="course-hero__stats">
            <span className="course-hero__stat">
              <strong>{meta.modules.length}</strong> module{meta.modules.length !== 1 ? "s" : ""}
            </span>
            <span className="course-hero__dot">·</span>
            <span className="course-hero__stat">
              <strong>{totalLessons}</strong> lesson{totalLessons !== 1 ? "s" : ""}
            </span>
            <span className="course-hero__dot">·</span>
            <span className="course-hero__stat">
              <strong>Free</strong> forever
            </span>
          </div>
          <Link
            href={`/${course}/${meta.modules[0]?.lessons[0]?.slug || ""}`}
            className="course-hero__cta"
          >
            Start Learning →
          </Link>
        </div>
      </header>

      {/* Curriculum */}
      <section className="course-curriculum">
        <h2 className="course-curriculum__heading">Curriculum</h2>

        {meta.modules.map((mod, modIdx) => (
          <div key={mod.id} className="course-module glass">
            <div className="course-module__header">
              <span className="course-module__number">
                Module {modIdx + 1}
              </span>
              <h3 className="course-module__title">{mod.title}</h3>
              <span className="course-module__count">
                {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
              </span>
            </div>

            <ul className="course-module__lessons">
              {mod.lessons.map((lesson, lesIdx) => (
                <li key={lesson.slug}>
                  <Link
                    href={`/${course}/${lesson.slug}`}
                    className="course-lesson-link"
                  >
                    <span className="course-lesson-link__num">
                      {String(lesIdx + 1).padStart(2, "0")}
                    </span>
                    <span className="course-lesson-link__title">
                      {lesson.title}
                    </span>
                    <span className="course-lesson-link__arrow">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
