import type { Occurrence } from "@/types";
import { diffInDays } from "@/lib/dates";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/i18n/I18nContext";
import { cn } from "@/lib/utils";

/** Big-number countdown; shows "Today!" or "Happening now" when active. */
export function Countdown({ occ, className }: { occ: Occurrence; className?: string }) {
  const { today } = useApp();
  const { t, f } = useI18n();
  const n = diffInDays(today, occ.date);
  const active = n <= 0 && diffInDays(today, occ.endDate) >= 0;
  return (
    <div className={cn("flex items-baseline gap-1.5", className)} aria-label={active ? t.countdown.todayAria : t.countdown.toGoAria(n)}>
      {active ? (
        <span className="font-display text-2xl font-extrabold text-primary">{n === 0 ? t.countdown.today : t.countdown.now}</span>
      ) : (
        <>
          <span className="font-display text-3xl font-extrabold tabular-nums">{f.num(n)}</span>
          <span className="text-sm text-muted">{t.countdown.toGo(n)}</span>
        </>
      )}
    </div>
  );
}
