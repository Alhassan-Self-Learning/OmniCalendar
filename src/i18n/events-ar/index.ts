import type { EventTextAr } from "../registry";
import { PART1 } from "./part1";
import { PART2 } from "./part2";
import { PART3 } from "./part3";
import { PART4 } from "./part4";
import { PART5 } from "./part5";
import { PART6 } from "./part6";
import { PART7 } from "./part7";
import { PART8 } from "./part8";

/*
 * Arabic event content, keyed by event id — loaded as its own chunk (see registry.ts).
 * Write digits as 0–9: they are shown in the reader's chosen digit style at render time.
 * An event or field missing here falls back to English and is marked lang="en" dir="ltr".
 * Keep names consistent with Gulf (and especially Omani) official usage.
 */
export const EVENTS_AR: Record<string, EventTextAr> = {
  ...PART1, ...PART2, ...PART3, ...PART4, ...PART5, ...PART6, ...PART7, ...PART8,
};

/** Arabic notes for announced public holidays, keyed "COUNTRY|YYYY-MM-DD" (see ObservedHoliday). */
export const OBSERVED_AR: Record<string, string> = {
  "OM|2026-11-25": "أُعلن ضمن تقويم الإجازات الرسمية لعام 2026.",
  "OM|2026-03-19": "وزارة العمل: من 29 رمضان 1447هـ، واستُؤنف العمل في 24 مارس.",
  "OM|2026-05-26": "من 9 ذي الحجة 1447هـ (يوم عرفة)، واستُؤنف العمل في 31 مايو.",
  "OM|2026-06-18": "أُعلن ضمن تقويم الإجازات الرسمية لعام 2026.",
  "OM|2026-01-15": "أُعلن ضمن تقويم الإجازات الرسمية لعام 2026.",
  "OM|2026-01-18": "أُعلن ضمن تقويم الإجازات الرسمية لعام 2026.",
  "OM|2026-08-27": "إجازة رسمية بمناسبة 12 ربيع الأول 1448هـ.",
};
