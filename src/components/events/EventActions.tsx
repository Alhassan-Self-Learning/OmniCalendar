import { useState } from "react";
import { CalendarPlus, ExternalLink, FolderPlus, Share2 } from "lucide-react";
import type { Occurrence } from "@/types";
import { Button, buttonClasses } from "@/components/ui/Button";
import { downloadICS } from "@/lib/ics";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/i18n/I18nContext";
import { useIcsText } from "@/i18n/hooks";
import { CollectionDialog } from "./CollectionDialog";
import { FavoriteButton } from "./FavoriteButton";
import { addDays } from "@/lib/dates";

function gcalDate(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export function shareUrl(id: string) {
  return `${window.location.origin}${(import.meta.env.BASE_URL || "/").replace(/\/$/, "")}/event/${id}`;
}

export function EventActions({ occ }: { occ: Occurrence | null; }) {
  const { notify, collections } = useApp();
  const { t, ev } = useI18n();
  const icsText = useIcsText();
  const [open, setOpen] = useState(false);
  if (!occ) return null;
  const e = occ.event;
  const text = ev(e);
  const inCollections = collections.filter((c) => c.eventIds.includes(e.id)).length;

  const share = async () => {
    const url = shareUrl(e.id);
    if (navigator.share) {
      try { await navigator.share({ title: text.name, text: text.summary, url }); return; } catch (err) {
        if ((err as DOMException).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      notify(t.toast.linkCopied);
    } catch {
      window.prompt(t.toast.copyPrompt, url);
    }
  };

  const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text.name)}&dates=${gcalDate(occ.date)}/${gcalDate(addDays(occ.endDate, 1))}&details=${encodeURIComponent(`${text.summary}\n\n${shareUrl(e.id)}`)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FavoriteButton id={e.id} withLabel />
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FolderPlus /> {inCollections ? t.actions.inCollections(inCollections) : t.actions.addToCollection}
      </Button>
      <Button variant="outline" onClick={() => { downloadICS([occ], e.id, icsText); notify(t.toast.icsDownloaded); }}>
        <CalendarPlus /> {t.actions.ics}
      </Button>
      <a href={gcal} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline")}>
        <ExternalLink /> {t.actions.gcal}
      </a>
      <Button variant="ghost" onClick={share}><Share2 /> {t.actions.share}</Button>
      <CollectionDialog eventId={e.id} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
