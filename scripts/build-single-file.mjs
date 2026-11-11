/**
 * Builds dist/holistic.html — one self-contained file that works offline
 * from a USB stick, an email attachment, or file:// with no server.
 *
 *   node scripts/build-single-file.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const VERSION = JSON.parse(read('package.json')).version;

let html = read('index.html');

/* inline the stylesheet */
const css = read('assets/css/app.css');
html = html.replace(
  /<link rel="stylesheet" href="assets\/css\/app\.css">/,
  `<style>\n${css}\n</style>`
);

/* drop things that only make sense when served */
html = html
  .replace(/<link rel="manifest"[^>]*>\n?/, '')
  .replace(/<link rel="icon"[^>]*>\n?/, '')
  .replace(/<link rel="apple-touch-icon"[^>]*>\n?/, '');

/* inline every script, in order */
const scripts = ['data', 'core', 'ui', 'share', 'export', 'app'];
scripts.forEach((name) => {
  const js = read(`assets/js/${name}.js`);
  html = html.replace(
    new RegExp(`<script src="assets/js/${name}\\.js"></script>`),
    `<script>\n${js}\n</script>`
  );
});

/* the service worker cannot exist in a single file — remove its registration guard */
html = html.replace(
  "if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {",
  "if (false) { /* single-file build: no service worker */"
);

const banner = `<!--
  Holistic v${VERSION} — single-file build
  Personal reflection, offline. No accounts, no tracking, nothing leaves the device.
  Author: Dr Sohil Momin · Licence: PolyForm Noncommercial 1.0.0
  Source: https://github.com/drsamonline/holistic
  Built: ${new Date().toISOString()}
-->
`;

html = html.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n' + banner);

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist', 'holistic.html');
fs.writeFileSync(out, html);

const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`dist/holistic.html  ${kb} KB`);
