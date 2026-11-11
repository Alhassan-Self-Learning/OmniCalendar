import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, CalendarClock, ChevronLeft, ExternalLink, Globe2, Landmark, Repeat, Shuffle } from "lucide-react";
import { EVENTS, EVENT_MAP } from "@/data/events";
import { useApp } from "@/context/AppContext";
import { nextOccurrence, occurrenceInYear, parseISODate } from "@/lib/dates";
import { fieldLang, useI18n } from "@/i18n/I18nContext";
import { CategoryChip, RecognitionBadge } from "@/components/events/Badges";
import { Countdown } from "@/components/events/Countdown";
import { DateLeaf } from "@/components/calendar/DateLeaf";
import { Reveal } from "@/lib/motion";
import { EventActions } from "@/components/events/EventActions";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/Button";
import { useSurprise } from "@/hooks/useSurprise";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import NotFoundPage from "./NotFoundPage";
import type { Occurrence } from "@/types";
import type { Formatter } from "@/i18n/format";

export default function EventPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const e = EVENT_MAP[id];
  const { today } = useApp();
  const { t, f, ev, locale, countryLabel, observedNote, showHijri } = useI18n();
  const surprise = useSurprise();
  const text = e ? ev(e) : null;
  useDocumentTitle(text?.name);

  const occ = useMemo(() => (e ? nextOccurrence(e, today) : null), [e, today]);
  const lastOcc = useMemo(() => {
    if (!e || occ) return null;
    for (let y = today.getFullYear(); y >= today.getFullYear() - 5; y--) { const o = occurrenceInYear(e, y); if (o) return o; }
    return null;
  }, [e, occ, today]);
  const future = useMemo(() => {
    if (!e || !occ) return [];
    return [1, 2, 3].map((n) => occurrenceInYear(e, occ.date.getFullYear() + n)).filter((o): o is Occurrence => !!o);
  }, [e, occ]);
  const related = useMemo(() => {
    if (!e) return [];
    const tags = new Set(e.tags ?? []);
    return EVENTS.filter((x) => x.id !== e.id)
      .map((x) => ({ x, s: (x.category === e.category ? 2 : 0) + (x.tags ?? []).filter((t) => tags.has(t)).length * 3 }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map((r) => nextOccurrence(r.x, today))
      .filter((o): o is Occurrence => !!o)
      .slice(0, 3);
  }, [e, today]);

  if (!e || !text) return <NotFoundPage />;
  const shown = occ ?? lastOcc;

  return (
    <article>
      <header className="page-hero">
        <div className="container-page pb-10 pt-8 sm:pb-12 sm:pt-12">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/explore" className="inline-flex min-h-10 items-center gap-1 text-[0.9375rem] font-medium text-muted hover:text-fg"><ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden /> {t.event.back}</Link>
            {params.get("surprise") && (
              <Button variant="outline" size="sm" className="ms-auto" onClick={surprise}><Shuffle /> {t.event.another}</Button>
            )}
          </div>
          <div className="mt-8 grid gap-10 md:grid-cols-[1fr_auto] md:items-end lg:gap-16">
            <div className="max-w-3xl">
              <h1 className="page-title" {...fieldLang(text, "name", locale)}>{text.name}</h1>
              <p className="lead mt-5" {...fieldLang(text, "summary", locale)}>{text.summary}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link to={`/categories/${e.category}`} className="underline-offset-4 hover:underline"><CategoryChip id={e.category} className="text-body" /></Link>
                <RecognitionBadge id={e.recognition} long />
              </div>
            </div>
            {occ && (
              <div className="flex items-end gap-6">
                <DateLeaf date={occ.date} red={e.recognition === "national"} className="card-feature -rotate-1 rtl:rotate-1" />
                <div className="pb-2">
                  <div className="meta-label">{occ.date <= today ? t.event.happening : t.event.nextOn}</div>
                  <div className="mt-1 font-semibold">{f.range(occ)}</div>
                  {showHijri && f.hijri(occ.date) && <div className="text-meta text-muted" title={t.common.hijriTitle}>{f.hijri(occ.date)}</div>}
                  <Countdown occ={occ} className="mt-3" />
                </div>
              </div>
            )}
          </div>
          <div className="mt-10 border-t border-border pt-6"><EventActions occ={shown} /></div>
        </div>
      </header>

      <div className="container-page grid gap-10 py-10 sm:py-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section aria-labelledby="bg-h">
            <h2 id="bg-h" className="section-title">{t.event.background}</h2>
            <p className="prose-text mt-4 max-w-[68ch] text-[1.0625rem] leading-relaxed" {...fieldLang(text, "background", locale)}>{text.background}</p>
          </section>

          {(e.note || shown?.estimated || e.rule.type === "hijri") && (
            <div className="well flex gap-3 p-5 text-body" role="note">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>
                {text.note ? <span {...fieldLang(text, "note", locale)}>{text.note}</span> : t.event.estimateDefault}
                {e.rule.type === "hijri" && shown && (shown.estimated ? t.event.hijriEstimated : t.event.hijriConfirmed)}
              </p>
            </div>
          )}

          {!occ && (
            <p className="well p-5 text-body text-muted">
              {e.rule.type === "once"
                ? t.event.tookPlace(lastOcc ? f.range(lastOcc) : null)
                : t.event.noUpcoming}
            </p>
          )}

          <section aria-labelledby="src-h">
            <h2 id="src-h" className="section-title">{t.event.sources}</h2>
            <p className="mt-2 text-body text-muted">{t.event.sourcesDesc}</p>
            <ul className="mt-4 space-y-2">
              {e.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="card card-interactive group flex min-h-12 items-center gap-3 px-4 py-3 text-[0.9375rem] hover:translate-y-0">
                    <ExternalLink className="size-4 shrink-0 text-muted" aria-hidden />
                    {/* Source titles are the publishers' own (English) names. */}
                    <span className="font-medium underline-offset-4 group-hover:underline" lang="en" dir="ltr">{s.label}</span>
                    <span className="ms-auto hidden truncate text-meta text-muted sm:block" dir="ltr">{new URL(s.url).hostname.replace(/^www\./, "")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label={t.event.details}>
          <dl className="card divide-y divide-border text-[0.9375rem]" data-ui>
            <Detail icon={Repeat} label={t.event.rule}>{f.rule(e.rule)}{e.durationDays && e.durationDays > 1 ? t.event.duration(e.durationDays) : ""}</Detail>
            {text.establishedBy && <Detail icon={Landmark} label={t.event.established}><span {...fieldLang(text, "establishedBy", locale)}>{text.establishedBy}</span></Detail>}
            <Detail icon={Globe2} label={t.event.where}>
              <ul className="space-y-0.5">{e.countries.map((c) => <li key={c}>{countryLabel(c)}</li>)}</ul>
            </Detail>
            {future.length > 0 && (
              <Detail icon={CalendarClock} label={t.event.future}>
                <ul className="space-y-0.5">{future.map((o) => <li key={o.date.getTime()}>{f.range(o)}{o.estimated && t.event.estSuffix}</li>)}</ul>
              </Detail>
            )}
          </dl>
          {e.observed && e.observed.length > 0 && (
            <section className="card p-4" aria-labelledby="obs-h">
              <h2 id="obs-h" className="meta-label mb-2 px-1">{t.event.announced}</h2>
              <ul className="space-y-2.5 text-sm">
                {[...e.observed].sort((a, b) => b.start.localeCompare(a.start)).map((h) => (
                  <li key={h.country + h.start} className="px-1">
                    <div className="font-medium">{countryLabel(h.country)} · {formatHolidayRange(h.start, h.end, f)}</div>
                    {h.note && <ObservedNote note={observedNote(h.country, h.start, h.note) ?? h.note} english={locale === "ar" && observedNote(h.country, h.start, h.note) === h.note} />}
                    <a href={h.source.url} target="_blank" rel="noopener noreferrer" lang="en" dir="ltr" className="block text-meta font-medium underline decoration-border-strong underline-offset-4 hover:decoration-primary">{h.source.label}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {e.tags && (
            <div className="flex flex-wrap gap-1.5">
              {/* Tags are English search keywords. */}
              {e.tags.map((tag) => <Link key={tag} to={`/explore?q=${encodeURIComponent(tag)}`} lang="en" dir="ltr" className="pressable chip bg-fg/[.05] text-muted hover:bg-fg/[.09] hover:text-fg">#{tag}</Link>)}
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <div className="container-page">
        <Reveal as="section" className="pt-12 sm:pt-16" aria-labelledby="rel-h">
                    <h2 id="rel-h" className="section-title mb-6">{t.event.related}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((o) => <EventCard key={o.event.id} occ={o} />)}
          </div>
        </Reveal>
        </div>
      )}
    </article>
  );
}

function formatHolidayRange(start: string, end: string | undefined, f: Formatter) {
  const s = parseISODate(start), en = end ? parseISODate(end) : null;
  if (!s) return start;
  const opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
  if (f.locale === "ar") return f.dateRange(s, en ?? s, opts);
  return en && en.getTime() !== s.getTime()
    ? `${f.date(s, { weekday: "short", day: "numeric", month: "short" })} – ${f.date(en, opts)}`
    : f.date(s, opts);
}

/** Holiday note; marked as English when no Arabic translation exists yet. */
function ObservedNote({ note, english }: { note: string; english: boolean }) {
  return <div className="text-xs text-muted" {...(english ? { lang: "en", dir: "ltr" } : {})}>{note}</div>;
}

/** One term/description pair. dt and dd sit directly in the <div> inside <dl>, so screen readers announce them as a pair. */
function Detail({ icon: Icon, label, children }: { icon: typeof Repeat; label: string; children: React.ReactNode }) {
  return (
    <div className="p-4">
      <dt className="flex items-center gap-3">
        <Icon className="size-4 shrink-0 text-muted" strokeWidth={1.75} aria-hidden />
        <span className="meta-label">{label}</span>
      </dt>
      <dd className="mt-1.5 ps-7">{children}</dd>
    </div>
  );
}
