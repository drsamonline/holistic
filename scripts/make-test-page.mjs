/**
 * Generates a throwaway copy of index.html with the browser test harness
 * appended and asset paths made absolute, so it can be opened from file://
 * and dumped with headless chromium.
 *
 *   node scripts/make-test-page.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const out = html
  .replace('</body>', `<script src="file://${root}/tests/harness/browser.js"></script>\n</body>`);

const target = path.join(root, '.test-page.html');
fs.writeFileSync(target, out);
console.log(target);
