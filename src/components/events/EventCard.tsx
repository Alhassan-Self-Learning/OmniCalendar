import { Link } from "react-router-dom";
import type { Occurrence } from "@/types";
import { sameDay, toISODate } from "@/lib/dates";
import { useApp } from "@/context/AppContext";
import { fieldLang, useI18n } from "@/i18n/I18nContext";
import { CategoryChip, CategoryStamp, RecognitionBadge, ScopeBadge } from "./Badges";
import { FavoriteButton } from "./FavoriteButton";
import { cn } from "@/lib/utils";

/** The date stub at the start of a slip: month over day over weekday; red on a public holiday. */
export function DateStub({ occ, className }: { occ: Occurrence; className?: string }) {
  const { f, showHijri } = useI18n();
  const red = occ.event.recognition === "national";
  return (
    <time dateTime={toISODate(occ.date)} title={showHijri ? f.hijri(occ.date) ?? undefined : undefined} className={cn("stub", red && "stub-red", className)}>
      <span className="stub-month">{f.date(occ.date, { month: "short" })}</span>
      <span className="stub-day">{f.num(occ.date.getDate())}</span>
      <span className="stub-week">{f.date(occ.date, { weekday: "short" })}</span>
    </time>
  );
}

/**
 * A special day as a paper slip: its date stub, the name, one line of what it is, and its
 * category stamp and recognition. `feature` marks a highlighted slip (the Liquid Glass theme raises it).
 */
export function EventCard({ occ, className, style, feature = false }: { occ: Occurrence; className?: string; style?: React.CSSProperties; feature?: boolean }) {
  const { today } = useApp();
  const { t, f, ev, locale } = useI18n();
  const e = occ.event;
  const text = ev(e);
  const multi = !sameDay(occ.date, occ.endDate);
  const when = occ.date < today && occ.endDate >= today ? t.common.ongoing : f.relative(occ.date, today);
  return (
    <article
      style={style}
      className={cn("card card-interactive group relative flex animate-fade-up gap-4 p-4 sm:p-5", feature && "card-feature", className)}
    >
      <DateStub occ={occ} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 text-[1.0625rem] font-bold leading-snug" {...fieldLang(text, "name", locale)}>
            <Link to={`/event/${e.id}`} className="decoration-primary decoration-2 underline-offset-4 after:absolute after:inset-0 after:content-[''] group-hover:underline focus-visible:ring-0">
              {text.name}
            </Link>
          </h3>
          <FavoriteButton id={e.id} className="relative -me-2 -mt-1.5" />
        </div>
        <p className="mt-1 text-meta font-medium text-muted">
          <span>{multi ? f.dateRange(occ.date, occ.endDate, { day: "numeric", month: "short" }) : when}</span>
          {multi && <span> · {when}</span>}
          {occ.estimated && <span title={t.common.estTitle}> · {t.common.estShort}</span>}
        </p>
        <p className="mb-4 mt-2 line-clamp-2 text-[0.9375rem] leading-relaxed text-fg/80" {...fieldLang(text, "summary", locale)}>{text.summary}</p>
        <div className="relative mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <CategoryChip id={e.category} />
          <RecognitionBadge id={e.recognition} />
          <ScopeBadge countries={e.countries} className="min-w-0" />
        </div>
      </div>
    </article>
  );
}

/** Compact row used in lists, day panels and collections. */
export function EventRow({ occ, showDate = true, compact = false }: { occ: Occurrence; showDate?: boolean; compact?: boolean }) {
  const { today } = useApp();
  const { t, f, ev, locale } = useI18n();
  const e = occ.event;
  const text = ev(e);
  return (
    <div className="group relative flex min-h-12 items-center gap-3 rounded px-3 py-2.5 transition-colors hover:bg-fg/[.045]">
      <CategoryStamp id={e.category} />
      <div className="min-w-0 flex-1">
        <Link to={`/event/${e.id}`} className="block truncate font-medium after:absolute after:inset-0 after:content-[''] group-hover:underline decoration-primary decoration-2 underline-offset-4 focus-visible:ring-0" {...fieldLang(text, "name", locale)}>
          {text.name}
        </Link>
        <div className="flex items-center gap-1.5 truncate text-meta text-muted">
          {showDate && <span>{f.short(occ.date)} · {occ.date < today && occ.endDate >= today ? t.common.ongoing : f.relative(occ.date, today)}</span>}
          {!showDate && <span className="truncate" {...fieldLang(text, "summary", locale)}>{text.summary}</span>}
        </div>
      </div>
      {!compact && <RecognitionBadge id={e.recognition} className="hidden sm:inline-flex" />}
      <FavoriteButton id={e.id} className="relative" />
    </div>
  );
}
