import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import type { CategoryId, Recognition, SpecialDay } from "@/types";
import { COUNTRIES, REGIONS } from "@/data/countries";
import { prefersReducedMotion } from "@/lib/motion";
import { getFormatter, localizeDigits, type Formatter, type Locale, type Numerals } from "./format";
import { en, type Messages } from "./messages/en";
import { ar } from "./messages/ar";
import { COUNTRY_NAMES_AR, REGION_NAMES_AR } from "./countries-ar";
import { arabicFor, arabicLoaded, arabicObservedNote, loadArabic } from "./registry";

/*
 * Language state for the whole app: English (LTR) or Arabic (RTL).
 *  - Persisted in localStorage; first visit follows the browser language.
 *  - <html lang dir> is set before paint by index.html and kept in sync here, so the whole
 *    layout mirrors through CSS logical properties.
 *  - Switching cross-fades like the theme switch (View Transitions where available).
 *  - Arabic event content is a separate chunk, fetched before Arabic is shown so event
 *    names never flash in English.
 */

const KEYS = { lang: "omnicalendar:lang", numerals: "omnicalendar:numerals", hijri: "omnicalendar:hijri" };

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, v: string) {
  try { localStorage.setItem(key, v); } catch { /* ignore */ }
}

function initialLocale(): Locale {
  const stored = read(KEYS.lang);
  if (stored === "ar" || stored === "en") return stored;
  return typeof navigator !== "undefined" && /^ar\b/i.test(navigator.language) ? "ar" : "en";
}

// Start fetching Arabic content as soon as this module runs if the visitor will see Arabic.
const START_LOCALE = typeof window !== "undefined" ? initialLocale() : "en";
if (START_LOCALE === "ar") void loadArabic();

/** An event's display text in the current language, with the language each field is actually in. */
export interface EventText {
  name: string;
  summary: string;
  background: string;
  note?: string;
  establishedBy?: string;
  /** Field language — "en" when Arabic is active but the field has no translation yet. */
  langOf: (field: "name" | "summary" | "background" | "note" | "establishedBy") => Locale;
}

interface I18nState {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  numerals: Numerals;
  setNumerals: (n: Numerals) => void;
  /** Show Hijri dates next to Gregorian ones (calendar grid, date tiles, event page). */
  showHijri: boolean;
  setShowHijri: (v: boolean) => void;
  t: Messages;
  f: Formatter;
  ev: (e: SpecialDay) => EventText;
  observedNote: (country: string, start: string, fallback?: string) => string | undefined;
  countryName: (code: string) => string;
  /** "🇴🇲 Oman" / "🇴🇲 عُمان" */
  countryLabel: (code: string) => string;
  /** Country or region (ARAB, GCC) with its flag. */
  regionLabel: (code: string) => string;
  category: (id: CategoryId) => { label: string; description: string };
  recognition: (id: Recognition) => { label: string; short: string; description: string };
}

const Ctx = createContext<I18nState | null>(null);

/** Swap state inside a short cross-fade, matching the theme switch. */
function withTransition(commit: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (prefersReducedMotion() || !doc.startViewTransition) commit();
  else doc.startViewTransition(commit);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(START_LOCALE);
  const [ready, setReady] = useState(() => START_LOCALE === "en" || arabicLoaded());
  const [numerals, setNumeralsState] = useState<Numerals>(() => (read(KEYS.numerals) === "latn" ? "latn" : "arab"));
  const [hijriPref, setHijriPref] = useState<string | null>(() => read(KEYS.hijri));
  // Hijri dates are on by default in Arabic and off in English until the visitor chooses.
  const showHijri = hijriPref === null ? locale === "ar" : hijriPref === "1";

  useEffect(() => {
    if (!ready) loadArabic().then(() => setReady(true), () => setReady(true));
  }, [ready]);

  const f = useMemo(() => getFormatter(locale, numerals), [locale, numerals]);
  const t = useMemo(() => (locale === "ar" ? ar(f) : en(f)), [locale, f]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.lang = locale === "ar" ? "ar" : "en";
    root.dir = f.dir;
  }, [locale, f.dir]);

  const setLocale = useCallback((l: Locale) => {
    write(KEYS.lang, l);
    const commit = () => withTransition(() => flushSync(() => setLocaleState(l)));
    if (l === "ar" && !arabicLoaded()) loadArabic().then(commit, commit);
    else commit();
  }, []);
  const setNumerals = useCallback((n: Numerals) => { write(KEYS.numerals, n); setNumeralsState(n); }, []);
  const setShowHijri = useCallback((v: boolean) => { write(KEYS.hijri, v ? "1" : "0"); setHijriPref(v ? "1" : "0"); }, []);

  const value = useMemo<I18nState>(() => {
    const isAr = locale === "ar";
    const countryName = (code: string) => (isAr ? COUNTRY_NAMES_AR[code] : undefined) ?? COUNTRIES[code]?.name ?? code;
    const countryLabel = (code: string) => {
      const c = COUNTRIES[code];
      return c ? `${c.flag} ${countryName(code)}` : code;
    };
    const regionLabel = (code: string) => {
      const r = REGIONS[code];
      return r ? `${r.flag} ${(isAr ? REGION_NAMES_AR[code] : undefined) ?? r.name}` : countryLabel(code);
    };
    const digits = (s: string) => localizeDigits(s, numerals);
    // Resolved texts are cached per event for this language/digit setting — cards call ev() often.
    const cache = new Map<string, EventText>();
    const ev = (e: SpecialDay): EventText => {
      const hit = cache.get(e.id);
      if (hit) return hit;
      const a = isAr ? arabicFor(e.id) : undefined;
      const pick = (k: "name" | "summary" | "background" | "note" | "establishedBy") => (a?.[k] ? "ar" : "en") as Locale;
      const ar = (v: string | undefined) => (v ? digits(v) : undefined);
      const text: EventText = {
        name: ar(a?.name) || e.name,
        summary: ar(a?.summary) || e.summary,
        background: ar(a?.background) || e.background,
        note: e.note ? ar(a?.note) || e.note : undefined,
        establishedBy: e.establishedBy ? ar(a?.establishedBy) || e.establishedBy : undefined,
        langOf: isAr ? pick : () => "en",
      };
      cache.set(e.id, text);
      return text;
    };
    return {
      locale, dir: f.dir, setLocale, numerals, setNumerals, showHijri, setShowHijri, t, f, ev,
      observedNote: (country, start, fallback) => {
        const note = isAr ? arabicObservedNote(country, start) : undefined;
        return note ? digits(note) : fallback;
      },
      countryName, countryLabel, regionLabel,
      category: (id) => t.categories[id],
      recognition: (id) => t.recognitions[id],
    };
    // `ready` is a dependency so event text re-resolves once the Arabic chunk registers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, f, t, numerals, showHijri, setLocale, setNumerals, setShowHijri, ready]);

  if (!ready) {
    return <div className="container-page py-20 text-center text-sm text-muted" role="status">{t.app.loading}</div>;
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n must be used inside <I18nProvider>");
  return v;
}

/**
 * Props for an element showing a translatable field: when Arabic is active but the field is still
 * English, mark it so screen readers switch voice and the text lays out left-to-right.
 */
export function fieldLang(text: EventText, field: Parameters<EventText["langOf"]>[0], locale: Locale) {
  return locale === "ar" && text.langOf(field) === "en" ? ({ lang: "en", dir: "ltr" } as const) : {};
}
