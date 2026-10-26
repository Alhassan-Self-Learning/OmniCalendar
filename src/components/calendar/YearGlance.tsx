import { useMemo } from "react";
import type { Occurrence } from "@/types";
import { addDays, daysInMonth, makeDate, sameDay, toISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";

const LEVELS = [
  "bg-surface-3/70",
  "bg-primary/25",
  "bg-primary/50",
  "bg-primary/75",
  "bg-primary",
];

/** Year at a Glance: 12 mini-months coloured by how many special days each date holds. */
export function YearGlance({ year, today, index, onPick }: { year: number; today: Date; index: Map<string, Occurrence[]>; onPick: (d: Date) => void }) {
  const { t, f, showHijri } = useI18n();
  const weekStart = f.weekStart;
  const months = useMemo(() => Array.from({ length: 12 }, (_, m) => {
    const first = makeDate(year, m + 1, 1);
    const lead = (first.getDay() - weekStart + 7) % 7;
    const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= daysInMonth(year, m + 1); d++) cells.push(makeDate(year, m + 1, d));
    let count = 0;
    for (let d = first; d.getMonth() === m; d = addDays(d, 1)) count += index.get(toISODate(d))?.length ?? 0;
    return { m, cells, count };
  }), [year, index, weekStart]);
  const heads = useMemo(() => Array.from({ length: 7 }, (_, i) => f.weekday((i + weekStart) % 7, "narrow")), [f, weekStart]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {months.map(({ m, cells, count }) => (
          <section key={m} className="card card-interactive p-4 hover:translate-y-0" aria-label={f.monthYear(year, m + 1)}>
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-bold">{f.month(m)}</h3>
                {showHijri && <p className="truncate text-[11px] text-muted">{f.hijriSpan(year, m + 1)}</p>}
              </div>
              <span className="chip shrink-0 bg-surface-2 px-2 py-0.5 text-[11px] text-muted">{t.common.daysCount(count)}</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {heads.map((w, i) => <span key={i} className="text-center text-[10px] font-medium text-muted" aria-hidden>{w}</span>)}
              {cells.map((d, i) => {
                if (!d) return <span key={`e${i}`} />;
                const n = index.get(toISODate(d))?.length ?? 0;
                const isToday = sameDay(d, today);
                return (
                  <button
                    key={d.getDate()}
                    type="button"
                    onClick={() => onPick(d)}
                    title={t.calendar.glanceTitle(f.date(d, { month: "short", day: "numeric" }), n) + (showHijri ? ` · ${f.hijriShort(d) ?? ""}` : "")}
                    aria-label={t.calendar.glanceCell(f.date(d, { month: "long", day: "numeric" }), n)}
                    className={cn(
                      "aspect-square rounded-[5px] text-[10px] font-medium tabular-nums transition-transform hover:scale-110 focus-visible:ring-offset-1",
                      LEVELS[Math.min(n, 4)],
                      n >= 3 ? "text-primary-fg" : "text-fg/70",
                      isToday && "ring-2 ring-accent ring-offset-1 ring-offset-surface",
                    )}
                  >
                    {f.num(d.getDate())}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-end gap-2 text-xs text-muted" aria-hidden>
        {t.calendar.fewer}
        {LEVELS.map((l) => <span key={l} className={cn("size-3.5 rounded-[4px]", l)} />)}
        {t.calendar.more2}
      </div>
    </div>
  );
}
