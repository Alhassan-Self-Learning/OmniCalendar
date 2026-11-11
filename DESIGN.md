# OmniCalendar — Visual direction (v2 redesign)

## The idea: red-letter days

Calendars once printed feast days in red ink, which is where "red-letter day" comes from. In Gulf homes the
same tradition lives on in the tear-off wall calendar (التقويم): one leaf per day, a huge Gregorian numeral,
the Hijri date beside it, the weekday in Arabic and English, holidays printed in red, and a short note at the
foot of the leaf.

OmniCalendar is that object, made interactive. **On this page, the household tear-off leaf — Gregorian
numeral, Hijri date and weekday in two scripts, holidays in red — becomes the product's face.** The home
opens on today's leaf; you can tear forward and back through days and read what each one holds. Everything
else on the site is the same stationery: leaves, stubs, perforations and sheets.

**The live thing:** the leaf in the hero. Next / previous / today buttons (and arrow keys while it has focus)
turn the page; the leaf shows that day's numeral, weekday in both scripts, Hijri date and up to three of its
special days. Without script it is a plain link to the calendar.

## Colour: a two-colour print job

Paper, ink and calendar red. Red means one thing everywhere: *this day is marked* — a public holiday, today,
the active place in the navigation, the one primary action.

| Role | Light | Dark |
| --- | --- | --- |
| Ground (the desk) | `#f2f2f0` | `#0e0e0e` |
| Paper (surfaces) | `#ffffff` | `#181818` |
| Raised paper / wells | `#f7f7f5` | `#202020` |
| Ink | `#141414` | `#f1f1ef` |
| Muted ink (≥ 4.5:1) | `#5b5b58` | `#a6a6a2` |
| Rule | `#e3e3df` | `#2b2b2b` |
| Red (marks, action) | `#c8102e` | `#ff5c6c` |
| Red, pale tint (areas) | `#fcf0f2` | `#2a1418` |
| Red, track (heat map) | `#f4cdd4` | `#5a1d26` |

The full red only appears on small marks: numerals of holidays, the today ring, the active-nav dot, the
primary button, counts. Pale tints carry the areas (selected day, active filter). One section per page
may turn the whole field red (the home's story band).

Categories keep a hue each, but only as a 8px square "ink stamp" beside their name — never as tinted card
backgrounds or icon tiles.

## Type

One family per script, as required: **Google Sans** for English, **IBM Plex Sans Arabic** for Arabic (full
RTL). Five steps carry the page: 13 (meta), 16 (body, full ink), 20 (lead / card title), 32 (section),
display `clamp(48px, 6.4vw, 96px)`. The leaf numeral is the one oversized object. Tabular figures on every
date and count. Weights 400 / 500 / 700. Sentence case everywhere; no tracked uppercase labels.

## Shape and space

- One radius: 4px on paper and controls (printed, crisp); the leaf itself is 2px. Buttons are square-cornered.
- No shadows at rest. Paper sits on the desk by tone alone; a leaf's stack is drawn as filled paper edges.
  Menus and dialogs, which truly float, keep a shadow.
- Perforations (round 4px dots) separate the tear-off parts of a leaf or stub — the only "line" ornament.
- One container (max 1280px) with equal 20–40px margins; section rhythm 120–160px on desktop.

## Components

- **Leaf** — binding band in ink with two punched holes and the month; giant numeral (red on holidays);
  weekday in both scripts; Hijri date; perforation; the day's note.
- **Stub** — a small leaf for lists: month and day stacked, perforated edge, name, countdown.
- **Event card** — a paper slip: date stub at the start, name, one line, category stamp, recognition text.
- **Month grid** — a printed month: numerals top-start, today ringed in red, holidays in red, entries as
  plain lines of text with a category stamp, selected day on the pale red tint.
- **Year at a glance** — twelve printed months; density shown as a red ink ladder (red-letter density).
- **Navigation** — plain words; the current page carries the red "today" dot.

## Themes

- **Light** — paper on a pale desk.
- **Dark** — true neutral blacks (no navy), lightness steps instead of borders, red lifted for contrast.
- **Liquid Glass** (opt-in) — the paper becomes frosted: cards translucent over a quiet ambient field, chrome
  (header, tab bar, menus, dialogs) blurred. Same tokens, same red. Falls back to solid panes with
  `prefers-reduced-transparency` or without `backdrop-filter`.

## Motion

Short and purposeful: the leaf tears (lifts 10px, tilts 2°, fades) and the next one settles in; sections
rise 16px as they enter; controls press. Transform and opacity only, ≤ 320ms, all removed under
`prefers-reduced-motion`.

## Generic patterns removed

| Was | Now |
| --- | --- |
| Gradient headline word, radial colour glows behind the hero | Flat ink; the leaf is the image |
| Pill date badge and small uppercase "eyebrow" labels above every heading | The heading says it; dates live on leaves |
| Icons in tinted rounded squares on every card and category | An 8px category stamp, or a plain icon |
| Rows of identical rounded cards with soft shadows and coloured top tabs | Paper slips and stubs, tone-separated, no shadow |
| Rainbow category chips everywhere (calendar grid, hero, cards) | Neutral text with a stamp; red reserved for holidays |
| Google-blue primary on every control | One red action per view; ink buttons elsewhere |
| Floating glass tab bar and blur in the default theme | Opaque, flat chrome; glass only in Liquid Glass |
| Nine-icon category tile grid | A typographic index of themes with counts |
