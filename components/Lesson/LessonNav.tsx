import Link from "next/link";

interface LessonNavProps {
  courseId: string;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

/**
 * LessonNav — Previous/Next lesson navigation cards at the bottom of a lesson.
 * Glass cards with hover lift effect.
 */
export default function LessonNav({ courseId, prev, next }: LessonNavProps) {
  return (
    <div className="lesson-nav">
      {prev ? (
        <Link
          href={`/${courseId}/${prev.slug}`}
          className="lesson-nav__card lesson-nav__card--prev glass"
        >
          <span className="lesson-nav__label">← Previous</span>
          <span className="lesson-nav__title">{prev.title}</span>
        </Link>
      ) : (
        <div /> /* spacer */
      )}

      {next ? (
        <Link
          href={`/${courseId}/${next.slug}`}
          className="lesson-nav__card lesson-nav__card--next glass"
        >
          <span className="lesson-nav__label">Next →</span>
          <span className="lesson-nav__title">{next.title}</span>
        </Link>
      ) : (
        <div /> /* spacer */
      )}
    </div>
  );
}
