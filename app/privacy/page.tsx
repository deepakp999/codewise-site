import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Codewise",
  description:
    "How Codewise collects, uses, and protects your information. Includes details on cookies, Google AdSense, and your rights.",
};

export default function PrivacyPage() {
  return (
    <main className="catalog" data-pagefind-body>
      <section className="catalog-hero" style={{ paddingBottom: "24px" }}>
        <h1 className="catalog-hero__title">Privacy Policy</h1>
        <p className="catalog-hero__sub" style={{ maxWidth: "520px" }}>
          Last updated: April 12, 2026
        </p>
      </section>

      <article
        className="prose-column"
        style={{ maxWidth: "640px", margin: "0 auto" }}
      >
        <h2>Introduction</h2>
        <p>
          Codewise (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates
          the website{" "}
          <strong>codewise.lumivoxx.com</strong> (the &quot;Site&quot;). This
          Privacy Policy explains how we collect, use, and protect information
          when you visit our Site.
        </p>

        <h2>Information We Collect</h2>
        <h3>Automatically Collected Information</h3>
        <p>When you visit our Site, we may automatically collect:</p>
        <ul>
          <li>
            <strong>Log data:</strong> IP address, browser type, operating
            system, referring URLs, pages viewed, and timestamps.
          </li>
          <li>
            <strong>Cookies and similar technologies:</strong> Small data files
            stored on your device to remember preferences (e.g., light/dark
            theme) and support advertising.
          </li>
        </ul>

        <h3>Information We Do Not Collect</h3>
        <p>
          Codewise does not require user accounts, registration, or sign-ups. We
          do not collect personal information such as names, email addresses, or
          payment details through the Site.
        </p>

        <h2>Cookies</h2>
        <p>Our Site uses cookies for:</p>
        <ul>
          <li>
            <strong>Essential cookies:</strong> Storing your theme preference
            (light or dark mode).
          </li>
          <li>
            <strong>Advertising cookies:</strong> Used by Google AdSense and
            its partners to serve relevant ads and measure ad performance.
          </li>
        </ul>
        <p>
          You can control cookies through your browser settings. Disabling
          cookies may affect certain features of the Site.
        </p>

        <h2>Third-Party Advertising</h2>
        <p>
          We use <strong>Google AdSense</strong> to display advertisements on
          our Site. Google and its advertising partners may use cookies and
          similar technologies to serve ads based on your prior visits to this
          Site or other websites. Specifically:
        </p>
        <ul>
          <li>
            Google&apos;s use of advertising cookies enables it and its partners
            to serve ads based on your visit to our Site and/or other sites on
            the Internet.
          </li>
          <li>
            You may opt out of personalised advertising by visiting{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>
            .
          </li>
          <li>
            You may opt out of third-party vendor cookies by visiting{" "}
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
            >
              aboutads.info
            </a>
            .
          </li>
        </ul>

        <h2>How We Use Information</h2>
        <p>We use the collected information to:</p>
        <ul>
          <li>Operate and maintain the Site.</li>
          <li>Improve content and user experience.</li>
          <li>Display relevant advertisements through Google AdSense.</li>
          <li>Monitor Site usage and performance.</li>
        </ul>

        <h2>Data Sharing</h2>
        <p>
          We do not sell your personal information. Information may be shared
          with:
        </p>
        <ul>
          <li>
            <strong>Google AdSense:</strong> For ad serving and performance
            measurement.
          </li>
          <li>
            <strong>Hosting providers:</strong> To deliver the Site to you.
          </li>
          <li>
            <strong>Law enforcement:</strong> If required by law.
          </li>
        </ul>

        <h2>Data Retention</h2>
        <p>
          Server logs are retained for a limited period for security and
          performance monitoring purposes. Cookies expire according to their
          individual settings — typically ranging from session-based to up to 2
          years.
        </p>

        <h2>Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request deletion of your data.</li>
          <li>Opt out of personalised advertising.</li>
          <li>Withdraw consent for cookies via your browser settings.</li>
        </ul>

        <h2>Children&apos;s Privacy</h2>
        <p>
          Our Site is not directed at children under 13. We do not knowingly
          collect personal information from children. If you believe we have
          inadvertently collected such information, please contact us.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page with an updated &quot;Last updated&quot; date.
        </p>

        <h2>Contact</h2>
        <p>
          If you have questions about this Privacy Policy, contact us at{" "}
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
