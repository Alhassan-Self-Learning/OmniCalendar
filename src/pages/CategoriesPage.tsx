import { Link } from "react-router-dom";
import { CATEGORIES, RECOGNITIONS } from "@/data/categories";
import { EVENTS } from "@/data/events";
import { useApp } from "@/context/AppContext";
import { nextOccurrence } from "@/lib/dates";
import { fieldLang, useI18n } from "@/i18n/I18nContext";
import { CategoryIcon, RecognitionBadge } from "@/components/events/Badges";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/lib/motion";
import type { Occurrence } from "@/types";

export default function CategoriesPage() {
  const { t, f, ev, locale, category, recognition } = useI18n();
  useDocumentTitle(t.categoriesPage.title);
  const { today } = useApp();
  return (
    <div>
      <PageHeader title={t.categoriesPage.title} description={t.categoriesPage.description} />
      <div className="container-page pb-16 pt-4 sm:pb-24">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => {
            const items = EVENTS.filter((e) => e.category === c.id);
            const next = items.map((e) => nextOccurrence(e, today)).filter((o): o is Occurrence => !!o).sort((a, b) => a.date.getTime() - b.date.getTime())[0];
            return (
              <li key={c.id} style={{ animationDelay: `${i * 30}ms` }} className="card card-interactive group relative flex animate-fade-up flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-[1.75rem] font-bold leading-tight tracking-[-0.025em]">
                    <Link to={`/categories/${c.id}`} className="decoration-primary decoration-[3px] underline-offset-[6px] after:absolute after:inset-0 after:content-[''] group-hover:underline">{category(c.id).label}</Link>
                  </h2>
                  <CategoryIcon id={c.id} size="md" className="mt-1.5" />
                </div>
                <p className="mb-6 mt-2 text-body text-fg/80">{category(c.id).description}</p>
                <p className="perf mt-auto flex items-baseline gap-3 pt-4">
                  <span className="text-[2rem] font-bold leading-none tracking-[-0.03em] tabular-nums">{f.num(items.length)}</span>
                  <span className="text-meta text-muted">{t.home.factDays}</span>
                </p>
                {next && (
                  <p className="mt-3 text-meta">
                    <span className="text-muted">{t.categoriesPage.next} </span>
                    <span className="font-semibold" {...fieldLang(ev(next.event), "name", locale)}>{ev(next.event).name}</span>
                    <span className="text-muted"> · {f.short(next.date)} · {f.relative(next.date, today)}</span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="band">
        <Reveal as="section" className="container-page section" aria-labelledby="rec-h">
          <h2 id="rec-h" className="section-title">{t.categoriesPage.recTitle}</h2>
          <p className="mt-2 max-w-[60ch] text-body text-muted">{t.categoriesPage.recDesc}</p>
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {RECOGNITIONS.map((r) => (
              <li key={r.id} className="perf group relative grid grid-cols-[minmax(0,11rem)_1fr] gap-5 py-5">
                <div>
                  <RecognitionBadge id={r.id} long />
                </div>
                <div>
                  <p className="text-body">{recognition(r.id).description}</p>
                  <Link to={`/explore?rec=${r.id}`} className="mt-2 inline-block text-meta font-semibold underline decoration-border-strong decoration-2 underline-offset-4 after:absolute after:inset-0 after:content-[''] group-hover:decoration-primary">
                    {t.categoriesPage.daysLink(EVENTS.filter((e) => e.recognition === r.id).length)}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
