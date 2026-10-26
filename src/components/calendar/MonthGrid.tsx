import { useEffect, useMemo, useRef, type KeyboardEvent } from "react";
import type { Occurrence } from "@/types";
import { CATEGORY_MAP } from "@/data/categories";
import { addDays, daysInMonth, hijriParts, makeDate, sameDay, toISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useKeyedTransition } from "@/lib/motion";
import { fieldLang, useI18n } from "@/i18n/I18nContext";

/** Order inside a day cell: public holidays, then official observances, then international days, then the rest. */
const PRIORITY: Record<string, number> = { national: 0, observance: 1, un: 2, international: 3, cultural: 4, awareness: 5, event: 6, unofficial: 7 };
function byPriority(list: Occurrence[]): Occurrence[] {
  return list.length < 2 ? list : [...list].sort((a, b) => PRIORITY[a.event.recognition] - PRIORITY[b.event.recognition] || a.event.name.localeCompare(b.event.name));
}

interface Props {
  year: number;
  month: number; // 1..12
  selected: Date;
  today: Date;
  index: Map<string, Occurrence[]>;
  onSelect: (d: Date) => void;
  /** Called when keyboard navigation leaves the visible month. */
  onNavigate: (d: Date) => void;
  /** First weekday column (0 = Sunday … 6 = Saturday). Defaults to the language's convention. */
  weekStartsOn?: 0 | 1 | 6;
  /** Changes when the visible data is filtered (e.g. category); the grid body softly re-fades. */
  contentKey?: string;
}

export function MonthGrid({ year, month, selected, today, index, onSelect, onNavigate, weekStartsOn, contentKey = "" }: Props) {
  const { t, f, ev, locale, dir, showHijri } = useI18n();
  const weekStart = weekStartsOn ?? f.weekStart;
  const cells = useMemo(() => {
    const first = makeDate(year, month, 1);
    const lead = (first.getDay() - weekStart + 7) % 7;
    const total = Math.ceil((lead + daysInMonth(year, month)) / 7) * 7;
    return Array.from({ length: total }, (_, i) => addDays(first, i - lead));
  }, [year, month, weekStart]);

  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => (i + weekStart) % 7), [weekStart]);
  const gridRef = useRef<HTMLDivElement>(null);
  // Slide direction for month changes: later months enter from the reading-forward side (CSS mirrors it in RTL).
  const monthIndex = year * 12 + month;
  const slide = useKeyedTransition(`${monthIndex}|${contentKey}`, monthIndex);
  const focusPending = useRef(false);

  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${toISODate(selected)}"]`)?.focus();
  }, [selected, year, month]);

  const move = (d: Date) => {
    focusPending.current = true;
    if (d.getMonth() + 1 !== month || d.getFullYear() !== year) onNavigate(d);
    else onSelect(d);
  };

  const onKey = (e: KeyboardEvent) => {
    // Arrow keys follow what's on screen: in right-to-left layouts the next day is to the left.
    const h = dir === "rtl" ? -1 : 1;
    const map: Record<string, number> = { ArrowLeft: -h, ArrowRight: h, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) { e.preventDefault(); move(addDays(selected, map[e.key])); }
    else if (e.key === "PageUp") { e.preventDefault(); move(new Date(selected.getFullYear(), selected.getMonth() - 1, Math.min(selected.getDate(), daysInMonth(selected.getFullYear(), selected.getMonth())))); }
    else if (e.key === "PageDown") { e.preventDefault(); move(new Date(selected.getFullYear(), selected.getMonth() + 1, Math.min(selected.getDate(), daysInMonth(selected.getFullYear(), selected.getMonth() + 2)))); }
    else if (e.key === "Home") { e.preventDefault(); move(addDays(selected, -((selected.getDay() - weekStart + 7) % 7))); }
    else if (e.key === "End") { e.preventDefault(); move(addDays(selected, 6 - ((selected.getDay() - weekStart + 7) % 7))); }
  };

  return (
    <div className="card overflow-hidden" ref={gridRef}>
      <div role="grid" aria-label={f.monthYear(year, month)} onKeyDown={onKey}>
        <div role="rowgroup">
        <div role="row" className="grid grid-cols-7 border-b border-border/70 bg-surface-2/70">
          {weekdays.map((w) => (
            <div role="columnheader" key={w} aria-label={f.weekday(w, "long")} className="py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted">
              <span className="sm:hidden">{f.weekday(w, "narrow")}</span>
              <span className="hidden sm:inline">{f.weekday(w, "short")}</span>
            </div>
          ))}
        </div>
        </div>
        <div role="rowgroup" key={`${monthIndex}|${contentKey}`} className={slide}>
        {Array.from({ length: cells.length / 7 }, (_, r) => (
          <div role="row" key={r} className="grid grid-cols-7">
            {cells.slice(r * 7, r * 7 + 7).map((d) => {
              const inMonth = d.getMonth() + 1 === month;
              const list = inMonth ? byPriority(index.get(toISODate(d)) ?? []) : [];
              const holiday = list.some((o) => o.event.recognition === "national");
              const isSel = sameDay(d, selected);
              const isToday = sameDay(d, today);
              const h = showHijri && inMonth ? hijriParts(d) : null;
              return (
                <div role="gridcell" key={d.getTime()} aria-selected={isSel} className="border-b border-e border-border/50 [&:nth-child(7n)]:border-e-0 [[role=row]:last-child>&]:border-b-0">
                  <button
                    type="button"
                    data-date={toISODate(d)}
                    tabIndex={isSel ? 0 : -1}
                    disabled={!inMonth}
                    onClick={() => onSelect(d)}
                    aria-label={t.calendar.gridDay(f.date(d, { weekday: "long", month: "long", day: "numeric" }), list.length, holiday, isToday, h ? f.hijri(d) : null)}
                    className={cn(
                      "flex h-16 w-full flex-col items-start gap-1 p-1.5 text-start transition-colors sm:h-24 sm:p-2 lg:h-28",
                      inMonth ? "hover:bg-fg/[.04]" : "cursor-default bg-surface-2/50 text-muted/70",
                      isSel && "bg-primary-soft/70 shadow-[inset_0_0_0_2px_rgb(var(--primary)/0.55)] hover:bg-primary-soft",
                      "transition-[background-color,box-shadow] duration-150 active:bg-fg/[.07]",
                      "focus-visible:ring-inset focus-visible:ring-offset-0",
                    )}
                  >
                    <span className="flex w-full items-center justify-between gap-1">
                      <span
                        className={cn(
                          "relative grid size-7 place-items-center rounded-full text-sm tabular-nums",
                          isToday && "bg-primary font-bold text-primary-fg shadow-control",
                          !isToday && isSel && "font-bold text-primary",
                          !isToday && holiday && "font-semibold text-danger",
                          isSel && "animate-pop",
                        )}
                      >
                        {f.num(d.getDate())}
                        {/* Public-holiday marker: a small dot under the number. */}
                        {holiday && <span className={cn("absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full", isToday ? "bg-primary-fg" : "bg-danger")} aria-hidden />}
                      </span>
                      <span className="flex min-w-0 items-center gap-1">
                        {h && (
                          <span
                            className={cn("hijri-day truncate text-[10px] font-medium tabular-nums leading-none sm:text-[11px]", h.day === 1 ? "font-bold text-primary" : "text-muted")}
                            title={f.hijri(d) ?? undefined}
                            aria-hidden
                          >
                            {h.day === 1 ? <><span className="hidden lg:inline">{f.hijriMonthName(h.month)} </span>{f.num(1)}</> : f.num(h.day)}
                          </span>
                        )}
                        {list.length > 1 && (
                          <span className="hidden min-w-5 rounded-full bg-fg/[.07] px-1.5 text-center text-[10px] font-bold leading-5 text-muted sm:inline-block" aria-hidden>
                            {f.num(list.length)}
                          </span>
                        )}
                      </span>
                    </span>
                    {list.length > 0 && (
                      <>
                        <span className="flex flex-wrap items-center gap-0.5 sm:hidden" aria-hidden>
                          {list.slice(0, 4).map((o) => <span key={o.event.id + o.date.getTime()} className={cn("size-1.5 rounded-full", CATEGORY_MAP[o.event.category].dot)} />)}
                          {list.length > 4 && <span className="text-[9px] font-bold leading-none text-muted">+</span>}
                        </span>
                        <span className="hidden w-full flex-col gap-0.5 sm:flex" aria-hidden>
                          {list.slice(0, 2).map((o) => {
                            const text = ev(o.event);
                            return (
                              <span key={o.event.id + o.date.getTime()} {...fieldLang(text, "name", locale)} className={cn("grid-chip truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-tight", CATEGORY_MAP[o.event.category].chip,
                                o.event.recognition === "national" && "ring-1 ring-inset ring-danger/40")}>
                                {text.name}
                              </span>
                            );
                          })}
                          {list.length > 2 && <span className="px-1.5 text-[11px] font-medium text-muted">{t.calendar.more(list.length - 2)}</span>}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
