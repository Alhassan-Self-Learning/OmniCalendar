import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { EVENTS } from "@/data/events";
import { useI18n } from "@/i18n/I18nContext";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-20 border-t border-border/60 bg-band pb-28 pt-12 lg:pb-12">
      <div className="container-page flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-sm text-muted">{t.footer.blurb(EVENTS.length)}</p>
        </div>
        <nav aria-label={t.nav.footer} className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <Link to="/calendar?view=year" className="hover:text-fg">{t.nav.yearGlance}</Link>
          <Link to="/explore" className="hover:text-fg">{t.nav.explore}</Link>
          <Link to="/categories" className="hover:text-fg">{t.nav.categories}</Link>
          <Link to="/about" className="hover:text-fg">{t.nav.about}</Link>
        </nav>
      </div>
      <p className="container-page mt-10 border-t border-border/60 pt-6 text-xs text-muted">
        {t.footer.disclaimer}
      </p>
    </footer>
  );
}
