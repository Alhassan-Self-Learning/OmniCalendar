import { Link } from "react-router-dom";
import type { Occurrence } from "@/types";
import { CATEGORY_MAP } from "@/data/categories";
import { sameDay, toISODate } from "@/lib/dates";
import { useApp } from "@/context/AppContext";
import { fieldLang, useI18n } from "@/i18n/I18nContext";
import { CategoryIcon, RecognitionBadge, ScopeBadge } from "./Badges";
import { FavoriteButton } from "./FavoriteButton";
import { cn } from "@/lib/utils";

/** `feature` marks a highlighted card (e.g. today's days); the Liquid Glass theme renders it as a raised glass pane. */
export function EventCard({ occ, className, style, feature = false }: { occ: Occurrence; className?: string; style?: React.CSSProperties; feature?: boolean }) {
  const { today } = useApp();
  const { t, f, ev, locale, showHijri } = useI18n();
  const e = occ.event;
  const text = ev(e);
  const cat = CATEGORY_MAP[e.category];
  const multi = !sameDay(occ.date, occ.endDate);
  return (
    <article
      style={style}
      className={cn(
        "card card-interactive group relative flex animate-fade-up flex-col overflow-hidden p-5",
        feature && "card-feature",
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b opacity-60 [mask-image:linear-gradient(to_bottom,#000,transparent)] dark:opacity-40", cat.tile)} aria-hidden />
      <span className={cn("card-tab", cat.dot)} aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <CategoryIcon id={e.category} />
        <FavoriteButton id={e.id} className="-me-2 -mt-1" />
      </div>
      <div className="relative mt-4 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-muted">
        <time dateTime={toISODate(occ.date)} title={showHijri ? f.hijri(occ.date) ?? undefined : undefined}>
          {multi ? f.dateRange(occ.date, occ.endDate, { day: "numeric", month: "short" }) : f.short(occ.date)}
        </time>
        <span aria-hidden>·</span>
        <span>{occ.date < today && occ.endDate >= today ? t.common.ongoing : f.relative(occ.date, today)}</span>
        {occ.estimated && <span className="chip border border-border/70 bg-surface px-2 py-0.5 text-[10px]" title={t.common.estTitle}>{t.common.estShort}</span>}
      </div>
      <h3 className="relative mt-1.5 text-base font-bold leading-snug transition-colors group-hover:text-primary" {...fieldLang(text, "name", locale)}>
        <Link to={`/event/${e.id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:ring-0">
          {text.name}
        </Link>
      </h3>
      <p className="relative mb-4 mt-1.5 line-clamp-2 text-sm text-muted" {...fieldLang(text, "summary", locale)}>{text.summary}</p>
      <div className="relative mt-auto flex flex-wrap items-center gap-2 border-t border-border/50 pt-3.5">
        <RecognitionBadge id={e.recognition} />
        <ScopeBadge countries={e.countries} className="min-w-0" />
      </div>
    </article>
  );
}

/** Compact row used in lists, day panels and search results. */
export function EventRow({ occ, showDate = true, compact = false }: { occ: Occurrence; showDate?: boolean; compact?: boolean }) {
  const { today } = useApp();
  const { t, f, ev, locale } = useI18n();
  const e = occ.event;
  const text = ev(e);
  return (
    <div className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-fg/[.045]">
      <CategoryIcon id={e.category} size="sm" />
      <div className="min-w-0 flex-1">
        <Link to={`/event/${e.id}`} className="block truncate font-medium transition-colors group-hover:text-primary after:absolute after:inset-0 after:content-[''] focus-visible:ring-0" {...fieldLang(text, "name", locale)}>
          {text.name}
        </Link>
        <div className="flex items-center gap-1.5 truncate text-xs text-muted">
          {showDate && <span>{f.short(occ.date)} · {occ.date < today && occ.endDate >= today ? t.common.ongoing : f.relative(occ.date, today)}</span>}
          {!showDate && <span className="truncate" {...fieldLang(text, "summary", locale)}>{text.summary}</span>}
        </div>
      </div>
      {!compact && <RecognitionBadge id={e.recognition} className="hidden sm:inline-flex" />}
      <FavoriteButton id={e.id} className="relative" />
    </div>
  );
}
