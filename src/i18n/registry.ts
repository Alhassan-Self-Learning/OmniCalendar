/*
 * Holder for the Arabic event content, which ships as a separate chunk (see I18nContext).
 * Kept tiny and dependency-free so lib/search can read it without pulling the data into the
 * main bundle: once the chunk registers, search matches Arabic names and descriptions in
 * either UI language.
 */

export interface EventTextAr {
  name: string;
  summary: string;
  background?: string;
  note?: string;
  establishedBy?: string;
}

let events: Record<string, EventTextAr> | null = null;
let observed: Record<string, string> = {};
let version = 0;

export function registerArabic(data: { events: Record<string, EventTextAr>; observed: Record<string, string> }) {
  events = data.events;
  observed = data.observed;
  version++;
}

export const arabicLoaded = () => events !== null;
export const arabicFor = (id: string): EventTextAr | undefined => events?.[id];
export const arabicObservedNote = (country: string, start: string): string | undefined => observed[`${country}|${start}`];
/** Bumps whenever content registers, so caches built before it can rebuild. */
export const registryVersion = () => version;

let pending: Promise<void> | null = null;
/** Load (once) the Arabic event content chunk. */
export function loadArabic(): Promise<void> {
  if (events) return Promise.resolve();
  pending ??= import("./events-ar").then((m) => registerArabic({ events: m.EVENTS_AR, observed: m.OBSERVED_AR }));
  return pending;
}
