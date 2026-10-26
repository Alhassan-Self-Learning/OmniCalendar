import { useEffect } from "react";
import { useI18n } from "@/i18n/I18nContext";

export function useDocumentTitle(title?: string) {
  const { t } = useI18n();
  useEffect(() => {
    document.title = title ? t.app.pageTitle(title) : t.app.title;
  }, [title, t]);
}
