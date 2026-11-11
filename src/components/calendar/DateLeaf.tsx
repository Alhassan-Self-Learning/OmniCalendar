import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";

/**
 * A tear-off leaf — OmniCalendar's object. An ink binding with two punched holes carries the month;
 * the day numeral sits large beneath it (printed in red on a red-letter day), then the weekday and,
 * when that option is on, the Hijri date below a perforation.
 */
export function DateLeaf({ date, className, size = "md", red = false }: { date: Date; className?: string; size?: "sm" | "md" | "lg"; red?: boolean }) {
  const { f, showHijri } = useI18n();
  const month = f.date(date, { month: "long" });
  const weekday = f.date(date, { weekday: "long" });
  const hijri = showHijri && size !== "sm" ? f.hijriShort(date) : null;
  const lg = size === "lg";
  return (
    <div className={cn("leaf leaf-pad shrink-0 text-center", lg ? "w-52" : size === "md" ? "w-36" : "w-24", className)} aria-hidden>
      <div className={cn("leaf-binding justify-center font-semibold", lg ? "h-11 text-base" : size === "md" ? "h-9 text-sm" : "h-7 text-xs")}>
        <span className="relative z-[1] truncate px-8">{month}</span>
      </div>
      <div className={cn("leaf-numeral", red && "leaf-red", lg ? "pt-6 text-[6.5rem]" : size === "md" ? "pt-4 text-[4.5rem]" : "pt-2.5 text-[2.75rem]")}>
        {f.num(date.getDate())}
      </div>
      <div className={cn("truncate px-2 font-medium", lg ? "pb-4 pt-3 text-base" : size === "md" ? "pb-3 pt-2 text-sm" : "pb-2 pt-1.5 text-xs")}>{weekday}</div>
      {hijri && <div className="perf mx-3 truncate pb-2.5 pt-2 text-xs font-medium text-muted">{hijri}</div>}
    </div>
  );
}
