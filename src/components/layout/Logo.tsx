import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";

/** The mark is a single tear-off leaf: an ink binding with two punched holes and a red-letter day. */
export function LeafMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="4" y="3" width="24" height="27" rx="1.5" className="fill-surface" />
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3h21A1.5 1.5 0 0 1 28 4.5V11H4z" className="fill-fg" />
      <circle cx="11" cy="7" r="1.6" className="fill-bg" />
      <circle cx="21" cy="7" r="1.6" className="fill-bg" />
      <rect x="4.75" y="3.75" width="22.5" height="25.5" rx="1" fill="none" className="stroke-fg" strokeWidth="1.5" />
      <circle cx="16" cy="20" r="4.5" className="fill-primary" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <Link to="/" className="pressable flex items-center gap-2.5 rounded" aria-label={t.app.home}>
      <LeafMark />
      {!compact && (
        <span className="text-[1.125rem] font-bold tracking-[-0.02em]" lang="en" dir="ltr">
          OmniCalendar
        </span>
      )}
    </Link>
  );
}
