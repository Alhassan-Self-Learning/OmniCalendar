import { Link } from "react-router-dom";
import { CalendarX } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useI18n } from "@/i18n/I18nContext";

export default function NotFoundPage() {
  const { t } = useI18n();
  useDocumentTitle(t.notFound.docTitle);
  return (
    <div className="container-page py-16">
      <EmptyState icon={CalendarX} title={t.notFound.title}>
        <p>{t.notFound.text}</p>
        <Link to="/" className={buttonClasses("primary", "md", "mt-5")}>{t.notFound.back}</Link>
      </EmptyState>
    </div>
  );
}
