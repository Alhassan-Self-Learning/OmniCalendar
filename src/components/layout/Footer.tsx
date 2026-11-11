import { Link } from "react-router-dom";
import { LeafMark } from "./Logo";
import { EVENTS } from "@/data/events";
import { useI18n } from "@/i18n/I18nContext";

/** The back of the pad: the name returns at full width, then the links and the small print. */
export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="site-footer mt-24 bg-fg pb-28 pt-16 text-bg lg:pb-14">
      <div className="container-page">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <LeafMark className="size-10 [&_.fill-fg]:fill-bg [&_.fill-surface]:fill-fg [&_.stroke-fg]:stroke-bg [&_.fill-bg]:fill-fg" />
              <span className="text-lead font-bold" lang="en" dir="ltr">OmniCalendar</span>
            </div>
            <p className="mt-5 max-w-[46ch] text-body text-bg/80">{t.footer.blurb(EVENTS.length)}</p>
          </div>
          <nav aria-label={t.nav.footer} className="grid grid-cols-2 content-start gap-x-8 gap-y-3 text-body">
            <Link to="/calendar" className="text-bg/85 underline-offset-4 hover:text-bg hover:underline">{t.nav.calendar}</Link>
            <Link to="/calendar?view=year" className="text-bg/85 underline-offset-4 hover:text-bg hover:underline">{t.nav.yearGlance}</Link>
            <Link to="/explore" className="text-bg/85 underline-offset-4 hover:text-bg hover:underline">{t.nav.explore}</Link>
            <Link to="/categories" className="text-bg/85 underline-offset-4 hover:text-bg hover:underline">{t.nav.categories}</Link>
            <Link to="/favorites" className="text-bg/85 underline-offset-4 hover:text-bg hover:underline">{t.nav.favorites}</Link>
            <Link to="/about" className="text-bg/85 underline-offset-4 hover:text-bg hover:underline">{t.nav.about}</Link>
          </nav>
        </div>
        <p className="mt-14 max-w-[68ch] text-meta text-bg/70">{t.footer.disclaimer}</p>
      </div>
      <p aria-hidden className="mt-10 select-none overflow-hidden whitespace-nowrap px-3 text-center text-[clamp(3.5rem,13.5vw,12.5rem)] font-bold leading-[0.8] tracking-[-0.05em] text-bg/[.09]" lang="en" dir="ltr">
        OmniCalendar
      </p>
    </footer>
  );
}
