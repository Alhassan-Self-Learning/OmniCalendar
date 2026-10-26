import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Heart, Search, Shuffle, Sparkles } from "lucide-react";
import { EVENTS, EVENT_MAP, FEATURED_IDS } from "@/data/events";
import { CATEGORIES, CATEGORY_MAP } from "@/data/categories";
import { useApp, useFilterMemory } from "@/context/AppContext";
import { nextOccurrence, occurrencesOn, sameDay, toISODate, upcoming } from "@/lib/dates";
import { EMPTY_FILTERS, filterEvents, filtersToQuery, parseFilters, presetRange } from "@/lib/filters";
import { ARAB_LEAGUE, COUNTRIES } from "@/data/countries";
import { fieldLang, useI18n } from "@/i18n/I18nContext";
import { DayPanel } from "@/components/discovery/DayPanel";
import { UpcomingList } from "@/components/discovery/UpcomingList";
import { hashString } from "@/lib/utils";
import { EventCard } from "@/components/events/EventCard";
import { CategoryChip, CategoryIcon, RecognitionBadge } from "@/components/events/Badges";
import { Countdown } from "@/components/events/Countdown";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button, buttonClasses } from "@/components/ui/Button";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { DateLeaf } from "@/components/calendar/DateLeaf";
import { useDayIndex } from "@/components/calendar/useDayIndex";
import { useSurprise } from "@/hooks/useSurprise";
import { Reveal } from "@/lib/motion";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { Occurrence } from "@/types";


export default function HomePage() {
  useDocumentTitle();
  const { today, favorites } = useApp();
  const { t, f, ev, locale, countryName, regionLabel, category, showHijri } = useI18n();
  const { filterQuery, setFilterQuery } = useFilterMemory();
  const navigate = useNavigate();
  const surprise = useSurprise();
  const [q, setQ] = useState("");

  // Region shared with Explore/Calendar (session). On Home a country always comes with worldwide days.
  const remembered = useMemo(() => parseFilters(new URLSearchParams(filterQuery), today), [filterQuery, today]);
  const region = remembered.region;
  const regionFilters = useMemo(() => ({ ...EMPTY_FILTERS, region, withIntl: !!region }), [region]);
  const setRegion = (code: string) => setFilterQuery(filtersToQuery({ ...remembered, region: code, withIntl: !!code }));
  const homeEvents = useMemo(() => filterEvents(EVENTS, regionFilters), [regionFilters]);

  const todays = useMemo(() => occurrencesOn(EVENTS, today), [today]);
  const next = useMemo(() => upcoming(homeEvents, today, 45).slice(0, 8), [homeEvents, today]);
  const featured = useMemo(
    () => FEATURED_IDS.map((id) => nextOccurrence(EVENT_MAP[id], today)).filter((o): o is Occurrence => !!o)
      .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [today],
  );
  const spotlight = useMemo(() => {
    // Prefer single-day observances happening today; rotate deterministically per date.
    const pool = todays.filter((o) => sameDay(o.date, o.endDate));
    const list = pool.length ? pool : todays.length ? todays : next.slice(0, 1);
    return list.length ? list[hashString(today.toDateString()) % list.length] : null;
  }, [todays, next, today]);
  const countdowns = useMemo(() => {
    const ids = favorites.length ? favorites : [];
    return ids.map((id) => EVENT_MAP[id] && nextOccurrence(EVENT_MAP[id], today))
      .filter((o): o is Occurrence => !!o)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 4);
  }, [favorites, today]);

  const index = useDayIndex(homeEvents, today.getFullYear());
  const [selected, setSelected] = useState(today);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/explore${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="hero-canvas">
        <div className="container-page flex flex-col items-center pb-14 pt-12 text-center sm:pb-20 sm:pt-20">
          <p className="chip border border-border/80 bg-surface/80 py-1.5 pe-3 ps-2 text-muted shadow-card backdrop-blur">
            <CalendarDays className="size-3.5 text-primary" aria-hidden />
            <time dateTime={toISODate(today)}>{f.long(today)}</time>
            {showHijri && f.hijri(today) && <><span aria-hidden className="text-border-strong">|</span><span>{f.hijri(today)}</span></>}
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            {t.home.heroA}<span className="hero-accent bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent rtl:bg-gradient-to-l">{t.home.heroB}</span>
          </h1>
          <p className="lead mt-4 max-w-xl">
            {t.home.lead}
          </p>
          <form role="search" onSubmit={onSearch} className="mt-8 w-full max-w-2xl">
            <label htmlFor="hero-search" className="sr-only">{t.header.search}</label>
            <div className="group relative">
              <Search className="pointer-events-none absolute start-5 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
              <input
                id="hero-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.home.placeholder}
                className="field field-pill h-14 pe-32 ps-14 text-base shadow-lift hover:shadow-float focus:shadow-float sm:pe-32"
              />
              <Button type="submit" className="absolute end-2 top-1/2 -translate-y-1/2">{t.home.search}</Button>
            </div>
          </form>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to="/calendar?country=OM&intl=1" className="pressable chip border border-border/80 bg-surface px-3 py-1.5 text-sm font-semibold shadow-control hover:-translate-y-0.5">
              {COUNTRIES.OM.flag} {t.home.omanCalendar}
            </Link>
            <Link to="/explore?country=ARAB" className="pressable chip border border-border/80 bg-surface px-3 py-1.5 text-sm font-semibold shadow-control hover:-translate-y-0.5">
              {regionLabel("ARAB")}
            </Link>
            {CATEGORIES.slice(0, 6).map((c) => (
              <Link key={c.id} to={`/categories/${c.id}`} className="pressable rounded-full hover:-translate-y-0.5">
                <CategoryChip id={c.id} className="px-3 py-1.5 text-sm shadow-control ring-1 ring-inset ring-black/[.04] dark:ring-white/[.06]" />
              </Link>
            ))}
            <Button variant="ghost" size="sm" onClick={surprise}><Shuffle /> {t.header.surprise}</Button>
          </div>
        </div>
      </section>

      {/* ---------- Today + Spotlight (canvas) ---------- */}
      <div className="container-page section space-y-12 pt-10 sm:space-y-16 sm:pt-12">
        <section aria-labelledby="today-h">
          <SectionHeader id="today-h" eyebrow={t.home.todayEyebrow} title={t.home.todayTitle} subtitle={todays.length ? t.home.todaySub(todays.length, locale === "ar" ? f.date(today, { day: "numeric", month: "long" }) : `${f.month(today.getMonth())} ${today.getDate()}`) : t.home.quiet} to={`/calendar?date=${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`} linkLabel={t.home.openInCalendar} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(todays.length ? todays : next.slice(0, 3)).map((o, i) => (
              <EventCard key={o.event.id} occ={o} feature style={{ animationDelay: `${i * 40}ms` }} />
            ))}
          </div>
        </section>

        {/* ---------- Spotlight ---------- */}
        {spotlight && <Spotlight occ={spotlight} isToday={todays.includes(spotlight)} />}
      </div>

      {/* ---------- Upcoming + calendar preview (band) ---------- */}
      <div className="band">
        <Reveal as="section" className="container-page section grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-8 [&>*]:min-w-0" aria-label={t.home.upcomingAria}>
          <div>
            <SectionHeader eyebrow={t.home.upcomingEyebrow} title={t.home.upcomingTitle}
              subtitle={region ? t.home.upcomingRegion(regionLabel(region)) : t.home.upcomingAll}
              to={`/explore?${filtersToQuery({ ...regionFilters, ...presetRange("30d", today) })}`} />
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <label htmlFor="home-region" className="text-sm font-medium text-muted">{t.home.showFor}</label>
              <select id="home-region" className="field field-pill h-9 w-auto" value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">{t.home.everywhere}</option>
                <option value="OM">{COUNTRIES.OM.flag} {countryName("OM")}</option>
                <option value="GCC">{regionLabel("GCC")}</option>
                <option value="ARAB">{regionLabel("ARAB")}</option>
                {ARAB_LEAGUE.filter((c) => c !== "OM").map((c) => ({ ...COUNTRIES[c], name: countryName(c) })).sort((a, b) => f.compare(a.name, b.name))
                  .map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
            </div>
            <div key={region} className="animate-fade-in">
              <UpcomingList items={next} empty={<p className="card p-6 text-sm text-muted">{t.home.nothing45}</p>} />
            </div>
          </div>
          <div>
            <SectionHeader eyebrow={t.home.monthEyebrow} title={t.calendar.atGlance(f.month(today.getMonth()))} subtitle={t.home.tapDate} to={`/calendar?${filtersToQuery(regionFilters)}`} linkLabel={t.home.fullCalendar} />
            <MonthGrid
              year={today.getFullYear()} month={today.getMonth() + 1} selected={selected} today={today} index={index}
              onSelect={(d) => { setSelected(d); }}
              onNavigate={(d) => navigate(`/calendar?${filtersToQuery(regionFilters, { date: toISODate(d) })}`)}
              contentKey={region}
            />
            <DayPanel className="mt-3" headingLevel={3} date={selected} events={homeEvents} allEvents={EVENTS} filtered={!!region}
              onClearFilters={() => setRegion("")}
              onJump={(d) => (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() ? setSelected(d) : navigate(`/calendar?${filtersToQuery(regionFilters, { date: toISODate(d) })}`))} />
          </div>
        </Reveal>
      </div>

      {/* ---------- Countdowns + Featured (canvas) ---------- */}
      <div className="container-page section space-y-12 sm:space-y-16">
        <Reveal as="section" aria-labelledby="cd-h">
          <SectionHeader id="cd-h" eyebrow={t.home.savedEyebrow} title={t.home.countdownsTitle} subtitle={t.home.countdownsSub} to={countdowns.length ? "/favorites" : undefined} linkLabel={t.home.manageFavs} />
          {countdowns.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {countdowns.map((o) => (
                <Link key={o.event.id} to={`/event/${o.event.id}`} className="card card-interactive group relative flex flex-col gap-3 overflow-hidden p-5">
                  <span className={`card-tab ${CATEGORY_MAP[o.event.category].dot}`} aria-hidden />
                  <div className="flex items-center gap-3">
                    <CategoryIcon id={o.event.category} size="sm" />
                    <span className="line-clamp-2 text-sm font-semibold transition-colors group-hover:text-primary" {...fieldLang(ev(o.event), "name", locale)}>{ev(o.event).name}</span>
                  </div>
                  <Countdown occ={o} />
                  <span className="border-t border-border/50 pt-3 text-xs text-muted">{f.long(o.date)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-start gap-4 border-dashed p-6 shadow-none sm:flex-row sm:items-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300"><Heart className="size-6" aria-hidden /></span>
              <p className="flex-1 text-sm text-muted">{t.home.countdownsEmpty}</p>
              <Link to="/explore" className={buttonClasses("secondary")}>{t.home.findDays} <ArrowRight className="rtl:-scale-x-100" /></Link>
            </div>
          )}
        </Reveal>

        {/* ---------- Featured ---------- */}
        <Reveal as="section" aria-labelledby="feat-h">
          <SectionHeader id="feat-h" eyebrow={t.home.featuredEyebrow} title={t.home.featuredTitle} subtitle={t.home.featuredSub} to="/explore" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((o, i) => <EventCard key={o.event.id} occ={o} style={{ animationDelay: `${i * 40}ms` }} />)}
          </div>
        </Reveal>


        {/* ---------- Categories ---------- */}
        <Reveal as="section" aria-labelledby="cat-h">
          <SectionHeader id="cat-h" eyebrow={t.home.browseEyebrow} title={t.home.browseTitle} subtitle={t.home.browseSub} to="/categories" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((c) => (
              <Link key={c.id} to={`/categories/${c.id}`} className="card card-interactive group flex items-center gap-3 p-4">
                <CategoryIcon id={c.id} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold transition-colors group-hover:text-primary">{category(c.id).label}</div>
                  <div className="text-xs text-muted">{t.common.daysCount(EVENTS.filter((e) => e.category === c.id).length)}</div>
                </div>
              </Link>
            ))}
            <Link to="/calendar?view=year" className="card card-interactive group flex items-center gap-3 border-primary/25 bg-primary-soft/60 p-4 dark:bg-primary-soft/50">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-fg"><Sparkles className="size-5" aria-hidden /></span>
              <div className="text-sm font-semibold">{t.nav.yearGlance}</div>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function Spotlight({ occ, isToday }: { occ: Occurrence; isToday: boolean }) {
  const { t, f, ev, locale } = useI18n();
  const e = occ.event;
  const text = ev(e);
  const cat = CATEGORY_MAP[e.category];
  return (
    <Reveal as="section" aria-labelledby="spot-h" className="card card-feature relative overflow-hidden rounded-3xl p-6 shadow-lift sm:p-10">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70 dark:opacity-45 ${cat.tile}`} aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 end-0 hidden w-1/3 bg-gradient-to-l from-surface/60 to-transparent md:block rtl:bg-gradient-to-r" aria-hidden />
      <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="chip border border-border/60 bg-surface/85 text-primary shadow-control">
            <Sparkles className="size-3.5" aria-hidden /> {t.home.spotlight} · {isToday ? t.common.today : f.long(occ.date)}
          </p>
          <h2 id="spot-h" className="mt-4 text-3xl font-extrabold sm:text-4xl" {...fieldLang(text, "name", locale)}>{text.name}</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-fg/80 line-clamp-4 sm:line-clamp-none" {...fieldLang(text, "background", locale)}>{text.background}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <RecognitionBadge id={e.recognition} long />
            <CategoryChip id={e.category} />
          </div>
        </div>
        <div className="flex flex-row flex-wrap items-center gap-5 md:flex-col md:items-end">
          <DateLeaf date={occ.date} className="hidden -rotate-2 shadow-lift sm:flex rtl:rotate-2" />
          {!isToday && <Countdown occ={occ} />}
          <Link to={`/event/${e.id}`} className={buttonClasses("primary", "lg")}>{t.home.readStory} <ArrowRight className="rtl:-scale-x-100" /></Link>
        </div>
      </div>
    </Reveal>
  );
}

