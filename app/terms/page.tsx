import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — CodewiseX",
  description:
    "Terms and conditions for using the CodewiseX educational platform.",
};

export default function TermsPage() {
  return (
    <main className="catalog" data-pagefind-body>
      <section className="catalog-hero" style={{ paddingBottom: "24px" }}>
        <h1 className="catalog-hero__title">Terms of Service</h1>
        <p className="catalog-hero__sub" style={{ maxWidth: "520px" }}>
          Last updated: April 12, 2026
        </p>
      </section>

      <article
        className="prose-column"
        style={{ maxWidth: "640px", margin: "0 auto" }}
      >
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using CodewiseX at{" "}
          <strong>learn.lumivoxx.com</strong> (the &quot;Site&quot;), you
          agree to be bound by these Terms of Service. If you do not agree,
          please do not use the Site.
        </p>

        <h2>Use of Content</h2>
        <p>
          All educational content on CodewiseX — including text, code examples,
          diagrams, and illustrations — is provided for personal, non-commercial
          learning purposes. You may:
        </p>
        <ul>
          <li>Read, study, and learn from the content freely.</li>
          <li>
            Use code examples in your own projects (personal or commercial).
          </li>
          <li>Share links to lessons with others.</li>
        </ul>
        <p>You may not:</p>
        <ul>
          <li>
            Reproduce, republish, or redistribute entire lessons or courses
            without permission.
          </li>
          <li>
            Scrape or bulk-download content for redistribution or training
            datasets.
          </li>
          <li>
            Present CodewiseX content as your own original work.
          </li>
        </ul>

        <h2>Accuracy of Information</h2>
        <p>
          We strive to ensure all content is accurate and up to date. However,
          technology evolves rapidly, and we make no guarantees that all
          information is current or error-free. Content is provided{" "}
          <strong>&quot;as is&quot;</strong> without warranties of any kind.
        </p>

        <h2>Advertisements</h2>
        <p>
          CodewiseX displays advertisements through Google AdSense to support
          free access to all content. By using the Site, you acknowledge that:
        </p>
        <ul>
          <li>Ads may appear on pages throughout the Site.</li>
          <li>
            Ad content is served by third parties and does not represent
            endorsement by CodewiseX.
          </li>
          <li>
            Ad-related cookies may be placed on your device as described in
            our{" "}
            <a
              href="/privacy"
              style={{ color: "var(--cw-accent)", textDecoration: "underline" }}
            >
              Privacy Policy
            </a>
            .
          </li>
        </ul>

        <h2>Intellectual Property</h2>
        <p>
          The CodewiseX name, logo, site design, and original educational
          content are the property of CodewiseX by Lumivoxx. Third-party trademarks (e.g.,
          Apache Spark, Python, PySpark) belong to their respective owners and
          are used for educational reference only.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          CodewiseX is an educational resource. We are not liable for any
          damages arising from your use of the Site or application of concepts
          learned here. This includes, but is not limited to:
        </p>
        <ul>
          <li>Data loss from running code examples.</li>
          <li>Errors in production systems based on tutorial content.</li>
          <li>Career or hiring decisions influenced by our content.</li>
        </ul>

        <h2>Availability</h2>
        <p>
          We aim to keep the Site available at all times but do not guarantee
          uninterrupted access. We may modify, suspend, or discontinue the
          Site at any time without notice.
        </p>

        <h2>Changes to These Terms</h2>
        <p>
          We reserve the right to update these Terms of Service. Changes will be
          posted on this page with an updated date. Continued use of the Site
          after changes constitutes acceptance of the revised terms.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms are governed by applicable laws. Any disputes shall be
          resolved in accordance with those laws.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these Terms? Contact us at{" "}
          <a
            href="mailto:hey@lumivoxx.com"
            style={{ color: "var(--cw-accent)", textDecoration: "underline" }}
          >
            hey@lumivoxx.com
          </a>
          .
        </p>
      </article>
    </main>
  );
}
