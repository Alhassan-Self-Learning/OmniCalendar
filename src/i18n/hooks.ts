import { useMemo } from "react";
import type { SpecialDay } from "@/types";
import type { ChipLabels } from "@/lib/filters";
import type { ICSText } from "@/lib/ics";
import { useI18n } from "./I18nContext";

/** Filter-chip labels in the UI language. */
export function useChipLabels(): ChipLabels {
  const { t, f, regionLabel, category, recognition } = useI18n();
  return useMemo(() => ({
    quote: t.common.quote,
    region: regionLabel,
    plusWorldwide: t.filters.plusWorldwide,
    intlDays: t.filters.intlDays,
    countrySpecific: t.filters.countrySpecific,
    preset: (id) => t.filters.presets[id] ?? id,
    date: (d) => f.date(d, { day: "numeric", month: "short", year: "numeric" }),
    dateRange: (a, b) => f.dateRange(a, b),
    fromDate: t.filters.fromDate,
    untilDate: t.filters.untilDate,
    category: (id) => category(id).label,
    recognition: (id) => recognition(id).short,
  }), [t, f, regionLabel, category, recognition]);
}

/** Calendar-export text in the UI language. */
export function useIcsText(): ICSText {
  const { t, ev, recognition, locale } = useI18n();
  return useMemo(() => ({
    name: (o) => ev(o.event).name,
    summary: (o) => ev(o.event).summary,
    recognition: (o) => recognition(o.event.recognition).label,
    estimate: t.ics.estimate,
    language: locale === "ar" ? "ar" : undefined,
  }), [t, ev, recognition, locale]);
}

/** Compare two events by their display name in the UI language. */
export function useNameCompare() {
  const { ev, f } = useI18n();
  return useMemo(() => (a: SpecialDay, b: SpecialDay) => f.compare(ev(a).name, ev(b).name), [ev, f]);
}
