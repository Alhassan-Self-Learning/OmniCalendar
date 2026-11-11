import { useState, type FormEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, Compass, Heart, Home, LayoutGrid, Search, Shuffle } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeMenu } from "./ThemeMenu";
import { LanguageMenu } from "./LanguageMenu";
import { useI18n } from "@/i18n/I18nContext";
import { Button } from "@/components/ui/Button";
import { useSurprise } from "@/hooks/useSurprise";
import { useApp, useFilterMemory } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { useChangeKey } from "@/lib/motion";
import { filtersToQuery, parseFilters } from "@/lib/filters";

/** Calendar and Explore links carry the session's filters, so switching views keeps the selection. */
export function navTarget(to: string, filterQuery: string) {
  return filterQuery && (to === "/calendar" || to === "/explore") ? `${to}?${filterQuery}` : to;
}

export const NAV: { to: string; key: "home" | "calendar" | "explore" | "categories" | "favorites"; icon: typeof Home; end?: boolean }[] = [
  { to: "/", key: "home", icon: Home, end: true },
  { to: "/calendar", key: "calendar", icon: CalendarDays },
  { to: "/explore", key: "explore", icon: Compass },
  { to: "/categories", key: "categories", icon: LayoutGrid },
  { to: "/favorites", key: "favorites", icon: Heart },
];

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const surprise = useSurprise();
  const { favorites, today } = useApp();
  const { t, f } = useI18n();
  const { filterQuery } = useFilterMemory();
  const favPulse = useChangeKey(favorites.length);
  const [q, setQ] = useState("");
  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    // Keep the session's filters (region, categories…) so results stay consistent with the calendar.
    const query = filtersToQuery({ ...parseFilters(new URLSearchParams(filterQuery), today), q: q.trim() });
    navigate(`/explore${query ? `?${query}` : ""}`);
  };
  const showHeaderSearch = location.pathname !== "/" && location.pathname !== "/explore";

  return (
    <header className="app-bar sticky top-0 z-40 border-b border-border bg-bg">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:rounded focus:bg-fg focus:px-4 focus:py-2 focus:text-bg">
        {t.app.skip}
      </a>
      <div className="container-page flex h-16 items-center gap-2 sm:gap-3">
        <Logo />
        <nav aria-label={t.nav.main} className="ms-6 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={navTarget(n.to, filterQuery)} end={n.end} className="nav-link">
              {t.nav[n.key]}
              {n.to === "/favorites" && favorites.length > 0 && (
                <span key={favPulse} className={cn("ms-1.5 inline-block text-meta font-semibold tabular-nums text-muted", favPulse > 0 && "animate-pop")}>{f.num(favorites.length)}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="ms-auto flex items-center sm:gap-1">
          {showHeaderSearch && (
            <form role="search" onSubmit={onSearch} className="relative me-1 hidden md:block">
              <label htmlFor="header-search" className="sr-only">{t.header.search}</label>
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                id="header-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.header.search}
                className="field h-10 w-56 border-border bg-surface ps-9 transition-[width,border-color,box-shadow] duration-[240ms] focus:w-72"
              />
            </form>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" aria-label={t.header.searchShort} onClick={() => navigate("/explore")}>
            <Search />
          </Button>
          <Button variant="ghost" size="md" onClick={surprise} className="hidden sm:inline-flex" title={t.header.surpriseTitle}>
            <Shuffle /> {t.header.surprise}
          </Button>
          <Button variant="ghost" size="icon" onClick={surprise} className="sm:hidden" aria-label={t.header.surpriseAria}>
            <Shuffle />
          </Button>
          <LanguageMenu />
          <ThemeMenu />
        </div>
      </div>
    </header>
  );
}

/** Bottom tab bar for small screens: flat paper, the current tab carries the red dot. */
export function MobileNav() {
  const { favorites } = useApp();
  const { t, f } = useI18n();
  const { filterQuery } = useFilterMemory();
  const favPulse = useChangeKey(favorites.length);
  return (
    <nav aria-label={t.nav.main} className="app-tabbar fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface px-1 pt-1 lg:hidden" style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}>
      <ul className="grid grid-cols-5">
        {NAV.map((n) => (
          <li key={n.to}>
            <NavLink
              to={navTarget(n.to, filterQuery)}
              end={n.end}
              className="tab-link pressable relative flex flex-col items-center gap-1 rounded py-2 text-[0.75rem] font-medium text-muted"
            >
              <n.icon className="size-5" strokeWidth={1.75} aria-hidden />
              {t.nav[n.key]}
              {n.to === "/favorites" && favorites.length > 0 && (
                <span key={favPulse} className={cn("absolute end-[16%] top-1 min-w-[1.125rem] rounded-sm bg-fg px-1 text-center text-[0.6875rem] font-semibold leading-[1.125rem] text-bg", favPulse > 0 && "animate-pop")}>{f.num(favorites.length)}</span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
