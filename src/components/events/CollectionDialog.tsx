import { useState } from "react";
import { Check, FolderPlus, Plus } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";

export function CollectionDialog({ eventId, open, onClose }: { eventId: string; open: boolean; onClose: () => void }) {
  const { collections, createCollection, toggleInCollection, notify } = useApp();
  const { t, f } = useI18n();
  const [name, setName] = useState("");
  return (
    <Dialog open={open} onClose={onClose} title={t.collectionDialog.title} description={t.collectionDialog.description}>
      <ul className="max-h-64 space-y-1 overflow-y-auto">
        {collections.length === 0 && <li className="py-3 text-sm text-muted">{t.collectionDialog.none}</li>}
        {collections.map((c) => {
          const has = c.eventIds.includes(eventId);
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => { toggleInCollection(c.id, eventId); notify(has ? t.toast.colRemoved(c.name) : t.toast.colAdded(c.name)); }}
                aria-pressed={has}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors hover:bg-surface-2"
              >
                <span className={cn("grid size-5 place-items-center rounded-md border transition-colors duration-150", has ? "border-primary bg-primary text-primary-fg" : "border-border")}>
                  {has && <Check className="size-3.5 animate-pop" aria-hidden />}
                </span>
                <span className="flex-1 font-medium" dir="auto">{c.name}</span>
                <span className="text-xs text-muted">{f.num(c.eventIds.length)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <form
        className="mt-4 flex gap-2 border-t border-border pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          const c = createCollection(name, eventId);
          notify(t.toast.colCreated(c.name));
          setName("");
        }}
      >
        <label htmlFor="new-collection" className="sr-only">{t.collectionDialog.newLabel}</label>
        <div className="relative flex-1">
          <FolderPlus className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="new-collection"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.collectionDialog.placeholder}
            maxLength={60}
            className="field field-pill ps-9"
          />
        </div>
        <Button type="submit" disabled={!name.trim()}><Plus /> {t.collectionDialog.create}</Button>
      </form>
    </Dialog>
  );
}
