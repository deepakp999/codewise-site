import type { Metadata } from "next";

const SITE_URL = "https://learn.lumivoxx.com";
const SITE_NAME = "CodewiseX";

/**
 * Generate default site-wide metadata.
 */
export function getDefaultMeta(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — Free Technical Courses`,
      template: `%s | ${SITE_NAME}`,
    },
    description:
      "Free, in-depth technical courses built for clarity. Master PySpark, SAP ABAP, and more with hands-on lessons.",
    keywords: [
      "pyspark tutorial",
      "abap tutorial",
      "sap abap for beginners",
      "learn abap programming",
      "data engineering course",
      "free coding courses",
      "learn spark",
      "sql tutorial",
      "free sap training",
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: SITE_URL,
      title: `${SITE_NAME} — Free Technical Courses`,
      description:
        "Free, in-depth technical courses built for clarity. Master PySpark, SAP ABAP, and more with hands-on lessons.",
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — Free Technical Courses`,
      description:
        "Free, in-depth technical courses built for clarity.",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: SITE_URL,
    },
  };
}

/**
 * Build JSON-LD for a Course page.
 */
export function courseJsonLd(course: {
  title: string;
  description: string;
  courseId: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    url: `${SITE_URL}/${course.courseId}`,
    isAccessibleForFree: true,
    inLanguage: "en",
  };
}

/**
 * Build JSON-LD for a Lesson (Article) page.
 */
export function lessonJsonLd(lesson: {
  title: string;
  description: string;
  courseId: string;
  slug: string;
  courseTitle: string;
  date?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: lesson.title,
    description: lesson.description,
    url: `${SITE_URL}/${lesson.courseId}/${lesson.slug}`,
    ...(lesson.date && {
      datePublished: lesson.date,
      dateModified: lesson.date,
    }),
    isPartOf: {
      "@type": "Course",
      name: lesson.courseTitle,
      url: `${SITE_URL}/${lesson.courseId}`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    isAccessibleForFree: true,
    inLanguage: "en",
  };
}

/**
 * Build JSON-LD for the WebSite (homepage).
 * Enables sitelinks searchbox in Google results.
 */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Free, in-depth technical courses built for clarity. Master PySpark, SAP ABAP, and more.",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * Build JSON-LD for FAQ pages.
 * AI engines cite FAQ structured data directly.
 */
export function faqJsonLd(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Build JSON-LD for breadcrumbs.
 */
export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
