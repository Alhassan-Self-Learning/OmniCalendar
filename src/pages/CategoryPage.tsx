import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { CATEGORY_MAP } from "@/data/categories";
import { EVENTS } from "@/data/events";
import { useApp } from "@/context/AppContext";
import { nextOccurrence } from "@/lib/dates";
import { useI18n } from "@/i18n/I18nContext";
import { CategoryIcon } from "@/components/events/Badges";
import { EventCard } from "@/components/events/EventCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { CategoryId, Occurrence } from "@/types";
import NotFoundPage from "./NotFoundPage";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/Button";

export default function CategoryPage() {
  const { id } = useParams();
  const cat = CATEGORY_MAP[id as CategoryId];
  const { today } = useApp();
  const { t, f, category } = useI18n();
  const text = cat ? category(cat.id) : null;
  useDocumentTitle(text?.label);
  const groups = useMemo(() => {
    if (!cat) return [];
    const occ = EVENTS.filter((e) => e.category === cat.id).map((e) => nextOccurrence(e, today)).filter((o): o is Occurrence => !!o)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    const map = new Map<string, Occurrence[]>();
    for (const o of occ) {
      const k = f.monthYear(o.date.getFullYear(), o.date.getMonth() + 1);
      map.set(k, [...(map.get(k) ?? []), o]);
    }
    return [...map.entries()];
  }, [cat, today, f]);
  if (!cat || !text) return <NotFoundPage />;

  return (
    <div>
      <div className="page-hero">
        <div className={cn("pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br opacity-60 dark:opacity-35", cat.tile)} aria-hidden />
        <div className="container-page py-8 sm:py-12">
          <Link to="/categories" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-fg"><ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden /> {t.categoriesPage.all}</Link>
          <div className="mt-4 flex items-center gap-4">
            <CategoryIcon id={cat.id} size="lg" />
            <div>
              <div className="eyebrow mb-1">{t.categoriesPage.eyebrowOne}</div>
              <h1 className="page-title">{text.label}</h1>
              <p className="lead mt-1">{text.description}</p>
            </div>
          </div>
          <Link to={`/calendar?cat=${cat.id}&view=year`} className={buttonClasses("outline", "sm", "mt-6")}>{t.categoriesPage.onYear(text.label)}</Link>
        </div>
      </div>
      <div className="container-page space-y-12 py-10">
        {groups.map(([label, list]) => (
          <section key={label} aria-label={label}>
            <h2 className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-muted">{label}<span className="h-px flex-1 bg-border/70" aria-hidden /></h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((o) => <EventCard key={o.event.id} occ={o} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
