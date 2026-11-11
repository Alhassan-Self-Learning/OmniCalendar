import type { DateRule, Occurrence } from "@/types";
import {
  describeRule, formatHijri, formatLong, formatRange, formatShort, hijriParts, MONTH_NAMES, relativeLabel, sameDay, WEEKDAY_NAMES, diffInDays,
} from "@/lib/dates";

/*
 * Locale-aware formatting. Every date, number and rule description the UI shows goes through
 * one Formatter, so switching language (or Arabic numerals) changes them all from one place.
 *
 * English keeps the original behaviour exactly (browser-default date locale, English rule text);
 * Arabic uses Omani Arabic conventions: Gregorian calendar with Arabic month names, Arabic-Indic
 * digits by default, weeks starting on Saturday, Umm al-Qura for Hijri dates.
 */

export type Locale = "en" | "ar";
/** Digit shapes used in Arabic: Arabic-Indic (١٢٣) or Western (123). */
export type Numerals = "arab" | "latn";

export const HIJRI_MONTHS_AR = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
  "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
];

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
/**
 * Show the 0–9 digits of Arabic prose (event descriptions) in the reader's digit style, including
 * the Arabic decimal (٫) and thousands (٬) separators between digits.
 */
export function localizeDigits(s: string, numerals: Numerals): string {
  if (numerals !== "arab" || !/[0-9]/.test(s)) return s;
  return s
    .replace(/(\d)\.(?=\d)/g, "$1٫")
    .replace(/(\d),(?=\d{3}\b)/g, "$1٬")
    .replace(/[0-9]/g, (d) => AR_DIGITS[+d]);
}

/** Unicode first-strong isolate: keeps an interpolated name (often in the other script) from re-ordering the sentence around it. */
export const isolate = (s: string) => `⁨${s}⁩`;

type ArForms = { one: string; two: string; few: string; many: string; other: string; zero?: string };
const arRules = new Intl.PluralRules("ar");

/**
 * Arabic counted noun. `forms` use {n} for the number:
 *   one "يوم واحد" · two "يومان" · few (3–10) "{n} أيام" · many (11–99) "{n} يومًا" · other (100…) "{n} يوم".
 */
export function arPlural(n: number, num: (x: number) => string, forms: ArForms): string {
  const cat = n === 0 && forms.zero ? "zero" : arRules.select(n);
  const tpl = (forms as Record<string, string | undefined>)[cat] ?? forms.other;
  return tpl.replace("{n}", num(n));
}

export interface Formatter {
  locale: Locale;
  dir: "ltr" | "rtl";
  /** BCP 47 tag for Intl, or undefined for the browser default (original English behaviour). */
  tag: string | undefined;
  /** First column of month grids: Monday for English (as before), Saturday for Arabic (Oman). */
  weekStart: 0 | 1 | 6;
  num(n: number): string;
  date(d: Date, o: Intl.DateTimeFormatOptions): string;
  /** "Monday, October 26, 2026" */
  long(d: Date): string;
  /** "Oct 26" */
  short(d: Date): string;
  range(o: Occurrence): string;
  /** Inclusive date range, e.g. holiday periods; collapses to one date when start = end. */
  dateRange(a: Date, b: Date, o?: Intl.DateTimeFormatOptions): string;
  /** Gregorian month name, index 0–11. */
  month(i: number): string;
  monthYear(year: number, month1: number): string;
  weekday(i: number, width: "long" | "short" | "narrow"): string;
  relative(d: Date, today: Date): string;
  /** Hijri date (Umm al-Qura), e.g. "١٢ ربيع الأول ١٤٤٨ هـ". */
  hijri(d: Date): string | null;
  /** Hijri date without the year, e.g. "١٢ ربيع الأول". */
  hijriShort(d: Date): string | null;
  hijriDay(d: Date): string | null;
  hijriMonthName(month1: number): string;
  /** Hijri month(s) spanned by a Gregorian month, e.g. "جمادى الأولى – جمادى الآخرة ١٤٤٨ هـ". */
  hijriSpan(year: number, month1: number): string | null;
  rule(rule: DateRule): string;
  list(items: string[]): string;
  compare(a: string, b: string): number;
  /** Days as a counted noun: "3 days" / "٣ أيام". */
  days(n: number): string;
}

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function dtf(tag: string | undefined, o: Intl.DateTimeFormatOptions) {
  const key = `${tag ?? ""}|${JSON.stringify(o)}`;
  let f = dtfCache.get(key);
  if (!f) { f = new Intl.DateTimeFormat(tag, o); dtfCache.set(key, f); }
  return f;
}

const HIJRI_MONTHS_EN_FALLBACK = ["Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qadah", "Dhu al-Hijjah"];

function hijriSpanWith(year: number, month1: number, name: (m: number) => string, num: (n: number) => string, era: string): string | null {
  const first = hijriParts(new Date(year, month1 - 1, 1));
  const last = hijriParts(new Date(year, month1, 0));
  if (!first || !last) return null;
  const a = `${name(first.month)}${first.year !== last.year ? ` ${num(first.year)}` : ""}`;
  return first.month === last.month ? `${a} ${num(last.year)} ${era}` : `${a} – ${name(last.month)} ${num(last.year)} ${era}`;
}

// ---------------------------------------------------------------------------
// English — delegates to the original helpers so existing output is unchanged.
// ---------------------------------------------------------------------------
function english(): Formatter {
  const num = (n: number) => String(n);
  return {
    locale: "en", dir: "ltr", tag: undefined, weekStart: 1,
    num,
    date: (d, o) => d.toLocaleDateString(undefined, o),
    long: formatLong,
    short: formatShort,
    range: formatRange,
    dateRange: (a, b, o = { day: "numeric", month: "short", year: "numeric" }) => {
      if (sameDay(a, b)) return a.toLocaleDateString(undefined, o);
      const { year: _y, ...noYear } = o;
      void _y;
      return `${a.toLocaleDateString(undefined, a.getFullYear() === b.getFullYear() ? noYear : o)} – ${b.toLocaleDateString(undefined, o)}`;
    },
    month: (i) => MONTH_NAMES[i],
    monthYear: (y, m) => `${MONTH_NAMES[m - 1]} ${y}`,
    weekday: (i, w) => (w === "long" ? WEEKDAY_NAMES[i] : w === "short" ? WEEKDAY_NAMES[i].slice(0, 3) : WEEKDAY_NAMES[i].slice(0, 1)),
    relative: relativeLabel,
    hijri: formatHijri,
    hijriShort: (d) => { const h = hijriParts(d); return h ? `${h.day} ${HIJRI_MONTHS_EN_FALLBACK[h.month - 1]}` : null; },
    hijriDay: (d) => { const h = hijriParts(d); return h ? String(h.day) : null; },
    hijriMonthName: (m) => HIJRI_MONTHS_EN_FALLBACK[m - 1],
    hijriSpan: (y, m) => hijriSpanWith(y, m, (x) => HIJRI_MONTHS_EN_FALLBACK[x - 1], num, "AH"),
    rule: describeRule,
    list: (items) => (items.length < 2 ? items.join("") : new Intl.ListFormat("en", { type: "conjunction" }).format(items)),
    compare: (a, b) => a.localeCompare(b),
    days: (n) => `${n} ${n === 1 ? "day" : "days"}`,
  };
}

// ---------------------------------------------------------------------------
// Arabic
// ---------------------------------------------------------------------------
const AR_ORD = ["", "الأول", "الثاني", "الثالث", "الرابع", "الخامس"];

function arabic(numerals: Numerals): Formatter {
  const tag = `ar-OM-u-ca-gregory-nu-${numerals}`;
  const nf = new Intl.NumberFormat(`ar-OM-u-nu-${numerals}`, { useGrouping: false });
  const num = (n: number) => nf.format(n);
  const date = (d: Date, o: Intl.DateTimeFormatOptions) => dtf(tag, o).format(d);
  const month = (i: number) => date(new Date(2000, i, 1), { month: "long" });
  const weekday = (i: number, w: "long" | "short" | "narrow") => date(new Date(2023, 0, 1 + i), { weekday: w === "short" ? "long" : w }); // 1 Jan 2023 = Sunday
  const days = (n: number) => arPlural(n, num, { one: "يوم واحد", two: "يومان", few: "{n} أيام", many: "{n} يومًا", other: "{n} يوم" });
  /** "بيوم واحد" / "بيومين" / "بـ٢١ يومًا" — the counted noun after the preposition بـ. */
  const byDays = (n: number) => (n === 1 ? "بيوم واحد" : n === 2 ? "بيومين" : `بـ${days(n)}`);
  const longOpts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
  const rangeFmt = (a: Date, b: Date, o: Intl.DateTimeFormatOptions) => {
    const f = dtf(tag, o);
    return typeof f.formatRange === "function" ? f.formatRange(a, b) : `${f.format(a)} – ${f.format(b)}`;
  };
  const hName = (m: number) => HIJRI_MONTHS_AR[m - 1];
  const easterText = (name: string, offset: number) =>
    offset === 0 ? `${name} (موعد متغيّر)` : `${offset < 0 ? "قبل" : "بعد"} ${name} ${byDays(Math.abs(offset))} (موعد متغيّر)`;

  return {
    locale: "ar", dir: "rtl", tag, weekStart: 6,
    num,
    date,
    long: (d) => date(d, longOpts),
    short: (d) => date(d, { day: "numeric", month: "short" }),
    range: (o) => (sameDay(o.date, o.endDate) ? date(o.date, longOpts) : rangeFmt(o.date, o.endDate, { day: "numeric", month: "long", year: "numeric" })),
    dateRange: (a, b, o = { day: "numeric", month: "short", year: "numeric" }) => (sameDay(a, b) ? date(a, o) : rangeFmt(a, b, o)),
    month,
    monthYear: (y, m) => date(new Date(y, m - 1, 1), { month: "long", year: "numeric" }),
    weekday,
    relative: (d, today) => {
      const n = diffInDays(today, d);
      if (n === 0) return "اليوم";
      if (n === 1) return "غدًا";
      if (n === -1) return "أمس";
      if (n === 2) return "بعد يومين";
      if (n === -2) return "قبل يومين";
      return n > 0 ? `بعد ${days(n)}` : `قبل ${days(-n)}`;
    },
    hijri: (d) => { const h = hijriParts(d); return h ? `${num(h.day)} ${hName(h.month)} ${num(h.year)} هـ` : null; },
    hijriShort: (d) => { const h = hijriParts(d); return h ? `${num(h.day)} ${hName(h.month)}` : null; },
    hijriDay: (d) => { const h = hijriParts(d); return h ? num(h.day) : null; },
    hijriMonthName: hName,
    hijriSpan: (y, m) => hijriSpanWith(y, m, hName, num, "هـ"),
    rule: (rule) => {
      switch (rule.type) {
        case "fixed":
          return `سنويًا في ${num(rule.day)} ${month(rule.month - 1)}${rule.month === 2 && rule.day === 29 ? " (في السنوات الكبيسة فقط)" : ""}`;
        case "nth-weekday":
          return rule.n === -1
            ? `آخر ${weekday(rule.weekday, "long").replace(/^ال/, "")} من ${month(rule.month - 1)}`
            : `${weekday(rule.weekday, "long")} ${AR_ORD[rule.n]} من ${month(rule.month - 1)}`;
        case "easter":
          return easterText("أحد الفصح", rule.offset);
        case "day-of-year":
          return `اليوم ${num(rule.day)} من السنة`;
        case "table":
          return rule.estimated ? "يتبع تقويمًا قمريًا — التواريخ تقديرية" : "يتبع تقويمًا قمريًا";
        case "once":
          return "حدث لمرة واحدة";
        case "hijri":
          return `${num(rule.day)} ${hName(rule.month)} (التقويم الهجري) — التواريخ تقديرية حتى الإعلان الرسمي`;
        case "orthodox-easter":
          return easterText("أحد الفصح الأرثوذكسي", rule.offset);
      }
    },
    list: (items) => (items.length < 2 ? items.join("") : new Intl.ListFormat("ar", { type: "conjunction" }).format(items)),
    compare: (a, b) => a.localeCompare(b, "ar"),
    days,
  };
}

const cache = new Map<string, Formatter>();
export function getFormatter(locale: Locale, numerals: Numerals = "arab"): Formatter {
  const key = locale === "ar" ? `ar|${numerals}` : "en";
  let f = cache.get(key);
  if (!f) { f = locale === "ar" ? arabic(numerals) : english(); cache.set(key, f); }
  return f;
}
