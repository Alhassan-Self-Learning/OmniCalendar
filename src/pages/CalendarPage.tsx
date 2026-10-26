import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, CalendarDays, CalendarX, ChevronLeft, ChevronRight, Download, Grid3x3, List } from "lucide-react";
import { EVENTS } from "@/data/events";
import { CATEGORIES, RECOGNITIONS } from "@/data/categories";
import { useApp } from "@/context/AppContext";
import { endOfMonth, makeDate, occurrencesOn, parseISODate, sameDay, toISODate } from "@/lib/dates";
import { fieldLang, useI18n } from "@/i18n/I18nContext";
import { useIcsText, useNameCompare } from "@/i18n/hooks";
import { EMPTY_FILTERS, filterEvents, filtersToQuery, hasFilters, type DiscoveryFilters } from "@/lib/filters";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { YearGlance } from "@/components/calendar/YearGlance";
import { useDayIndex } from "@/components/calendar/useDayIndex";
import { DayPanel } from "@/components/discovery/DayPanel";
import { UpcomingList } from "@/components/discovery/UpcomingList";
import { ActiveFilters, RegionSelect, ScopeToggle } from "@/components/discovery/FilterControls";
import { Button, buttonClasses } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useKeyedTransition } from "@/lib/motion";
import { downloadICS } from "@/lib/ics";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useDiscoveryFilters } from "@/hooks/useDiscoveryFilters";

export default function CalendarPage() {
  const { t, f, ev, locale, showHijri, category, recognition } = useI18n();
  useDocumentTitle(t.calendar.title);
  const { today, notify } = useApp();
  const icsText = useIcsText();
  const compareNames = useNameCompare();
  const { filters: urlFilters, setFilters, params } = useDiscoveryFilters();
  // The calendar shows whole months, so a list date-range (from Explore) doesn't apply here.
  const filters = useMemo(() => ({ ...urlFilters, from: "", to: "" }), [urlFilters]);
  const view = params.get("view") === "year" ? "year" : "month";
  // The selected day is urgent local state (updates on the keypress/click itself); the URL follows.
  // URL navigation renders as a low-priority transition, so deriving the day from it alone lets fast
  // keyboard input act on a stale date (e.g. Page Down jumping two months).
  const urlSelected = toISODate(parseISODate(params.get("date") ?? "") ?? parseISODate(urlFilters.from) ?? today);
  const [selectedKey, setSelectedKey] = useState(urlSelected);
  useEffect(() => { setSelectedKey(urlSelected); }, [urlSelected]); // back/forward, shared links, "Today"
  const selected = useMemo(() => parseISODate(selectedKey) ?? today, [selectedKey, today]);
  const yearParam = Number(params.get("year"));
  const year = view === "year" && yearParam >= 1900 && yearParam <= 2200 ? yearParam : selected.getFullYear();
  const month = selected.getMonth() + 1;

  const filterQuery = filtersToQuery(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const events = useMemo(() => filterEvents(EVENTS, filters), [filterQuery]);
  const filtered = hasFilters(filters);
  const index = useDayIndex(events, year);
  const ongoing = useMemo(() => occurrencesOn(events, makeDate(year, month, 15)).filter((o) => (o.event.durationDays ?? 1) > 7), [events, year, month]);
  const monthList = useMemo(() => {
    const seen = new Set<string>();
    const out = [];
    for (const [k, list] of index) {
      if (!k.startsWith(`${year}-${String(month).padStart(2, "0")}`)) continue;
      for (const o of list) {
        const key = o.event.id + o.date.getTime();
        if (!seen.has(key)) { seen.add(key); out.push(o); }
      }
    }
    return out.sort((a, b) => a.date.getTime() - b.date.getTime() || compareNames(a.event, b.event));
  }, [index, year, month, compareNames]);

  const yearSlide = useKeyedTransition(`${year}|${filterQuery}`, year) || "animate-fade-in";

  const update = (patch: Record<string, string | null>) => setFilters(urlFilters, patch);
  const updateFilters = (f: DiscoveryFilters) => setFilters({ ...f, from: "", to: "" });
  const select = (d: Date) => { setSelectedKey(toISODate(d)); update({ date: toISODate(d), year: null }); };
  const shiftMonth = (n: number) => select(new Date(selected.getFullYear(), selected.getMonth() + n, 1));
  const clear = () => setFilters(EMPTY_FILTERS);

  const listHref = (from: Date, to: Date) => `/explore?${filtersToQuery({ ...filters, from: toISODate(from), to: toISODate(to) })}`;
  const singleValue = (arr: string[]) => (arr.length === 1 ? arr[0] : arr.length > 1 ? "__multi" : "");

  return (
    <div>
      <PageHeader
        eyebrow={showHijri && view === "month" ? <>{t.calendar.title} <span className="font-medium normal-case tracking-normal text-muted">· {f.hijriSpan(year, month)}</span></> : t.calendar.title}
        title={<span key={`${view}-${year}-${month}`} className="inline-block animate-fade-in">{view === "month" ? f.monthYear(year, month) : t.calendar.yearTitle(f.num(year))}</span>}
        description={view === "month" ? t.calendar.monthDesc : t.calendar.yearDesc}
        actions={
          <div className="segmented" role="group" aria-label={t.calendar.viewAria}>
            {(["month", "year"] as const).map((v) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => update({ view: v === "month" ? null : "year", year: null })} className="segmented-item">
                {v === "month" ? <CalendarDays className="size-4" aria-hidden /> : <Grid3x3 className="size-4" aria-hidden />}
                {v === "month" ? t.calendar.month : t.calendar.year}
              </button>
            ))}
          </div>
        }
      />
      <div className="container-page py-8">
        <div className="card mb-6 space-y-3 p-2.5" role="toolbar" aria-label={t.calendar.controls}>
          <div className="flex flex-wrap items-center gap-2">
            {/* Chevrons point the way time runs on screen: backwards is to the right in Arabic. */}
            <Button variant="outline" size="icon" aria-label={view === "month" ? t.calendar.prevMonth : t.calendar.prevYear}
              onClick={() => (view === "month" ? shiftMonth(-1) : update({ year: String(year - 1) }))}><ChevronLeft className="rtl:-scale-x-100" /></Button>
            <Button variant="outline" size="icon" aria-label={view === "month" ? t.calendar.nextMonth : t.calendar.nextYear}
              onClick={() => (view === "month" ? shiftMonth(1) : update({ year: String(year + 1) }))}><ChevronRight className="rtl:-scale-x-100" /></Button>
            <Button variant="outline" onClick={() => { setSelectedKey(toISODate(today)); update({ date: null, year: null }); }} disabled={sameDay(selected, today) && year === today.getFullYear()}>
              <CalendarCheck /> {t.common.today}
            </Button>
            <label className="sr-only" htmlFor="jump">{t.calendar.jump}</label>
            <input id="jump" type="date" value={toISODate(selected)}
              onChange={(e) => { const d = parseISODate(e.target.value); if (d) select(d); }}
              className="field field-pill w-auto" />
            {view === "month" && (
              <Link to={listHref(makeDate(year, month, 1), endOfMonth(year, month))} className={buttonClasses("ghost", "md", "ms-auto")} aria-label={t.calendar.listView}>
                <List /> <span className="hidden sm:inline">{t.calendar.listView}</span>
              </Link>
            )}
          </div>
          <div className="grid gap-2 border-t border-border/60 pt-3 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr]">
            <div>
              <label className="sr-only" htmlFor="cal-region">{t.calendar.region}</label>
              <RegionSelect id="cal-region" filters={filters} onChange={updateFilters} />
            </div>
            <div>
              <label className="sr-only" htmlFor="cal-cat">{t.calendar.category}</label>
              <select id="cal-cat" className="field" value={singleValue(filters.cats)}
                onChange={(e) => e.target.value !== "__multi" && updateFilters({ ...filters, cats: e.target.value ? [e.target.value as DiscoveryFilters["cats"][number]] : [] })}>
                <option value="">{t.calendar.allCategories}</option>
                {filters.cats.length > 1 && <option value="__multi" disabled>{t.calendar.nCategories(filters.cats.length)}</option>}
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{category(c.id).label}</option>)}
              </select>
            </div>
            <div>
              <label className="sr-only" htmlFor="cal-rec">{t.calendar.type}</label>
              <select id="cal-rec" className="field" value={singleValue(filters.recs)}
                onChange={(e) => e.target.value !== "__multi" && updateFilters({ ...filters, recs: e.target.value ? [e.target.value as DiscoveryFilters["recs"][number]] : [] })}>
                <option value="">{t.calendar.allTypes}</option>
                {filters.recs.length > 1 && <option value="__multi" disabled>{t.calendar.nTypes(filters.recs.length)}</option>}
                {RECOGNITIONS.map((r) => <option key={r.id} value={r.id}>{recognition(r.id).label}</option>)}
              </select>
            </div>
            <ScopeToggle filters={filters} onChange={updateFilters} className="h-10 self-start" />
          </div>
          <ActiveFilters filters={filters} onChange={updateFilters} today={today} onClear={clear} className="px-0.5" />
        </div>

        {view === "month" ? (
          <div className="grid animate-fade-in gap-6 lg:grid-cols-[1fr_360px] [&>*]:min-w-0">
            <div>
              {ongoing.length > 0 && (
                <div className="well mb-3 flex flex-wrap items-center gap-2 px-4 py-2.5 text-sm">
                  <span className="font-semibold text-muted">{t.calendar.running}</span>
                  {ongoing.map((o) => (
                    <Link key={o.event.id} to={`/event/${o.event.id}`} {...fieldLang(ev(o.event), "name", locale)} className="chip bg-primary-soft text-primary hover:underline">{ev(o.event).name}</Link>
                  ))}
                </div>
              )}
              <MonthGrid year={year} month={month} selected={selected} today={today} index={index} onSelect={select} onNavigate={select} contentKey={filterQuery} />
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-danger" aria-hidden /> {t.calendar.publicHoliday}</span>
                <span className="inline-flex items-center gap-1.5"><span className="rounded-full bg-fg/[.07] px-1.5 font-bold leading-4">{f.num(3)}</span> {t.calendar.countLegend}</span>
                <span className="hidden sm:inline">{t.calendar.keysHint}</span>
              </p>
            </div>
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label={t.calendar.selectedDay}>
              <DayPanel date={selected} events={events} allEvents={EVENTS} filtered={filtered} onClearFilters={clear} onJump={select}
                listHref={listHref(selected, selected)} />
              <div className="card p-4">
                <div className="mb-2 flex items-center justify-between gap-2 border-b border-border/60 px-1 pb-3">
                  <div>
                    <div className="meta-label">{t.common.specialDays(monthList.length)}{filtered ? t.calendar.filteredSuffix : ""}</div>
                    <h2 className="mt-0.5 text-base font-bold">{t.calendar.allIn(f.month(month - 1))}</h2>
                  </div>
                  {monthList.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => { downloadICS(monthList, `omnicalendar-${year}-${String(month).padStart(2, "0")}`, icsText); notify(t.toast.icsDownloaded); }}>
                      <Download /> <span dir="ltr">.ics</span>
                    </Button>
                  )}
                </div>
                <div key={`${year}-${month}|${filterQuery}`} className="-mx-2 -mb-2 max-h-[460px] animate-fade-in overflow-y-auto [&>ol]:border-0 [&>ol]:bg-transparent [&>ol]:shadow-none">
                  <UpcomingList items={monthList} empty={
                    <div className="flex flex-col items-center px-4 py-6 text-center text-sm">
                      <CalendarX className="mb-2 size-6 text-muted" aria-hidden />
                      <p className="font-medium">{t.calendar.nothingIn(f.month(month - 1), filtered)}</p>
                      {filtered && <Button size="sm" variant="secondary" className="mt-3" onClick={clear}>{t.calendar.clearFilters}</Button>}
                    </div>
                  } />
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div key={`${year}|${filterQuery}`} className={yearSlide}>
            <YearGlance year={year} today={today} index={index} onPick={(d) => update({ view: null, year: null, date: toISODate(d) })} />
          </div>
        )}
      </div>
    </div>
  );
}
