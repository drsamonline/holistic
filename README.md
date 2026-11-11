<div align="center">

<img src="assets/icon.svg" width="88" height="88" alt="Holistic">

# Holistic


![Screenshot](docs/shot.png)
**Eight traditions, one quiet app — numerology, astrology, a full I Ching, 78 tarot cards, runes, lunar phase and biorhythm. Offline and private.**

[![Live app](https://img.shields.io/badge/live_app-open-8b5cf6?style=flat-square)](https://drsamonline.github.io/holistic/)
[![Release](https://img.shields.io/github/v/release/drsamonline/holistic?style=flat-square&color=14b8a6)](https://github.com/drsamonline/holistic/releases)
[![Licence](https://img.shields.io/badge/licence-PolyForm_Noncommercial_1.0.0-f59e0b?style=flat-square)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-79_passing-4d6b1f?style=flat-square)](#testing)
[![Size](https://img.shields.io/badge/single_file-193_KB-0ea5e9?style=flat-square)](dist/holistic.html)
[![Network](https://img.shields.io/badge/network_requests-0-e11d48?style=flat-square)](#privacy)

<img src="screenshots/desktop-today.png" alt="The Today screen" width="880">

</div>

---

## What this is

A personal reflection app that runs entirely in your browser. You enter a name and a birth date once; it derives your numerology profile, your sun sign, today's lunar phase, and your biorhythm cycles, then keeps them on one screen you can open every morning.

It is **not** a dashboard of tables. Every number is computed from your input rather than looked up from a hard-coded list, and the whole thing — stylesheet, scripts, icons, logic — fits in a single 193 KB file that works with the Wi-Fi off.

## What it is not

Honesty is part of the product, so it is part of the README too.

| It is | It is not |
| --- | --- |
| A reflective exercise with a vocabulary for things you half-know | A diagnosis or a medical device |
| Arithmetic you can check by hand | Evidence — biorhythm in particular has failed validation since the 1970s |
| A reason to notice your own energy | A prediction of your future |
| Free and uncommercial | A prescription of anything, for anyone |

There is no homeopathy content in this project. An earlier prototype carried a remedy table derived from birth-date arithmetic; it was removed in v2.0.0 because a date of birth cannot select a constitutional remedy, and because a tool that names suicidal ideation in its output must route people to a human, not to a protocol.

## Screens

| | |
| --- | --- |
| <img src="screenshots/desktop-today.png" alt="Today"> **Today** — moon, biorhythm, your number | <img src="screenshots/desktop-numbers.png" alt="Numbers"> **Numbers** — power, personal year, name, personal days |
| <img src="screenshots/desktop-sky.png" alt="Sky"> **Sky** — sun sign, 30-day chart, lunar calendar | <img src="screenshots/desktop-couple.png" alt="Couple"> **Couple** — two dates, one honest read |
| <img src="screenshots/desktop-oracle.png" alt="Oracle"> **Oracle** — a card, not a prophecy | <img src="screenshots/desktop-report.png" alt="Report"> **Report** — one printable page |

<div align="center">
<img src="screenshots/mobile-today.png" width="220" alt="Mobile today">
<img src="screenshots/mobile-numbers.png" width="220" alt="Mobile numbers">
<img src="screenshots/mobile-sky.png" width="220" alt="Mobile sky">
</div>

## Features

- **Numerology that computes.** Power number (11 and 22 preserved), personal year, Pythagorean expression number and soul urge from the letters of your name, and personal days derived for the current month.
- **Real lunar astronomy.** Phase, illumination and the next four phase dates from the synodic month, anchored to the new moon of 6 January 2000, 18:14 UTC.
- **Biorhythm chart.** 23 / 28 / 33-day cycles with a 7, 30 or 90-day view.
- **Couple reading.** Two dates, element relation, and a score that no longer penalises master numbers.
- **Full I Ching.** All 64 hexagrams, three-coin casting, changing lines read as a movement toward the transformed hexagram.
- **Full tarot.** All 78 cards — 22 majors and 56 minors — plus runes, the 24 Elder Futhark with reversed readings.
- **Spreads.** Single card, three-card past/present/future, five-card relationship — drawn without replacement, with a clarifying card on a single draw.
- **Library.** Every card, hexagram and rune, searchable, offline. 166 entries.
- **Moon sign and rising sign** from your birth time — the Moon from its ecliptic longitude (±0.3°), the ascendant from local sidereal time and a table of 120 city coordinates.
- **Personal months** — the year as twelve cells, so you can see which month the year is actually about.
- **Library filters** — narrow the deck by suit, and export the year's personal days as CSV.
- **Biorhythm sync** in the Couple screen: how far apart two people's cycles are today.
- **Oracle.** Tarot, I Ching, runes or a straight answer — seeded from your question, so the same question gives the same draw and rephrasing is part of the exercise.
- **Daily draw.** One card, hexagram or rune per day, fixed by the date so it cannot be re-rolled.
- **Share as image** — any draw or your profile rendered to a 1080×1350 card, drawn on canvas, no library. Uses the native share sheet where the browser has one.
- **Export as Markdown or RTF** — the whole reading as plain text. RTF opens in Word, Pages, LibreOffice and Google Docs; Markdown opens anywhere. No PDF, no binary format.
- **Multiple profiles** — keep more than one person's dates on the same device.
- **Printable report** plus a plain-text copy button, and a compact A5 card mode.
- **Keyboard shortcuts** — `1`–`8` jump between screens.
- **"Why this number?"** — the arithmetic behind your power number, shown on request.
- **Backup and restore** as a JSON file you own.
- **Installable PWA** with a service worker, and a single-file build for everything else.

## Privacy

- **No network requests at runtime.** No fonts, no CDN, no analytics, no telemetry. You can verify it: open DevTools → Network, use the app, and watch it stay empty.
- **One storage key** in `localStorage`, unencrypted, on your device. *Erase everything* in the Profile screen removes it.
- **No account, no sync, no server.** There is nothing to sign up for because there is no backend.

## Install

### 1 · Web / PWA

Open **[drsamonline.github.io/holistic/app](https://drsamonline.github.io/holistic/app/)** and use your browser's **Install** or **Add to Home Screen**. It caches itself and works offline afterwards.

The landing page is at **[drsamonline.github.io/holistic](https://drsamonline.github.io/holistic/)**. Both are published by the **Deploy site** workflow on every push to `main`.

### 2 · Single HTML file

Download `holistic.html` from the [latest release](https://github.com/drsamonline/holistic/releases/latest) and double-click it. Everything is inlined — it runs from a USB stick, an email attachment, or `file://` with no server.

```bash
npm run build     # regenerates dist/holistic.html from source
```

### 3 · App packages

The [v2.0.0 release](https://github.com/drsamonline/holistic/releases/tag/v2.0.0) ships both, built by CI from this source:

| Asset | Size | Notes |
| --- | --- | --- |
| `holistic-android.apk` | 4.3 MB | Capacitor debug build. Unsigned, so Android will ask you to allow installs from your browser or file manager. |
| `holistic-windows-setup.exe` | 78 MB | NSIS installer wrapping the single-file build in Electron. Unsigned, so SmartScreen will warn once. |

Rebuild them yourself with the **Build app packages** workflow (`workflow_dispatch`, or push to the `ci-packages` branch).

## Development

No build step, no dependencies, no framework. Four plain scripts loaded in order.

```bash
git clone https://github.com/drsamonline/holistic.git
cd holistic
python3 -m http.server 8080     # or: npm run serve
```

Open <http://localhost:8080>. Deep links work: `#today`, `#numbers`, `#sky`, `#couple`, `#oracle`, `#report`, `#profile`.

```
index.html                  the app shell
assets/css/app.css          one stylesheet, mobile-first
assets/js/data.js           static tables — no logic
assets/js/core.js           pure functions — importable in Node
assets/js/ui.js             rendering — no event handling
assets/js/app.js            state, routing, events, storage
landing/                    marketing page
scripts/                    build, screenshot and test harnesses
tests/core.test.mjs         79 logic tests
tests/harness/browser.js    87 in-browser assertions
sw.js · manifest.webmanifest
```

### Testing

```bash
npm test              # 79 logic tests, Node's built-in runner
npm run test:browser  # 169 DOM assertions in headless chromium
npm run build         # single-file bundle
```

The browser harness checks every screen, every action button, every navigation target, empty states, invalid input, all four oracle modes, the library and its search, and that no `getElementById` call misses.

## Roadmap

Deliberately short — the point is to stay small.

- [x] Moon sign and ascendant — both computed now
- [ ] Hindi and Marathi interface strings
- [ ] Optional light theme for printing
- [ ] More cities in the coordinate table (120 today)

## Attribution

Sources, traditions and their licences are listed in **[ATTRIBUTION.md](ATTRIBUTION.md)**. The lunar model follows the standard synodic-month calculation; letter values follow Pythagorean numerology; the tarot and I Ching texts are written for this project from the public-domain tradition.

## Licence

**[PolyForm Noncommercial 1.0.0](LICENSE)** — use, change and share it for any noncommercial purpose. Commercial use requires a separate licence. Copyright © 2026 Dr Sohil Momin.

## Support this

Free, offline, accountless — and staying that way. Nothing here is gated: no accounts, no tracking, no network requests.

<img src="assets/upi-qr.svg" width="150" alt="UPI QR code">

| | |
|---|---|
| UPI (India) | `drsohilboi@ybl` — payee Dr. Sohil Momin, open amount, or scan the QR above |
| GitHub Sponsors | [github.com/sponsors/drsamonline](https://github.com/sponsors/drsamonline) |
| Ko-fi | [ko-fi.com/matneo](https://ko-fi.com/matneo) |
| PayPal | [paypal.me/drsohilmomin](https://paypal.me/drsohilmomin?locale.x=en_GB&country.x=IN) |
| My books | [Amazon author store](https://www.amazon.com/stores/author/B08ZT331LY/allbooks) |
| More apps | [drsamonline.github.io](https://drsamonline.github.io/) |
| Email | [sohilmomin2000@gmail.com](mailto:sohilmomin2000@gmail.com) |

## More from the same hand

| App | What it is |
| --- | --- |
| [Panchang](https://drsamonline.github.io/app-panchang/) | A daily Indian almanac — tithi, nakshatra, yoga, karana, rahu-kaal and muhurat, computed offline |
| [Thermals](https://drsamonline.github.io/app-thermals/) | Homoeopathic remedies by thermal reaction, quoted from the classical sources |
| [Organon Reader](https://drsamonline.github.io/app-organon-reader/) | The Organon of Medicine, sixth edition, Boericke translation |
| [Ambient Sound Studio](https://drsamonline.github.io/ambient-sound-studio/) | A private, offline ambient mixer in a single HTML file |
| [Accent Oracle](https://drsamonline.github.io/accent-oracle/) | Four seconds of speech, on device, with a band on how sure it is |
| [All4ONE](https://drsamonline.github.io/All4ONE/) | 403 working tools in one portable Windows binary |

[See all 30 →](https://drsamonline.github.io/)

## Author

**Dr Sohil Momin** — [@drsamonline](https://github.com/drsamonline)

Built as a reflective exercise, and shared in case it is useful to someone else.

> Not a medical device. If you are struggling with your mental health, please speak to a qualified professional.
