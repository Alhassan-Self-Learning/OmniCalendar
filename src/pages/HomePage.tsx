import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Search, Shuffle } from "lucide-react";
import { EVENTS, EVENT_MAP, FEATURED_IDS } from "@/data/events";
import { CATEGORIES } from "@/data/categories";
import { useApp, useFilterMemory } from "@/context/AppContext";
import { diffInDays, nextOccurrence, occurrencesOn, sameDay, toISODate, upcoming } from "@/lib/dates";
import { EMPTY_FILTERS, filterEvents, filtersToQuery, parseFilters, presetRange } from "@/lib/filters";
import { ARAB_LEAGUE, COUNTRIES } from "@/data/countries";
import { fieldLang, useI18n } from "@/i18n/I18nContext";
import { DayPanel } from "@/components/discovery/DayPanel";
import { UpcomingList } from "@/components/discovery/UpcomingList";
import { hashString } from "@/lib/utils";
import { CategoryChip, CategoryStamp, RecognitionBadge, ScopeBadge } from "@/components/events/Badges";
import { Countdown } from "@/components/events/Countdown";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button, buttonClasses } from "@/components/ui/Button";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { DateLeaf } from "@/components/calendar/DateLeaf";
import { TearOffLeaf } from "@/components/calendar/TearOffLeaf";
import { useDayIndex } from "@/components/calendar/useDayIndex";
import { useSurprise } from "@/hooks/useSurprise";
import { Reveal } from "@/lib/motion";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { Occurrence } from "@/types";

/** Countries and regions that actually have days in the data (worldwide days excluded). */
const COUNTRY_COUNT = new Set(EVENTS.flatMap((e) => e.countries).filter((c) => c !== "GLOBAL")).size;

export default function HomePage() {
  useDocumentTitle();
  const { today, favorites } = useApp();
  const { t, f, countryName, regionLabel, category } = useI18n();
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
    return favorites.map((id) => EVENT_MAP[id] && nextOccurrence(EVENT_MAP[id], today))
      .filter((o): o is Occurrence => !!o)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 4);
  }, [favorites, today]);
  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c.id, EVENTS.filter((e) => e.category === c.id).length])), []);

  const index = useDayIndex(homeEvents, today.getFullYear());
  const [selected, setSelected] = useState(today);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/explore${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  return (
    <div>
      {/* ---------- Hero: the title and search beside today's leaf ---------- */}
      <section className="container-page grid items-center gap-x-12 gap-y-14 pb-20 pt-12 sm:pt-16 lg:grid-cols-12 lg:pb-28 lg:pt-20">
        <div className="lg:col-span-7">
          <h1 className="animate-rise text-display font-bold">
            {t.home.heroA}{t.home.heroB}
          </h1>
          <p className="lead mt-6 animate-rise [animation-delay:80ms] sm:mt-8">{t.home.lead}</p>
          <form role="search" onSubmit={onSearch} className="mt-10 max-w-2xl animate-rise [animation-delay:160ms]">
            <label htmlFor="hero-search" className="sr-only">{t.header.search}</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
                <input
                  id="hero-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t.home.placeholder}
                  className="field h-14 ps-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-7">{t.home.search}</Button>
            </div>
          </form>
          <div className="mt-5 flex flex-wrap items-center gap-2 animate-rise [animation-delay:220ms]">
            <Link to="/calendar?country=OM&intl=1" className={buttonClasses("outline", "md")}>{COUNTRIES.OM.flag} {t.home.omanCalendar}</Link>
            <Link to="/explore?country=ARAB" className={buttonClasses("outline", "md")}>{regionLabel("ARAB")}</Link>
            <Button variant="ghost" onClick={surprise}><Shuffle /> {t.header.surprise}</Button>
          </div>
          <dl className="perf mt-14 grid max-w-2xl grid-cols-3 gap-6 pt-8 animate-rise [animation-delay:280ms]">
            <Fact value={f.num(EVENTS.length)} label={t.home.factDays} />
            <Fact value={f.num(COUNTRY_COUNT)} label={t.home.factCountries} />
            <Fact value={f.num(CATEGORIES.length)} label={t.home.factThemes} />
          </dl>
        </div>
        <div className="animate-rise [animation-delay:120ms] lg:col-span-5">
          <TearOffLeaf today={today} events={homeEvents} />
        </div>
      </section>

      {/* ---------- Coming up + this month ---------- */}
      <div className="band">
        <Reveal as="section" className="container-page section grid gap-14 lg:grid-cols-12 lg:gap-12 [&>*]:min-w-0" aria-label={t.home.upcomingAria}>
          <div className="lg:col-span-5">
            <SectionHeader title={t.home.upcomingTitle}
              subtitle={region ? t.home.upcomingRegion(regionLabel(region)) : t.home.upcomingAll}
              to={`/explore?${filtersToQuery({ ...regionFilters, ...presetRange("30d", today) })}`} />
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label htmlFor="home-region" className="text-body font-medium">{t.home.showFor}</label>
              <select id="home-region" className="field h-10 w-auto" value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">{t.home.everywhere}</option>
                <option value="OM">{COUNTRIES.OM.flag} {countryName("OM")}</option>
                <option value="GCC">{regionLabel("GCC")}</option>
                <option value="ARAB">{regionLabel("ARAB")}</option>
                {ARAB_LEAGUE.filter((c) => c !== "OM").map((c) => ({ ...COUNTRIES[c], name: countryName(c) })).sort((a, b) => f.compare(a.name, b.name))
                  .map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
            </div>
            <div key={region} className="animate-fade-in">
              <UpcomingList items={next} empty={<p className="card p-6 text-body text-muted">{t.home.nothing45}</p>} />
            </div>
          </div>
          <div className="lg:col-span-7">
            <SectionHeader title={t.calendar.atGlance(f.month(today.getMonth()))} subtitle={t.home.tapDate} to={`/calendar?${filtersToQuery(regionFilters)}`} linkLabel={t.home.fullCalendar} />
            <MonthGrid
              year={today.getFullYear()} month={today.getMonth() + 1} selected={selected} today={today} index={index}
              onSelect={(d) => { setSelected(d); }}
              onNavigate={(d) => navigate(`/calendar?${filtersToQuery(regionFilters, { date: toISODate(d) })}`)}
              contentKey={region}
            />
            <DayPanel className="mt-4" headingLevel={3} date={selected} events={homeEvents} allEvents={EVENTS} filtered={!!region}
              onClearFilters={() => setRegion("")}
              onJump={(d) => (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() ? setSelected(d) : navigate(`/calendar?${filtersToQuery(regionFilters, { date: toISODate(d) })}`))} />
          </div>
        </Reveal>
      </div>

      {/* ---------- Spotlight: the page's one red band ---------- */}
      {spotlight && <Spotlight occ={spotlight} isToday={todays.includes(spotlight)} />}

      {/* ---------- Countdowns ---------- */}
      <div className="container-page section">
        <Reveal as="section" aria-labelledby="cd-h">
          <SectionHeader id="cd-h" title={t.home.countdownsTitle} subtitle={t.home.countdownsSub} to={countdowns.length ? "/favorites" : undefined} linkLabel={t.home.manageFavs} />
          {countdowns.length ? (
            <ol className="grid gap-px overflow-hidden rounded border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {countdowns.map((o) => <CountdownSlip key={o.event.id} occ={o} />)}
            </ol>
          ) : (
            <div className="card flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
              <Heart className="size-7 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
              <p className="max-w-[62ch] flex-1 text-body">{t.home.countdownsEmpty}</p>
              <Link to="/explore" className={buttonClasses("ink")}>{t.home.findDays} <ArrowRight className="rtl:-scale-x-100" /></Link>
            </div>
          )}
        </Reveal>
      </div>

      {/* ---------- Featured: a ledger of the year's red-letter days ---------- */}
      <div className="container-page pb-16 sm:pb-20 lg:pb-24">
        <Reveal as="section" aria-labelledby="feat-h">
          <SectionHeader id="feat-h" title={t.home.featuredTitle} subtitle={t.home.featuredSub} to="/explore" />
          <ol className="grid gap-x-12 md:grid-cols-2">
            {featured.map((o) => <LedgerRow key={o.event.id} occ={o} today={today} />)}
          </ol>
        </Reveal>
      </div>

      {/* ---------- Categories as a typographic index ---------- */}
      <div className="band">
        <Reveal as="section" className="container-page section" aria-labelledby="cat-h">
          <SectionHeader id="cat-h" title={t.home.browseTitle} subtitle={t.home.browseSub} to="/categories" />
          <ul className="flex flex-wrap items-baseline gap-x-10 gap-y-5">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link to={`/categories/${c.id}`} className="group inline-flex items-baseline gap-3">
                  <CategoryStamp id={c.id} className="size-3 -translate-y-1" />
                  <span className="text-[clamp(1.75rem,3.4vw,3rem)] font-bold leading-tight tracking-[-0.03em] decoration-primary decoration-[3px] underline-offset-8 group-hover:underline">
                    {category(c.id).label}
                    <sup className="ms-1.5 align-super text-[0.8125rem] font-semibold tracking-normal tabular-nums text-muted no-underline">{f.num(counts[c.id])}</sup>
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/calendar?view=year" className="group inline-flex items-baseline gap-3">
                <span className="text-[clamp(1.75rem,3.4vw,3rem)] font-bold leading-tight tracking-[-0.03em] text-primary decoration-[3px] underline-offset-8 group-hover:underline">
                  {t.nav.yearGlance}
                </span>
                <ArrowRight className="size-6 self-center text-primary rtl:-scale-x-100" aria-hidden />
              </Link>
            </li>
          </ul>
        </Reveal>
      </div>
    </div>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="mt-2 text-meta text-muted">{label}</dt>
      <dd className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-none tracking-[-0.03em] tabular-nums">{value}</dd>
    </div>
  );
}

/** The day's story, set on the page's one solid red field with its leaf. */
function Spotlight({ occ, isToday }: { occ: Occurrence; isToday: boolean }) {
  const { t, f, ev, locale, recognition } = useI18n();
  const e = occ.event;
  const text = ev(e);
  return (
    <section aria-labelledby="spot-h" className="on-field bg-[rgb(var(--field-ground))] text-[rgb(var(--field-ink))]">
      <Reveal className="container-page grid items-center gap-12 py-20 md:grid-cols-[auto_1fr] lg:gap-20 lg:py-28">
        <DateLeaf date={occ.date} size="lg" red={e.recognition === "national"} className="-rotate-2 justify-self-start text-fg rtl:rotate-2" />
        <div className="max-w-3xl">
          <h2 id="spot-h" className="text-[clamp(2.25rem,4.6vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em]" {...fieldLang(text, "name", locale)}>{text.name}</h2>
          <p className="mt-4 text-body font-medium text-white/85">{t.home.spotlightOn(isToday ? t.common.today : f.long(occ.date))} · {recognition(e.recognition).label}</p>
          <p className="mt-6 max-w-[62ch] text-lead leading-relaxed text-white/90 line-clamp-6 sm:line-clamp-none" {...fieldLang(text, "background", locale)}>{text.background}</p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link to={`/event/${e.id}`} className="inline-flex h-12 items-center gap-2 rounded bg-white px-6 font-semibold text-[#141414] transition-transform hover:-translate-y-0.5 active:scale-[.97]">
              {t.home.readStory} <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
            </Link>
            {!isToday && <Countdown occ={occ} className="[&_*]:!text-white" />}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/** A saved day with its countdown printed large. */
function CountdownSlip({ occ }: { occ: Occurrence }) {
  const { today } = useApp();
  const { t, f, ev, locale } = useI18n();
  const n = diffInDays(today, occ.date);
  const active = n <= 0;
  const text = ev(occ.event);
  return (
    <li className="group relative flex flex-col bg-surface p-6">
      <span className={active ? "text-section font-bold text-primary" : "text-[3.5rem] font-bold leading-none tracking-[-0.04em] tabular-nums"}>
        {active ? (n === 0 ? t.countdown.today : t.countdown.now) : f.num(n)}
      </span>
      {!active && <span className="mt-1 text-meta text-muted">{t.countdown.toGo(n)}</span>}
      <Link to={`/event/${occ.event.id}`} className="mt-6 font-semibold leading-snug decoration-primary decoration-2 underline-offset-4 after:absolute after:inset-0 after:content-[''] group-hover:underline" {...fieldLang(text, "name", locale)}>
        {text.name}
      </Link>
      <span className="mt-1 text-meta text-muted">{f.long(occ.date)}</span>
    </li>
  );
}

/** A ledger line: the date set large at the start, then the day and what it is. */
function LedgerRow({ occ, today }: { occ: Occurrence; today: Date }) {
  const { f, ev, locale } = useI18n();
  const e = occ.event;
  const text = ev(e);
  const red = e.recognition === "national";
  return (
    <li className="perf group relative grid grid-cols-[5.5rem_1fr] gap-5 py-7 sm:grid-cols-[7rem_1fr]">
      <time dateTime={toISODate(occ.date)} className="leading-none">
        <span className={`block text-[2.75rem] font-bold tracking-[-0.04em] tabular-nums sm:text-[3.25rem] ${red ? "text-primary" : ""}`}>{f.num(occ.date.getDate())}</span>
        <span className="mt-1.5 block text-meta font-medium text-muted">{f.date(occ.date, { month: "long" })}</span>
      </time>
      <div className="min-w-0">
        <h3 className="text-lead font-bold leading-snug" {...fieldLang(text, "name", locale)}>
          <Link to={`/event/${e.id}`} className="decoration-primary decoration-2 underline-offset-4 after:absolute after:inset-0 after:content-[''] group-hover:underline">{text.name}</Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-body text-fg/80" {...fieldLang(text, "summary", locale)}>{text.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-meta font-semibold">{f.relative(occ.date, today)}</span>
          <CategoryChip id={e.category} />
          <RecognitionBadge id={e.recognition} />
          <ScopeBadge countries={e.countries} max={2} />
        </div>
      </div>
    </li>
  );
}
