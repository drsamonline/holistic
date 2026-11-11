# Holistic 2.6.0

Your rising sign — and a fix for a bug that was making one up.

### Downloads

| Asset | Size | Notes |
| --- | --- | --- |
| `holistic.html` | 184 KB | One self-contained file. Works offline. |
| `holistic-android.apk` | ~4.3 MB | Capacitor debug build. Unsigned. |
| `holistic-windows-setup.exe` | ~78 MB | NSIS installer. Unsigned. |

### What's new

- **Rising sign** from local sidereal time, birth time, UTC offset and city (120 cities).
- **Personal months** — twelve cells, current month highlighted.
- **Library filters** — narrow tarot by suit.
- **CSV export** of the year's personal days.

### Fixed

- A missing UTC offset was producing a plausible but meaningless ascendant (`typeof NaN === 'number'` let it through). All offsets are now sanitised with a +05:30 fallback, and three tests pin it.

### Corrected

- The README claimed a forecast tab needed fixing. There is no forecast tab — it was dropped in v2.0.0.

### Licence

PolyForm Noncommercial 1.0.0. Not a medical device. If you are struggling with your mental health, please speak to a qualified professional.
