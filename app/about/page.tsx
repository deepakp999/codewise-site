import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CodewiseX",
  description:
    "CodewiseX by Lumivoxx offers free, in-depth technical courses with clear explanations, real code, and practical exercises.",
};

export default function AboutPage() {
  return (
    <main className="catalog" data-pagefind-body>
      <section className="catalog-hero" style={{ paddingBottom: "24px" }}>
        <h1 className="catalog-hero__title">
          About <span className="catalog-hero__accent">Code</span>wiseX
        </h1>
      </section>

      <article
        className="prose-column"
        style={{ maxWidth: "640px", margin: "0 auto" }}
      >
        <h2>Why CodewiseX?</h2>
        <p>
          Most technical tutorials are either too shallow (just copy this code)
          or too academic (here&apos;s a 40-page paper). CodewiseX sits in
          between — we explain <strong>why</strong> things work, show you
          real code, and warn you about the mistakes everyone makes.
        </p>

        <h2>What makes us different</h2>
        <ul>
          <li>
            <strong>Written for humans:</strong> Clear explanations, not
            documentation rewrites.
          </li>
          <li>
            <strong>Real code examples:</strong> Every concept demonstrated with
            runnable code you can copy.
          </li>
          <li>
            <strong>Common mistakes sections:</strong> Learn what not to do
            before you hit production.
          </li>
          <li>
            <strong>100% free, forever:</strong> No paywall, no sign-up wall.
            Supported by unobtrusive ads.
          </li>
        </ul>

        <h2>Who&apos;s behind this?</h2>
        <p>
          CodewiseX is built by a solo developer and data engineer who got tired
          of bad tutorials. Every lesson is written from real-world experience
          building data pipelines and backend systems.
        </p>

        <h2>Contact</h2>
        <p>
          Got a question, suggestion, or just want to say hi? Reach out at{" "}
          <a
            href="mailto:hey@lumivoxx.com"
            style={{ color: "var(--cw-accent)", textDecoration: "underline" }}
          >
            hey@lumivoxx.com
          </a>
        </p>
      </article>
    </main>
  );
}
