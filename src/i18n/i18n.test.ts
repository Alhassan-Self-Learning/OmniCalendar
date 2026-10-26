import { describe, expect, it } from "vitest";
import { EVENTS, EVENT_MAP } from "@/data/events";
import { makeDate } from "@/lib/dates";
import { scoreEvent } from "@/lib/search";
import { filterChips, parseFilters } from "@/lib/filters";
import { arPlural, getFormatter, localizeDigits } from "./format";
import { en } from "./messages/en";
import { ar } from "./messages/ar";
import { EVENTS_AR, OBSERVED_AR } from "./events-ar";
import { registerArabic } from "./registry";

const AR = getFormatter("ar", "arab");
const AR_LATN = getFormatter("ar", "latn");
const EN = getFormatter("en");

describe("Arabic formatter", () => {
  it("formats Gregorian dates with Arabic month names and Arabic-Indic digits", () => {
    expect(AR.long(makeDate(2026, 10, 26))).toBe("الاثنين، ٢٦ أكتوبر ٢٠٢٦");
    expect(AR_LATN.short(makeDate(2026, 11, 18))).toBe("18 نوفمبر");
    expect(AR.monthYear(2026, 12)).toBe("ديسمبر ٢٠٢٦");
  });
  it("starts weeks on Saturday in Arabic and Monday in English", () => {
    expect(AR.weekStart).toBe(6);
    expect(EN.weekStart).toBe(1);
    expect(AR.weekday(6, "long")).toBe("السبت");
  });
  it("formats Hijri dates in Arabic", () => {
    expect(AR.hijri(makeDate(2026, 8, 25))).toBe("١٢ ربيع الأول ١٤٤٨ هـ");
    expect(AR_LATN.hijriShort(makeDate(2026, 8, 25))).toBe("12 ربيع الأول");
    expect(AR.hijriSpan(2026, 12)).toContain("جمادى الآخرة");
  });
  it("uses Arabic relative dates with the dual form", () => {
    const t = makeDate(2026, 10, 26);
    expect(AR.relative(t, t)).toBe("اليوم");
    expect(AR.relative(makeDate(2026, 10, 28), t)).toBe("بعد يومين");
    expect(AR.relative(makeDate(2026, 11, 2), t)).toBe("بعد ٧ أيام");
    expect(AR.relative(makeDate(2026, 11, 20), t)).toBe("بعد ٢٥ يومًا");
  });
  it("describes date rules in Arabic", () => {
    expect(AR_LATN.rule({ type: "nth-weekday", month: 5, weekday: 0, n: 2 })).toBe("الأحد الثاني من مايو");
    expect(AR_LATN.rule({ type: "nth-weekday", month: 11, weekday: 4, n: -1 })).toBe("آخر خميس من نوفمبر");
    expect(AR_LATN.rule({ type: "easter", offset: -21 })).toBe("قبل أحد الفصح بـ21 يومًا (موعد متغيّر)");
    expect(AR_LATN.rule({ type: "fixed", month: 11, day: 18 })).toBe("سنويًا في 18 نوفمبر");
  });
  it("keeps the English formatter's original output", () => {
    expect(EN.rule({ type: "nth-weekday", month: 5, weekday: 0, n: 2 })).toBe("Second Sunday of May");
    expect(EN.relative(makeDate(2026, 11, 7), makeDate(2026, 10, 26))).toBe("In 12 days");
    expect(EN.hijri(makeDate(2026, 8, 25))).toBe("12 Rabi al-Awwal 1448 AH");
  });
});

describe("Arabic plurals and digits", () => {
  const n = (x: number) => String(x);
  const forms = { one: "يوم واحد", two: "يومان", few: "{n} أيام", many: "{n} يومًا", other: "{n} يوم" };
  it("picks the right plural form", () => {
    expect([1, 2, 3, 10, 11, 99, 100, 102].map((x) => arPlural(x, n, forms))).toEqual(
      ["يوم واحد", "يومان", "3 أيام", "10 أيام", "11 يومًا", "99 يومًا", "100 يوم", "102 يوم"],
    );
  });
  it("converts prose digits only when Arabic-Indic numerals are chosen", () => {
    expect(localizeDigits("عام 1582 و365.2422 يومًا و350,000 شخص", "arab")).toBe("عام ١٥٨٢ و٣٦٥٫٢٤٢٢ يومًا و٣٥٠٬٠٠٠ شخص");
    expect(localizeDigits("عام 1582", "latn")).toBe("عام 1582");
  });
  it("has messages for every key in both languages", () => {
    const keys = (o: object, p = ""): string[] => Object.entries(o).flatMap(([k, v]) =>
      v && typeof v === "object" && !Array.isArray(v) ? keys(v, `${p}${k}.`) : [`${p}${k}`]);
    expect(keys(ar(AR)).sort()).toEqual(keys(en(EN)).sort());
    expect(ar(AR).common.specialDays(11)).toBe("١١ يومًا مميزًا");
  });
});

describe("Arabic event content", () => {
  it("translates every event, including notes and founders", () => {
    for (const e of EVENTS) {
      const a = EVENTS_AR[e.id];
      expect(a, e.id).toBeTruthy();
      expect(a.name && a.summary && a.background, e.id).toBeTruthy();
      if (e.note) expect(a.note, `${e.id} note`).toBeTruthy();
      if (e.establishedBy) expect(a.establishedBy, `${e.id} establishedBy`).toBeTruthy();
    }
    for (const e of EVENTS) for (const o of e.observed ?? []) if (o.note) expect(OBSERVED_AR[`${o.country}|${o.start}`], e.id).toBeTruthy();
  });
  it("makes Arabic names searchable once the content registers", () => {
    const fitr = EVENT_MAP["eid-al-fitr"];
    const youth = EVENT_MAP["omani-youth-day"];
    registerArabic({ events: EVENTS_AR, observed: OBSERVED_AR });
    expect(scoreEvent(youth, "يوم الشباب العماني")).toBeGreaterThan(0);
    expect(scoreEvent(fitr, "عيد الفطر")).toBeGreaterThanOrEqual(100);
    expect(scoreEvent(fitr, "Eid al-Fitr")).toBeGreaterThanOrEqual(100);
  });
  it("labels filter chips in Arabic", () => {
    const t = ar(AR);
    const chips = filterChips(parseFilters(new URLSearchParams("country=OM&intl=1&cat=culture&from=2026-10-26&to=2026-11-01"), makeDate(2026, 10, 26)), makeDate(2026, 10, 26), {}, {
      quote: t.common.quote, region: () => "🇴🇲 عُمان", plusWorldwide: t.filters.plusWorldwide, intlDays: t.filters.intlDays,
      countrySpecific: t.filters.countrySpecific, preset: (id) => t.filters.presets[id], date: (d) => AR.short(d),
      dateRange: (a, b) => AR.dateRange(a, b), fromDate: t.filters.fromDate, untilDate: t.filters.untilDate,
      category: (id) => t.categories[id].label, recognition: (id) => t.recognitions[id].short,
    });
    expect(chips.map((c) => c.label)).toEqual(["🇴🇲 عُمان + حول العالم", "الأيام السبعة القادمة", "الثقافة والتراث"]);
  });
});
