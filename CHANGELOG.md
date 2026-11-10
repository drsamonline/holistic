# Holistic 2.0.0

The version where the app stopped prescribing things.

## Removed

- **The entire homeopathy module.** The tab, the eleven-entry remedy table, the potency/frequency/duration fields, the "healing crisis" copy and the report section are gone. A birth date cannot select a constitutional remedy, and a tool that names suicidal ideation in its output must route people to a human rather than to a protocol. `tests/core.test.mjs` now fails the build if any of those terms reappear in the data tables.

## Added

- **Personal year, expression number and soul urge** — the name field finally does arithmetic instead of being decorative.
- **Personal days** derived for the current month, replacing a fixed list that once produced "32 December".
- **Lunar calendar** with the next four phase dates, and a real illuminated moon disc.
- **Biorhythm chart** with 7 / 30 / 90-day views.
- **Backup and restore** as a JSON file.
- **Printable report** plus a plain-text copy button.
- **Deep links** — `#numbers`, `#sky`, `#couple`, `#oracle`, `#report`, `#profile`.
- **PWA**: manifest, service worker, maskable icons, installable.
- **Single-file build** at `dist/holistic.html`, 92 KB with everything inlined.

## Changed

- **Layout rebuilt as an app shell**: fixed rail on desktop, top bar plus bottom tab bar on mobile, 48 px minimum touch targets, safe-area insets for notched phones.
- **Couple scoring** no longer penalises master numbers. The old formula capped a #22 user at 65% against everyone; the gap is now measured on reduced digits.
- **Oracle** is seeded from the question, so the same question gives the same card and rephrasing is part of the exercise. Previously the dashboard and the oracle disagreed about whether tarot was deterministic or random.
- **Prediction year** defaults to the current year instead of a hard-coded 2025.
- **Date input** rejects dates outside 1900–2200 and impossible dates like 2023-02-30.
- **Reduced motion** is respected; the animated aurora is now a single static gradient paint.

## Testing

- 39 logic tests (`npm test`) covering reduction, date parsing, zodiac cusps, lunar epochs, biorhythm bounds, couple symmetry and data integrity.
- 87 browser assertions (`npm run test:browser`) covering every screen, action, navigation target, empty state, invalid input and a check that no `getElementById` call misses.
