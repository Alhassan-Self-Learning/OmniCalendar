import { Link } from "react-router-dom";
import type { Occurrence } from "@/types";
import { diffInDays, toISODate } from "@/lib/dates";
import { useApp } from "@/context/AppContext";
import { fieldLang, useI18n } from "@/i18n/I18nContext";
import type { Formatter } from "@/i18n/format";
import type { Messages } from "@/i18n/messages/en";
import { RecognitionBadge, ScopeBadge } from "@/components/events/Badges";
import { FavoriteButton } from "@/components/events/FavoriteButton";
import { cn } from "@/lib/utils";

/** Countdown text: "Today", "Tomorrow", "In 12 days", or "Ongoing · until 21 Nov" for running events. */
export function countdownLabel(occ: Occurrence, today: Date, t: Messages, f: Formatter): { text: string; tone: "now" | "soon" | "later" } {
  const n = diffInDays(today, occ.date);
  if (n < 0 && diffInDays(today, occ.endDate) >= 0) return { text: t.countdown.ongoingUntil(f.short(occ.endDate)), tone: "now" };
  const text = f.relative(occ.date, today);
  if (n === 0 || n === 1) return { text, tone: n === 0 ? "now" : "soon" };
  if (n < 0) return { text, tone: "later" };
  return { text, tone: n <= 7 ? "soon" : "later" };
}

/** Compact list of upcoming days with a clear date tile and countdown. */
export function UpcomingList({ items, empty, compact = false }: { items: Occurrence[]; empty?: React.ReactNode; compact?: boolean }) {
  const { today } = useApp();
  const { t, f, ev, locale, showHijri } = useI18n();
  if (!items.length) return <>{empty}</>;
  return (
    <ol className="card divide-y divide-border p-2" data-ui>
      {items.map((o) => {
        const e = o.event;
        const text = ev(e);
        const cd = countdownLabel(o, today, t, f);
        return (
          <li key={e.id + o.date.getTime()} className="group relative flex items-center gap-3.5 rounded px-2 py-3 transition-colors hover:bg-fg/[.035]">
            <time dateTime={toISODate(o.date)} title={showHijri ? f.hijri(o.date) ?? undefined : undefined}
              className={cn("stub w-12", e.recognition === "national" && "stub-red")}>
              <span className="stub-month">{f.date(o.date, { month: "short" })}</span>
              <span className="stub-day text-lg">{f.num(o.date.getDate())}</span>
              <span className="stub-week">{f.date(o.date, { weekday: "short" })}</span>
            </time>
            <div className="min-w-0 flex-1">
              <Link to={`/event/${e.id}`} {...fieldLang(text, "name", locale)} className={cn("block font-semibold decoration-primary decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-[''] focus-visible:ring-0", compact ? "line-clamp-2" : "truncate")}>
                {text.name}
              </Link>
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
                <span className={cn("text-meta font-semibold",
                  cd.tone === "now" ? "text-primary" : cd.tone === "soon" ? "text-fg" : "text-muted")}>
                  {cd.text}
                </span>
                <ScopeBadge countries={e.countries} max={2} />
                {o.estimated && <span className="text-meta text-muted" title={t.common.estTitle}>{t.common.estShort}</span>}
              </div>
            </div>
            {!compact && <RecognitionBadge id={e.recognition} className="relative hidden shrink-0 sm:inline-flex" />}
            <FavoriteButton id={e.id} className="relative shrink-0" />
          </li>
        );
      })}
    </ol>
  );
}
