import Link from "next/link";
import { getAllCourses } from "@/lib/courses";

export default function Home() {
  const courses = getAllCourses();
  const activeCourses = courses.filter((c) => c.status === "active");
  const comingSoon = courses.filter((c) => c.status === "coming-soon");

  return (
    <main className="catalog" data-pagefind-body>
      {/* Hero */}
      <section className="catalog-hero">
        <h1 className="catalog-hero__title">
          <span className="catalog-hero__accent">Code</span>wise
        </h1>
        <p className="catalog-hero__tagline">
          Free, in-depth technical courses — built for clarity.
        </p>
        <p className="catalog-hero__sub">
          No ads wall. No paywall. Just clean explanations, real code, and
          exercises that stick.
        </p>
      </section>

      {/* Active Courses */}
      {activeCourses.length > 0 && (
        <section className="catalog-section">
          <h2 className="catalog-section__heading">Courses</h2>
          <div className="catalog-grid">
            {activeCourses.map((course) => (
              <Link
                key={course.id}
                href={course.href}
                className="course-card glass"
              >
                <div className="course-card__top">
                  <div className="course-card__icon">
                    {getEmojiForCourse(course.id)}
                  </div>
                  <div className="course-card__tags">
                    {course.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="course-card__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="course-card__title">{course.title}</h3>
                <p className="course-card__desc">{course.description}</p>
                <div className="course-card__footer">
                  <span className="course-card__lessons">
                    {course.lessonCount} lessons
                  </span>
                  <span className="course-card__cta">Start →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Coming Soon */}
      {comingSoon.length > 0 && (
        <section className="catalog-section">
          <h2 className="catalog-section__heading">Coming Soon</h2>
          <div className="catalog-grid">
            {comingSoon.map((course) => (
              <div key={course.id} className="course-card course-card--soon glass">
                <div className="course-card__top">
                  <div className="course-card__icon">
                    {getEmojiForCourse(course.id)}
                  </div>
                  <span className="course-card__badge-soon">Coming Soon</span>
                </div>
                <h3 className="course-card__title">{course.title}</h3>
                <p className="course-card__desc">{course.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features Strip */}
      <section className="catalog-features">
        <div className="catalog-feature">
          <span className="catalog-feature__icon">📖</span>
          <div>
            <h3 className="catalog-feature__title">Written for humans</h3>
            <p className="catalog-feature__desc">
              Clear explanations, not documentation rewrites.
            </p>
          </div>
        </div>
        <div className="catalog-feature">
          <span className="catalog-feature__icon">💻</span>
          <div>
            <h3 className="catalog-feature__title">Real code examples</h3>
            <p className="catalog-feature__desc">
              Every concept backed by runnable code you can copy.
            </p>
          </div>
        </div>
        <div className="catalog-feature">
          <span className="catalog-feature__icon">⚠️</span>
          <div>
            <h3 className="catalog-feature__title">Common mistakes</h3>
            <p className="catalog-feature__desc">
              Learn what not to do — before you hit production.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function getEmojiForCourse(id: string): string {
  const map: Record<string, string> = {
    pyspark: "🔥",
    sql: "🗃️",
    python: "🐍",
    kafka: "📡",
    airflow: "🌬️",
  };
  return map[id] || "📚";
}
