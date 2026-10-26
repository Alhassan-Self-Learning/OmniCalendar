import { useMemo } from "react";
import { X } from "lucide-react";
import { EVENTS } from "@/data/events";
import { ARAB_LEAGUE, COUNTRIES, REGIONS } from "@/data/countries";
import { detectPreset, filterChips, presetRange, RANGE_PRESETS, type DiscoveryFilters, type Scope } from "@/lib/filters";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";
import { useChipLabels } from "@/i18n/hooks";

/* Shared discovery controls. Every control is a thin view over DiscoveryFilters: it receives the
   current filters and calls onChange with a new object — the page writes that to the URL. */

type Props = { filters: DiscoveryFilters; onChange: (f: DiscoveryFilters) => void };

/** Countries that actually have events, split into Arab states and the rest — sorted in the UI language. */
function useCountryGroups() {
  const { countryName, f } = useI18n();
  return useMemo(() => {
    const used = new Set(EVENTS.flatMap((e) => e.countries));
    const all = Object.values(COUNTRIES).filter((c) => c.code !== "GLOBAL" && used.has(c.code)).map((c) => ({ ...c, name: countryName(c.code) }));
    const byName = (a: { name: string }, b: { name: string }) => f.compare(a.name, b.name);
    return {
      arab: all.filter((c) => ARAB_LEAGUE.includes(c.code) && c.code !== "OM").sort(byName),
      other: all.filter((c) => !ARAB_LEAGUE.includes(c.code)).sort(byName),
    };
  }, [countryName, f]);
}

/** Country / region selector — Oman, the Arab world and the Gulf are listed first. */
export function RegionSelect({ filters, onChange, id, className, showIntlToggle = true }: Props & { id: string; className?: string; showIntlToggle?: boolean }) {
  const { t, countryLabel, regionLabel } = useI18n();
  const groups = useCountryGroups();
  return (
    <div className={cn("space-y-2", className)}>
      <select id={id} value={filters.region} className="field"
        onChange={(e) => onChange({ ...filters, region: e.target.value, withIntl: e.target.value ? filters.withIntl : false })}>
        <option value="">{t.filters.allCountries}</option>
        <optgroup label={t.filters.featured}>
          <option value="OM">{countryLabel("OM")}</option>
          <option value="ARAB" title={t.filters.arabWorldTitle}>{regionLabel("ARAB")}</option>
          <option value="GCC">{regionLabel("GCC")}</option>
        </optgroup>
        <optgroup label={t.filters.arabCountries}>
          {groups.arab.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
        </optgroup>
        <optgroup label={t.filters.otherCountries}>
          {groups.other.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
        </optgroup>
      </select>
      {showIntlToggle && filters.region && (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-[rgb(var(--primary))]" checked={filters.withIntl}
            onChange={(e) => onChange({ ...filters, withIntl: e.target.checked })} />
          {t.filters.alsoWorldwide}
        </label>
      )}
    </div>
  );
}

/** One-tap shortcuts that make Oman and the Arab world easy to find. */
export function QuickRegions({ filters, onChange, className }: Props & { className?: string }) {
  const { t, countryLabel, regionLabel } = useI18n();
  const items = [
    { code: "OM", label: countryLabel("OM") },
    { code: "ARAB", label: regionLabel("ARAB") },
    { code: "GCC", label: `${REGIONS.GCC.flag} ${t.filters.gulfShort}` },
  ];
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} role="group" aria-label={t.filters.quickRegion}>
      {items.map((it) => (
        <button key={it.code} type="button" className="chip-toggle" aria-pressed={filters.region === it.code}
          onClick={() => onChange({ ...filters, region: filters.region === it.code ? "" : it.code, withIntl: filters.region === it.code ? false : filters.withIntl })}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

/** International vs country-specific. */
export function ScopeToggle({ filters, onChange, className, short = false }: Props & { className?: string; short?: boolean }) {
  const { t } = useI18n();
  const opts: { id: Scope; label: string; title: string }[] = [
    { id: "", label: t.filters.scopeAll, title: t.filters.scopeAllTitle },
    { id: "intl", label: short ? t.filters.scopeIntlShort : t.filters.scopeIntl, title: t.filters.scopeIntlTitle },
    { id: "local", label: short ? t.filters.scopeLocalShort : t.filters.scopeLocal, title: t.filters.scopeLocalTitle },
  ];
  return (
    <div className={cn("segmented flex w-full", className)} role="group" aria-label={t.filters.scopeAria}>
      {opts.map((o) => (
        <button key={o.id || "all"} type="button" title={o.title} aria-pressed={filters.scope === o.id}
          aria-label={o.title}
          className="segmented-item flex-1 justify-center whitespace-nowrap px-2 text-xs sm:text-sm" onClick={() => onChange({ ...filters, scope: o.id })}>
          <span aria-hidden>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Date range: quick presets plus a custom from/to. */
export function DateRangeFilter({ filters, onChange, today, id }: Props & { today: Date; id: string }) {
  const { t } = useI18n();
  const preset = detectPreset(filters, today);
  return (
    <div className="space-y-2">
      <select id={id} className="field" value={preset}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") onChange({ ...filters, from: "", to: "" });
          else if (v === "custom") onChange({ ...filters, ...presetRange("30d", today) });
          else onChange({ ...filters, ...presetRange(v, today) });
        }}>
        <option value="">{t.filters.anyDate}</option>
        {RANGE_PRESETS.map((p) => <option key={p.id} value={p.id}>{t.filters.presets[p.id] ?? p.label}</option>)}
        <option value="custom">{t.filters.custom}</option>
      </select>
      {preset === "custom" && (
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-muted">{t.filters.from}
            <input type="date" className="field mt-1 px-2" value={filters.from} max={filters.to || undefined}
              onChange={(e) => onChange({ ...filters, from: e.target.value })} />
          </label>
          <label className="text-xs text-muted">{t.filters.to}
            <input type="date" className="field mt-1 px-2" value={filters.to} min={filters.from || undefined}
              onChange={(e) => onChange({ ...filters, to: e.target.value })} />
          </label>
        </div>
      )}
    </div>
  );
}

/** Removable chips for every active filter, plus "Clear all". */
export function ActiveFilters({ filters, onChange, today, includeQuery = true, className, onClear }: Props & {
  today: Date; includeQuery?: boolean; className?: string; onClear?: () => void;
}) {
  const { t } = useI18n();
  const labels = useChipLabels();
  const chips = filterChips(filters, today, { includeQuery }, labels);
  if (!chips.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} aria-label={t.filters.active}>
      {chips.map((c) => (
        <button key={c.key} type="button" onClick={() => onChange(c.without)} aria-label={t.filters.remove(c.label)}
          className="pressable chip border border-primary/25 bg-primary-soft py-1 pe-1.5 ps-2.5 text-primary hover:bg-primary/15">
          {c.label}
          <X className="size-3.5" aria-hidden />
        </button>
      ))}
      {chips.length > 1 && (
        <button type="button" className="pressable chip px-2 font-semibold text-muted hover:text-fg"
          onClick={() => (onClear ? onClear() : onChange({ ...filters, q: includeQuery ? "" : filters.q, cats: [], recs: [], region: "", withIntl: false, scope: "", from: "", to: "" }))}>
          {t.filters.clearAll}
        </button>
      )}
    </div>
  );
}
