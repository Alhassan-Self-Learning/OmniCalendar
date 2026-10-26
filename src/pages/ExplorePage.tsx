import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Download, FilterX, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { EVENTS } from "@/data/events";
import { CATEGORIES, RECOGNITIONS } from "@/data/categories";
import { useApp } from "@/context/AppContext";
import { activeFilterCount, EMPTY_FILTERS, filterChips, filtersToQuery, searchOccurrences, type DiscoveryFilters } from "@/lib/filters";
import { EventCard } from "@/components/events/EventCard";
import { Button, buttonClasses } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ActiveFilters, DateRangeFilter, QuickRegions, RegionSelect, ScopeToggle } from "@/components/discovery/FilterControls";
import { useChangeKey, usePresence } from "@/lib/motion";
import { EmptyState } from "@/components/ui/EmptyState";
import { downloadICS } from "@/lib/ics";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useDiscoveryFilters } from "@/hooks/useDiscoveryFilters";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";
import { useChipLabels, useIcsText, useNameCompare } from "@/i18n/hooks";
import { loadArabic } from "@/i18n/registry";

type Sort = "date" | "relevance" | "az";
/** Cards rendered per page; more load as the list scrolls into view (keeps filtering instant). */
const PAGE = 24;

export default function ExplorePage() {
  const { t, f, category, recognition } = useI18n();
  useDocumentTitle(t.nav.explore);
  const { today, notify } = useApp();
  const icsText = useIcsText();
  const compareNames = useNameCompare();
  // Arabic names and descriptions are searchable from either language; fetch them when idle.
  const [arabicReady, setArabicReady] = useState(0);
  useEffect(() => {
    let alive = true;
    const run = () => loadArabic().then(() => alive && setArabicReady((n) => n + 1), () => {});
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(run); else setTimeout(run, 300);
    return () => { alive = false; };
  }, []);
  const { filters, setFilters, params } = useDiscoveryFilters();
  const q = filters.q;
  const sort: Sort = params.get("sort") === "az" ? "az" : params.get("sort") === "date" ? "date" : q ? "relevance" : "date";
  const [showFilters, setShowFilters] = useState(false);
  const [draft, setDraft] = useState(q);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(q); }, [q]);
  useEffect(() => { input.current?.focus(); }, []);

  const update = (f: DiscoveryFilters, extra: Record<string, string | null> = {}) => setFilters(f, extra);
  // Debounced search → URL.
  useEffect(() => {
    if (draft.trim() === q) return;
    const t = setTimeout(() => update({ ...filters, q: draft.trim() }), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  // `arabicReady` re-runs the search once Arabic text is indexed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const results = useMemo(() => searchOccurrences(EVENTS, filters, today, sort, compareNames), [filters, today, sort, compareNames, arabicReady]);

  const toggle = <K extends "cats" | "recs">(key: K, v: DiscoveryFilters[K][number]) => {
    const arr = filters[key] as string[];
    update({ ...filters, [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] });
  };

  const activeCount = activeFilterCount(filters);
  const filterKey = [filters.cats.join(), filters.recs.join(), filters.region, filters.withIntl, filters.scope, filters.from, filters.to, sort].join("|");
  const countPulse = useChangeKey(results.length);
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => { setLimit(PAGE); }, [filterKey, q]);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || limit >= results.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) setLimit((l) => l + PAGE); }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [limit, results.length]);
  const drawer = usePresence(showFilters);
  const calendarHref = `/calendar?${filtersToQuery({ ...filters, from: "", to: "" }, { date: filters.from })}`;

  return (
    <div>
      <PageHeader eyebrow={t.nav.explore} title={t.explore.title} description={t.explore.description}>
        <div className="mt-6 flex max-w-3xl gap-2">
          <form role="search" className="relative flex-1" onSubmit={(e) => { e.preventDefault(); update({ ...filters, q: draft.trim() }); }}>
            <label htmlFor="explore-q" className="sr-only">{t.explore.searchLabel}</label>
            <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="explore-q" ref={input} value={draft} onChange={(e) => setDraft(e.target.value)} type="search"
              placeholder={t.explore.placeholder}
              className="field field-pill h-12 ps-12 text-base shadow-lift"
            />
          </form>
          <Button variant={activeCount ? "secondary" : "outline"} size="lg" className="h-12 lg:hidden" aria-label={activeCount ? t.explore.filtersActive(activeCount) : t.explore.filters} aria-expanded={showFilters} aria-controls="filters" onClick={() => setShowFilters((s) => !s)}>
            <SlidersHorizontal /> <span className="hidden sm:inline">{t.explore.filters}</span>{activeCount > 0 && <span className="rounded-full bg-primary px-1.5 text-xs text-primary-fg">{f.num(activeCount)}</span>}
          </Button>
        </div>
        <QuickRegions className="mt-3" filters={filters} onChange={update} />
      </PageHeader>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[280px_1fr]">
        <aside id="filters" aria-label={t.explore.filters} data-state={drawer.state}
          className={cn("card origin-top space-y-6 self-start p-5 lg:sticky lg:top-24 lg:block", drawer.mounted ? "block" : "hidden", drawer.state === "open" ? "max-lg:animate-menu-in" : "max-lg:animate-menu-out")}>
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="flex items-center gap-2 text-sm font-bold"><SlidersHorizontal className="size-4 text-primary" aria-hidden /> {t.explore.filters}</span>
            {activeCount > 0 && <span className="chip bg-primary-soft text-primary">{t.explore.nActive(activeCount)}</span>}
          </div>
          <FilterGroup title={t.calendar.region} htmlFor="f-country">
            <RegionSelect id="f-country" filters={filters} onChange={update} />
          </FilterGroup>
          <FilterGroup title={t.explore.date} htmlFor="f-range">
            <DateRangeFilter id="f-range" filters={filters} onChange={update} today={today} />
          </FilterGroup>
          <FilterGroup title={t.explore.scope}>
            <ScopeToggle short filters={filters} onChange={update} />
          </FilterGroup>
          <FilterGroup title={t.explore.recognition}>
            <div className="flex flex-wrap gap-1.5">
              {RECOGNITIONS.map((r) => (
                <ToggleChip key={r.id} on={filters.recs.includes(r.id)} onClick={() => toggle("recs", r.id)} title={recognition(r.id).description}>{recognition(r.id).short}</ToggleChip>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title={t.calendar.category}>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <ToggleChip key={c.id} on={filters.cats.includes(c.id)} onClick={() => toggle("cats", c.id)}>
                  <c.icon className="size-3.5" aria-hidden /> {category(c.id).label}
                </ToggleChip>
              ))}
            </div>
          </FilterGroup>
          {activeCount > 0 && (
            <Button variant="outline" className="w-full" onClick={() => update({ ...EMPTY_FILTERS, q })}><FilterX /> {t.explore.clear}</Button>
          )}
        </aside>

        <section aria-label={t.explore.results}>
          <h2 className="sr-only">{t.explore.results}</h2>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <p className="me-auto text-sm text-muted" aria-live="polite">
              <strong key={countPulse} className={cn("inline-block text-fg", countPulse > 0 && "animate-pop")}>{t.common.specialDays(results.length)}</strong>
              {q && t.explore.matching(q)}
              {!filters.from && !filters.to && <span className="hidden sm:inline">{t.explore.nextShown}</span>}
            </p>
            <label htmlFor="sort" className="sr-only">{t.explore.sort}</label>
            <select id="sort" value={sort} onChange={(e) => update(filters, { sort: e.target.value === (q ? "relevance" : "date") ? null : e.target.value })} className="field field-pill h-9 w-auto">
              {q && <option value="relevance">{t.explore.best}</option>}
              <option value="date">{t.explore.soonest}</option>
              <option value="az">{t.explore.az}</option>
            </select>
            <Link to={calendarHref} className={buttonClasses("outline", "sm")}><CalendarDays /> {t.explore.calendarView}</Link>
            {results.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => { downloadICS(results, "omnicalendar-selection", icsText); notify(t.toast.exportedEvents(results.length)); }}>
                <Download /> <span className="hidden sm:inline">{t.explore.export}</span> <span dir="ltr">.ics</span>
              </Button>
            )}
          </div>
          <ActiveFilters className="mb-4" filters={filters} onChange={update} today={today} includeQuery={false} onClear={() => update({ ...EMPTY_FILTERS, q })} />
          {results.length ? (
            <>
              <div key={filterKey} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.slice(0, limit).map((o, i) => <EventCard key={o.event.id + o.date.getTime()} occ={o} style={{ animationDelay: `${Math.min(i % PAGE, 8) * 20}ms` }} />)}
              </div>
              {limit < results.length && (
                <div ref={sentinel} className="mt-6 flex justify-center">
                  <Button variant="outline" onClick={() => setLimit((l) => l + PAGE)}>{t.explore.showMore(results.length - limit)}</Button>
                </div>
              )}
            </>
          ) : (
            <NoResults filters={filters} today={today} onChange={update} />
          )}
        </section>
      </div>
    </div>
  );
}

/** Empty state that explains which filters are responsible and offers one-click ways out. */
function NoResults({ filters, today, onChange }: { filters: DiscoveryFilters; today: Date; onChange: (f: DiscoveryFilters) => void }) {
  const { t } = useI18n();
  const labels = useChipLabels();
  const suggestions = useMemo(() => filterChips(filters, today, {}, labels)
    .map((c) => ({ ...c, count: searchOccurrences(EVENTS, c.without, today).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3), [filters, today, labels]);
  const everywhere = filters.q ? searchOccurrences(EVENTS, { ...EMPTY_FILTERS, q: filters.q }, today).length : 0;
  return (
    <EmptyState icon={SearchX} title={t.explore.noTitle}>
      <p>{filters.q ? t.explore.noQuery(filters.q) : t.explore.noCombo}</p>
      {(suggestions.length > 0 || everywhere > 0) && (
        <div className="mt-4 flex flex-col items-center gap-2">
          {suggestions.map((s) => (
            <Button key={s.key} size="sm" variant="outline" onClick={() => onChange(s.without)}>
              {t.explore.removeSuggest(s.label, s.count)}
            </Button>
          ))}
          {filters.q && everywhere > 0 && suggestions.length === 0 && (
            <Button size="sm" variant="secondary" onClick={() => onChange({ ...EMPTY_FILTERS, q: filters.q })}>{t.explore.everywhere(everywhere)}</Button>
          )}
        </div>
      )}
      <button className="mt-4 font-semibold text-primary underline-offset-2 hover:underline" onClick={() => onChange(EMPTY_FILTERS)}>{t.explore.reset}</button>
    </EmptyState>
  );
}

function FilterGroup({ title, children, htmlFor }: { title: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <fieldset>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="meta-label mb-2 block">{title}</label>
      ) : (
        <legend className="meta-label mb-2">{title}</legend>
      )}
      {children}
    </fieldset>
  );
}

function ToggleChip({ on, onClick, children, title }: { on: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} title={title} className="chip-toggle">
      {children}
    </button>
  );
}
