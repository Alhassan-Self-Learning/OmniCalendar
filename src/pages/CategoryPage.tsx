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
        <div className="container-page pb-10 pt-8 sm:pt-12">
          <Link to="/categories" className="inline-flex min-h-10 items-center gap-1 text-[0.9375rem] font-medium text-muted hover:text-fg"><ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden /> {t.categoriesPage.all}</Link>
          <div className="mt-6 flex items-start gap-5">
            <CategoryIcon id={cat.id} size="lg" className="mt-2 hidden sm:block" />
            <div className="min-w-0">
              <h1 className="page-title">{text.label}</h1>
              <p className="lead mt-4">{text.description}</p>
              <p className="mt-2 text-meta text-muted">{t.categoriesPage.eyebrowOne}</p>
            </div>
          </div>
          <Link to={`/calendar?cat=${cat.id}&view=year`} className={buttonClasses("outline", "md", "mt-8")}>{t.categoriesPage.onYear(text.label)}</Link>
        </div>
      </div>
      <div className="container-page space-y-14 pb-16 pt-4">
        {groups.map(([label, list]) => (
          <section key={label} aria-label={label}>
            <h2 className="mb-5 text-lead font-bold">{label}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((o) => <EventCard key={o.event.id} occ={o} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
