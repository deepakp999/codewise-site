import { parseLesson } from "@/lib/markdown";
import { getLessonMarkdown } from "@/lib/courses";

export default async function TestPipelinePage() {
  const rawMd = getLessonMarkdown("pyspark", "what-is-spark");

  if (!rawMd) {
    return (
      <main className="flex-1 p-8">
        <p className="text-red-500">Lesson file not found!</p>
      </main>
    );
  }

  const { frontmatter, contentHtml, toc } = await parseLesson(rawMd);

  return (
    <main className="flex-1 p-8 max-w-4xl mx-auto">
      {/* Frontmatter debug */}
      <div className="glass rounded-xl p-6 mb-8">
        <h2 className="text-base font-semibold mb-3">📋 Frontmatter</h2>
        <pre className="text-xs text-cw-text2 overflow-x-auto">
          <code>{JSON.stringify(frontmatter, null, 2)}</code>
        </pre>
      </div>

      {/* TOC debug */}
      <div className="glass rounded-xl p-6 mb-8">
        <h2 className="text-base font-semibold mb-3">📑 Table of Contents ({toc.length} entries)</h2>
        <ul className="text-sm text-cw-text2 space-y-1">
          {toc.map((entry) => (
            <li key={entry.id} style={{ paddingLeft: (entry.level - 2) * 16 }}>
              <a href={`#${entry.id}`} className="hover:text-cw-accent">
                {entry.level === 3 ? "└ " : ""}
                {entry.text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Rendered HTML */}
      <div className="glass rounded-xl p-6 mb-4">
        <h2 className="text-base font-semibold mb-1">✅ Rendered Content</h2>
        <p className="text-xs text-cw-text3 mb-4">
          Check: Shiki highlighting, OutputBlock wrapper, MistakeCard wrapper, LearnBox wrapper, Mermaid block
        </p>
      </div>

      <article
        className="prose-column mx-auto"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </main>
  );
}
