/**
 * AdUnit — Google AdSense placeholder.
 *
 * Renders a placeholder div until the AdSense account is approved.
 * Max 3 per page: after LearnBox, before Common Mistakes, after LessonNav.
 */

interface AdUnitProps {
  slot?: string;
  className?: string;
}

export default function AdUnit({ slot, className = "" }: AdUnitProps) {
  return (
    <div
      className={`ad-unit ${className}`}
      data-ad-slot={slot}
      aria-label="Advertisement"
    >
      <div className="ad-unit__placeholder">
        <span className="ad-unit__label">Ad</span>
      </div>
    </div>
  );
}
