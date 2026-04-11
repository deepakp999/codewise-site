"use client";

import Sidebar from "@/components/Layout/Sidebar";

const DEMO_MODULES = [
  {
    id: "getting-started",
    title: "Getting Started",
    lessons: [
      { slug: "what-is-spark", title: "What is Apache Spark?" },
      { slug: "spark-vs-pandas", title: "Spark vs Pandas" },
      { slug: "installing-pyspark", title: "Installing PySpark" },
      { slug: "first-sparksession", title: "Your First SparkSession" },
      { slug: "understanding-spark-ui", title: "Understanding the Spark UI" },
    ],
  },
  {
    id: "core-concepts",
    title: "Core Concepts",
    lessons: [
      { slug: "rdds-explained", title: "RDDs Explained" },
      { slug: "dataframes-intro", title: "Introduction to DataFrames" },
      { slug: "schemas-and-types", title: "Schemas and Data Types" },
    ],
  },
];

export default function SidebarDemo() {
  return (
    <>
      <Sidebar
        courseId="pyspark"
        modules={DEMO_MODULES}
        activeSlug="spark-vs-pandas"
      />

      <main className="flex-1 p-8 lg:ml-0">
        <div className="prose-column mx-auto">
          <h1>Sidebar + Layout Demo</h1>
          <p className="text-cw-text2 mt-4">
            This page demonstrates the complete layout with the course sidebar.
          </p>

          <div className="glass rounded-xl p-6 mt-8">
            <h2 className="text-base font-semibold mb-3">Sidebar Features</h2>
            <ul className="text-sm text-cw-text2 space-y-2">
              <li>• Module groups with uppercase headers</li>
              <li>• Active lesson: blue left bar + glowing dot</li>
              <li>• Hover states on all items</li>
              <li>• Desktop: sticky, scrolls independently</li>
              <li>• Mobile (&lt;1024px): slide-out drawer from left</li>
              <li>• Hamburger in navbar animates to X</li>
              <li>• Overlay backdrop on mobile</li>
              <li>• Closes on Escape key</li>
            </ul>
          </div>

          <div className="glass rounded-xl p-6 mt-6">
            <h2 className="text-base font-semibold mb-3">Navbar Features</h2>
            <ul className="text-sm text-cw-text2 space-y-2">
              <li>• Glassmorphic blur + sticky positioning</li>
              <li>• Logo with accent color</li>
              <li>• Nav links with hover underline effect</li>
              <li>• Search icon placeholder</li>
              <li>• Theme toggle (sun/moon)</li>
              <li>• Hamburger appears only on mobile course pages</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
