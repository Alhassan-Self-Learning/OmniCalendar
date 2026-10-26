import { CATEGORY_MAP, RECOGNITION_MAP } from "@/data/categories";
import type { CategoryId, Recognition } from "@/types";
import { cn } from "@/lib/utils";
import { BadgeCheck, Globe2 } from "lucide-react";
import { COUNTRIES } from "@/data/countries";
import { useI18n } from "@/i18n/I18nContext";

export function CategoryIcon({ id, className, size = "md" }: { id: CategoryId; className?: string; size?: "sm" | "md" | "lg" }) {
  const c = CATEGORY_MAP[id];
  const Icon = c.icon;
  const box = size === "sm" ? "size-8 rounded-lg" : size === "lg" ? "size-14 rounded-2xl" : "size-10 rounded-xl";
  const icon = size === "sm" ? "size-4" : size === "lg" ? "size-7" : "size-5";
  return (
    <span className={cn("grid shrink-0 place-items-center", c.chip, box, className)} aria-hidden>
      <Icon className={icon} />
    </span>
  );
}

export function CategoryChip({ id, className }: { id: CategoryId; className?: string }) {
  const c = CATEGORY_MAP[id];
  const { category } = useI18n();
  const Icon = c.icon;
  return (
    <span className={cn("chip", c.chip, className)}>
      <Icon className="size-3.5" aria-hidden />
      {category(id).label}
    </span>
  );
}

export function RecognitionBadge({ id, long = false, className }: { id: Recognition; long?: boolean; className?: string }) {
  const r = RECOGNITION_MAP[id];
  const { recognition } = useI18n();
  const text = recognition(id);
  return (
    <span className={cn("chip border", r.badge, className)} title={text.description}>
      {(id === "un" || id === "national") && <BadgeCheck className="size-3.5" aria-hidden />}
      {long ? text.label : text.short}
    </span>
  );
}

/**
 * Where a day applies: "🌍 Worldwide" for international days, otherwise the country flags.
 * Lets people tell international events from country-specific occasions at a glance.
 */
export function ScopeBadge({ countries, className, max = 3 }: { countries: string[]; className?: string; max?: number }) {
  const { t, f, countryName } = useI18n();
  const intl = countries.includes("GLOBAL");
  const local = countries.filter((c) => c !== "GLOBAL");
  const names = local.map(countryName);
  if (intl) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-muted", className)} title={local.length ? t.badges.worldwideAlso(f.list(names)) : t.badges.worldwideTitle}>
        <Globe2 className="size-3.5" aria-hidden /> {t.badges.worldwide}
      </span>
    );
  }
  const shown = local.slice(0, max);
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-muted", className)} title={f.list(names)}>
      {/* Flags stay left-to-right so pairs of regional-indicator letters never split. */}
      <span aria-hidden className="tracking-tight" dir="ltr">{shown.map((c) => COUNTRIES[c]?.flag ?? "").join("")}</span>
      <span className="truncate" aria-hidden>{local.length === 1 ? names[0] : local.length > max ? t.badges.more(local.length - max) : names.length === 2 ? t.badges.pair(names[0], names[1]) : t.badges.countries(local.length)}</span>
      <span className="sr-only">{f.list(names)}</span>
    </span>
  );
}
