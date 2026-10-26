import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Languages, Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useChangeKey, usePresence } from "@/lib/motion";
import { useI18n } from "@/i18n/I18nContext";
import type { Locale, Numerals } from "@/i18n/format";

/** Each language is always shown in its own name and script, so it can be found from either UI. */
const LANGS: { id: Locale; native: string; dir: "ltr" | "rtl" }[] = [
  { id: "en", native: "English", dir: "ltr" },
  { id: "ar", native: "العربية", dir: "rtl" },
];

type Item =
  | { kind: "lang"; id: Locale }
  | { kind: "hijri" }
  | { kind: "numerals"; id: Numerals };

/**
 * English / Arabic switcher, styled and keyboard-driven like the theme menu. Also holds the date
 * display options: Hijri dates alongside Gregorian, and (in Arabic) the digit style.
 */
export function LanguageMenu() {
  const { locale, setLocale, t, showHijri, setShowHijri, numerals, setNumerals } = useI18n();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  const list: Item[] = [
    ...LANGS.map((l) => ({ kind: "lang" as const, id: l.id })),
    { kind: "hijri" },
    ...(locale === "ar" ? (["arab", "latn"] as const).map((id) => ({ kind: "numerals" as const, id })) : []),
  ];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  useLayoutEffect(() => {
    if (open) items.current[LANGS.findIndex((l) => l.id === locale)]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const menu = usePresence(open);
  const changed = useChangeKey(locale);
  const current = LANGS.find((l) => l.id === locale)!;

  const choose = (it: Item) => {
    if (it.kind === "lang") {
      setOpen(false);
      if (it.id !== locale) setLocale(it.id);
      trigger.current?.focus();
    } else if (it.kind === "hijri") setShowHijri(!showHijri);
    else setNumerals(it.id);
  };

  return (
    <div className="relative" ref={root}>
      <Button
        ref={trigger}
        variant="ghost"
        size="icon"
        className="gap-1.5 sm:w-auto sm:px-2.5"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.lang.aria(current.native)}
        title={t.lang.aria(current.native)}
        onClick={() => setOpen((o) => !o)}
      >
        {/* Phones: just the language mark, so the header still fits a 360px screen. */}
        <Languages key={changed} className={cn("hidden sm:block", changed && "animate-pop")} />
        <span key={`l${changed}`} className={cn("min-w-[1.25rem] text-[13px] font-bold leading-none", changed && "animate-pop sm:animate-none")} aria-hidden>{t.lang.short}</span>
      </Button>
      {menu.mounted && (
        <div
          role="menu"
          aria-label={t.lang.menu}
          data-state={menu.state}
          className="glass motion-menu absolute end-0 top-12 z-50 w-64 origin-top-right rounded-2xl p-1.5 rtl:origin-top-left"
          onKeyDown={(e) => {
            const idx = items.current.findIndex((el) => el === document.activeElement);
            const len = list.length;
            const go = (i: number) => { e.preventDefault(); items.current[(i + len) % len]?.focus(); };
            if (e.key === "ArrowDown") go(idx + 1);
            else if (e.key === "ArrowUp") go(idx - 1);
            else if (e.key === "Home") go(0);
            else if (e.key === "End") go(len - 1);
            else if (e.key === "Tab") setOpen(false);
          }}
        >
          <div className="meta-label px-3 pb-1.5 pt-1.5" aria-hidden>{t.lang.menu}</div>
          {list.map((it, i) => {
            const checked = it.kind === "lang" ? it.id === locale : it.kind === "hijri" ? showHijri : it.id === numerals;
            const lang = it.kind === "lang" ? LANGS.find((l) => l.id === it.id)! : null;
            return (
              <Fragment key={it.kind + ("id" in it ? it.id : "")}>
                {it.kind === "hijri" && (
                  <>
                    <div role="separator" className="mx-2 my-1 h-px bg-border/70" />
                    <div className="meta-label px-3 pb-1 pt-1.5" aria-hidden>{t.lang.dates}</div>
                  </>
                )}
                {it.kind === "numerals" && it.id === "arab" && (
                  <div className="meta-label px-3 pb-1 pt-2" aria-hidden>{t.lang.numerals}</div>
                )}
                <button
                  ref={(el) => { items.current[i] = el; }}
                  role={it.kind === "hijri" ? "menuitemcheckbox" : "menuitemradio"}
                  aria-checked={checked}
                  onClick={() => choose(it)}
                  lang={lang?.id}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-fg/[.06] focus-visible:bg-fg/[.06] focus-visible:ring-0",
                    checked && "font-semibold text-primary",
                  )}
                >
                  {lang ? (
                    <span className="grid size-6 shrink-0 place-items-center rounded-md bg-surface-2 text-[11px] font-bold" aria-hidden>
                      {lang.id === "ar" ? "ع" : "En"}
                    </span>
                  ) : it.kind === "hijri" ? (
                    <Moon className="size-4 shrink-0" aria-hidden />
                  ) : (
                    <span className="grid size-6 shrink-0 place-items-center text-[13px] font-bold tabular-nums" aria-hidden>
                      {it.id === "arab" ? "١٢" : "12"}
                    </span>
                  )}
                  <span className="flex-1 text-start" dir={lang?.dir}>
                    {lang ? lang.native : it.kind === "hijri" ? t.lang.showHijri : it.id === "arab" ? t.lang.arabicDigits : t.lang.westernDigits}
                    {it.kind === "hijri" && <span className="block text-[11px] font-normal leading-tight text-muted">{t.lang.showHijriHint}</span>}
                  </span>
                  {checked && <Check className="size-4 shrink-0" aria-hidden />}
                </button>
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
