import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";

/**
 * A tear-off calendar page — OmniCalendar's signature mark. Echoes the logo:
 * a coloured binding strip with the month, a large day numeral and the weekday
 * (plus the Hijri date when that option is on).
 */
export function DateLeaf({ date, className, size = "md" }: { date: Date; className?: string; size?: "sm" | "md" }) {
  const { f, showHijri } = useI18n();
  const month = f.date(date, { month: "short" });
  const weekday = f.date(date, { weekday: "long" });
  // The small tile sits next to a full date line, so only the large tile carries the Hijri date.
  const hijri = showHijri && size === "md" ? f.hijriShort(date) : null;
  return (
    <div
      className={cn(
        "card flex shrink-0 flex-col overflow-hidden text-center",
        size === "md" ? "w-28" : "w-20",
        className,
      )}
      aria-hidden
    >
      <div className={cn("leaf-month bg-primary font-semibold uppercase tracking-[0.14em] text-primary-fg", size === "md" ? "py-1.5 text-xs" : "py-1 text-[10px]")}>
        {month}
      </div>
      <div className={cn("font-display font-extrabold tabular-nums leading-none", size === "md" ? "pt-3 text-5xl" : "pt-2 text-3xl")}>
        {f.num(date.getDate())}
      </div>
      <div className={cn("truncate px-2 font-medium text-muted", size === "md" ? "pt-1.5 text-xs" : "pt-1 text-[10px]", hijri ? "pb-0.5" : size === "md" ? "pb-3" : "pb-2")}>{weekday}</div>
      {hijri && (
        <div className="mx-2 mb-2 truncate border-t border-border/60 px-1.5 pt-1 text-[11px] font-medium text-primary">{hijri}</div>
      )}
    </div>
  );
}
