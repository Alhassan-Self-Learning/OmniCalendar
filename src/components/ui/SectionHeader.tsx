import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

/** Section heading: the title, one plain line under it, and an optional "see all" link at the end. */
export function SectionHeader({ title, subtitle, to, linkLabel, action, id }: {
  title: string; subtitle?: string; to?: string; linkLabel?: string; action?: ReactNode; id?: string;
  /** @deprecated No labels above headings in this design. */
  eyebrow?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h2 id={id} className="section-title">{title}</h2>
        {subtitle && <p className="mt-2 max-w-[60ch] text-body text-muted">{subtitle}</p>}
      </div>
      {action}
      {to && (
        <Link to={to} className="pressable group inline-flex items-center gap-1.5 rounded py-1.5 text-[0.9375rem] font-semibold text-fg underline decoration-border-strong decoration-2 underline-offset-[6px] hover:decoration-primary">
          {linkLabel ?? t.common.seeAll}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
