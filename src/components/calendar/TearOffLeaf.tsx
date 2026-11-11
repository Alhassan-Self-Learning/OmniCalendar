import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SpecialDay } from "@/types";
import { addDays, occurrencesInRange, occurrencesOn, sameDay, toISODate } from "@/lib/dates";
import { fieldLang, useI18n } from "@/i18n/I18nContext";
import { CategoryStamp } from "@/components/events/Badges";
import { Button } from "@/components/ui/Button";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const PRIORITY: Record<string, number> = { national: 0, observance: 1, un: 2, international: 3, cultural: 4, awareness: 5, event: 6, unofficial: 7 };

/**
 * The home page's live object: the household tear-off calendar leaf, turned day by day.
 * The leaf prints the month in its binding, the Gregorian numeral (red on a public holiday),
 * the weekday in both of the app's scripts, the Hijri date, and — below the perforation — the day's
 * special days. Turning forward tears the old leaf away; turning back lays the previous one on top.
 */
export function TearOffLeaf({ today, events }: { today: Date; events: SpecialDay[] }) {
  const { t, f } = useI18n();
  const [date, setDate] = useState(today);
  const [torn, setTorn] = useState<{ date: Date; id: number } | null>(null);
  const [turn, setTurn] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { setDate(today); }, [today]);

  const go = (to: Date) => {
    if (sameDay(to, date)) return;
    const forward = to > date;
    setTurn((n) => n + 1);
    if (forward && !prefersReducedMotion()) {
      setTorn({ date, id: Date.now() });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setTorn(null), 280);
    } else setTorn(null);
    setDate(to);
  };
  const onKey = (e: KeyboardEvent) => {
    // Arrows follow what's on screen: in right-to-left layouts the next day is to the left.
    const h = f.dir === "rtl" ? -1 : 1;
    if (e.key === "ArrowRight") { e.preventDefault(); go(addDays(date, h)); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(addDays(date, -h)); }
    else if (e.key === "Home") { e.preventDefault(); go(today); }
  };

  const count = useMemo(() => occurrencesOn(events, date).length, [events, date]);

  return (
    <section aria-label={t.home.leafLabel} className="flex flex-col items-center">
      <div className="relative w-full max-w-[26rem]" onKeyDown={onKey}>
        <div key={turn} className={cn("leaf leaf-pad card-feature min-h-[30rem] w-full sm:min-h-[34rem]", turn > 0 && "animate-leaf-in")}>
          <LeafFace date={date} events={events} today={today} />
        </div>
        {torn && (
          <div key={torn.id} className="leaf card-feature pointer-events-none absolute inset-0 animate-leaf-out" aria-hidden>
            <LeafFace date={torn.date} events={events} today={today} inert />
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{turn > 0 ? t.home.leafStatus(f.long(date), count) : ""}</p>
      <div className="mt-8 flex items-center gap-2" role="group" aria-label={t.home.leafLabel}>
        <Button variant="outline" size="icon" className="size-11" aria-label={t.home.leafPrev} title={t.home.leafPrev} onClick={() => go(addDays(date, -1))} onKeyDown={onKey}>
          <ChevronLeft className="rtl:-scale-x-100" />
        </Button>
        <Button variant="outline" className="h-11 min-w-24" onClick={() => go(today)} disabled={sameDay(date, today)} onKeyDown={onKey}>
          {t.common.today}
        </Button>
        <Button variant="ink" size="icon" className="size-11" aria-label={t.home.leafNext} title={t.home.leafNext} onClick={() => go(addDays(date, 1))} onKeyDown={onKey}>
          <ChevronRight className="rtl:-scale-x-100" />
        </Button>
      </div>
      <p className="mt-3 hidden text-meta text-muted sm:block">{t.home.leafHint}</p>
    </section>
  );
}

/** One printed leaf. */
function LeafFace({ date, events, today, inert = false }: { date: Date; events: SpecialDay[]; today: Date; inert?: boolean }) {
  const { t, f, ev, locale } = useI18n();
  const list = useMemo(
    () => occurrencesOn(events, date).sort((a, b) => PRIORITY[a.event.recognition] - PRIORITY[b.event.recognition]),
    [events, date],
  );
  const holiday = list.some((o) => o.event.recognition === "national");
  const other = locale === "ar" ? "en" : "ar";
  const otherWeekday = new Intl.DateTimeFormat(other === "ar" ? "ar-OM" : "en-GB", { weekday: "long" }).format(date);
  const hijri = f.hijri(date);
  const shown = list.slice(0, 3);
  // An empty leaf points to the next marked day rather than staying blank.
  const next = useMemo(
    () => (list.length ? null : occurrencesInRange(events, addDays(date, 1), addDays(date, 120)).find((o) => o.date > date) ?? null),
    [list.length, events, date],
  );
  const tab = inert ? -1 : undefined;

  return (
    <div className="flex h-full min-h-[30rem] flex-col sm:min-h-[34rem]" style={{ ["--hole" as string]: "18%", ["--hole-size" as string]: "14px" }}>
      <div className="leaf-binding h-14 justify-center px-6 text-[1.0625rem] font-semibold">
        <span className="relative z-[1]">{f.date(date, { month: "long", year: "numeric" })}</span>
      </div>
      <div className="flex flex-1 flex-col px-7 pb-6 pt-6 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <time dateTime={toISODate(date)} className={cn("leaf-numeral text-[clamp(8.5rem,14vw,11.5rem)]", holiday && "leaf-red")}>
            {f.num(date.getDate())}
          </time>
          {sameDay(date, today) && (
            <span className="mt-3 inline-flex items-center gap-2 text-meta font-semibold text-primary">
              <span className="size-2 rounded-full bg-primary" aria-hidden />
              {t.common.today}
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="text-[1.75rem] font-bold leading-tight tracking-[-0.02em]">{f.date(date, { weekday: "long" })}</span>
          <span lang={other} dir={other === "ar" ? "rtl" : "ltr"} className="text-lead font-medium text-muted">{otherWeekday}</span>
        </div>
        {hijri && <p className="mt-1 text-body text-muted" title={t.common.hijriTitle}>{hijri}</p>}

        <div className="perf mt-6 pt-5">
          {shown.length ? (
            <ul className="space-y-2.5">
              {shown.map((o) => {
                const text = ev(o.event);
                const red = o.event.recognition === "national";
                return (
                  <li key={o.event.id} className="flex items-start gap-2.5">
                    <CategoryStamp id={o.event.category} className={cn("mt-2", red && "bg-primary dark:bg-primary")} />
                    <Link to={`/event/${o.event.id}`} tabIndex={tab} {...fieldLang(text, "name", locale)}
                      className={cn("line-clamp-2 font-semibold leading-snug underline-offset-4 hover:underline", red && "text-primary")}>
                      {text.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div>
              <p className="text-body text-muted">{t.day.none(false)}</p>
              {next && (
                <p className="mt-3 flex items-start gap-2.5">
                  <CategoryStamp id={next.event.category} className="mt-2" />
                  <span>
                    <Link to={`/event/${next.event.id}`} tabIndex={tab} {...fieldLang(ev(next.event), "name", locale)} className="font-semibold leading-snug underline-offset-4 hover:underline">
                      {ev(next.event).name}
                    </Link>
                    <span className="block text-meta text-muted">{f.short(next.date)} · {f.relative(next.date, today)}</span>
                  </span>
                </p>
              )}
            </div>
          )}
          <div className="mt-4 flex items-center justify-between gap-3 text-meta">
            <span className="text-muted">{list.length > 3 ? t.home.leafMore(list.length - 3) : ""}</span>
            <Link to={`/calendar?date=${toISODate(date)}`} tabIndex={tab} className="font-semibold underline decoration-border-strong decoration-2 underline-offset-4 hover:decoration-primary">
              {t.home.leafCalendar}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
