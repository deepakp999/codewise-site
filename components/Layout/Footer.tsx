import Link from "next/link";

/**
 * Footer — Simple, minimal site footer.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <div className="footer__left">
          <Link href="/" className="footer__logo" aria-label="Codewise Home">
            <span className="footer__logo-accent">Code</span>wise
          </Link>
          <p className="footer__tagline">
            Free, in-depth technical courses — built for clarity.
          </p>
        </div>

        <div className="footer__links">
          <Link href="/" className="footer__link">
            Courses
          </Link>
          <Link href="/about" className="footer__link">
            About
          </Link>
          <Link href="/privacy" className="footer__link">
            Privacy
          </Link>
          <Link href="/terms" className="footer__link">
            Terms
          </Link>
          <a href="mailto:hey@lumivoxx.com" className="footer__link">
            Contact
          </a>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {year} Codewise. All content is free to learn from.
          </p>
        </div>
      </div>
    </footer>
  );
}
