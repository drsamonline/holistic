# Holistic 2.0.0

A private, offline reflection app — rebuilt as an app shell, with the homeopathy module removed entirely.

### Downloads

- **`holistic.html`** — one self-contained file, 92 KB. Double-click it. Works offline, from a USB stick, or as an email attachment.
- **`holistic-v2.zip`** — the same file, zipped, for when your mail client is fussy about `.html`.

### Install

1. Download `holistic.html`.
2. Open it in any modern browser.
3. Optional: open <https://drsamonline.github.io/holistic/app/> and use **Install** / **Add to Home Screen** for the PWA version.

### What changed

- Removed the homeopathy module — tab, remedy table, potency, frequency, duration and the "healing crisis" copy.
- Added personal year, expression number, soul urge and derived personal days.
- Added a lunar calendar with the next four phase dates, and a real illuminated moon disc.
- Added a biorhythm chart with 7 / 30 / 90-day views.
- Added backup/restore as a JSON file, and a printable report with a text-copy button.
- Rebuilt the layout: rail on desktop, bottom tab bar on mobile, 48 px targets, safe-area insets.
- Fixed couple scoring so master numbers are no longer capped at 65%.
- Seeded the oracle from the question so it is consistent.
- 39 logic tests and 87 browser assertions.

### Privacy

No network requests at runtime. One `localStorage` key on your device, erased with one button. No account, no sync, no analytics.

### Licence

PolyForm Noncommercial 1.0.0. Not a medical device. If you are struggling with your mental health, please speak to a qualified professional.
