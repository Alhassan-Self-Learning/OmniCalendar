import { Link } from "react-router-dom";
import { EVENTS } from "@/data/events";
import { RECOGNITIONS } from "@/data/categories";
import { RecognitionBadge } from "@/components/events/Badges";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nContext";

export default function AboutPage() {
  const { t, recognition } = useI18n();
  useDocumentTitle(t.about.title);
  return (
    <div>
    <PageHeader eyebrow={t.about.eyebrow} title={t.about.title} description={t.about.description(EVENTS.length)} />
    <div className="container-page max-w-3xl py-10">
      <h2 className="section-title">{t.about.recTitle}</h2>
      <ul className="mt-4 space-y-3">
        {RECOGNITIONS.map((r) => (
          <li key={r.id} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
            <RecognitionBadge id={r.id} long className="self-start sm:w-56 sm:justify-center" />
            <span className="text-sm text-muted">{recognition(r.id).description}</span>
          </li>
        ))}
      </ul>
      <h2 className="section-title mt-10">{t.about.howTitle}</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {t.about.rules.map(([term, d]) => (
          <div key={term} className="card p-4">
            <dt className="font-semibold">{term}</dt>
            <dd className="mt-1 text-sm text-muted">{d}</dd>
          </div>
        ))}
      </dl>
      <h2 className="section-title mt-10">{t.about.accuracyTitle}</h2>
      <p className="mt-3 text-fg/80">
        {t.about.accuracyA}<code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm" dir="ltr">src/data/events.ts</code>{t.about.accuracyB}
      </p>
      <Link to="/explore" className={buttonClasses("primary", "md", "mt-8")}>{t.about.start}</Link>
    </div>
    </div>
  );
}
