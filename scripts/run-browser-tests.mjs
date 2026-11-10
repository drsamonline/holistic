/**
 * Runs the browser harness in headless chromium and fails on any
 * TEST FAIL / TEST ERROR line.
 *
 *   node scripts/make-test-page.mjs && node scripts/run-browser-tests.mjs
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const page = path.join(root, '.test-page.html');

if (!fs.existsSync(page)) {
  console.error('run scripts/make-test-page.mjs first');
  process.exit(1);
}

const bin = process.env.CHROME || 'chromium';
let dom;
try {
  dom = execFileSync(bin, [
    '--headless', '--disable-gpu', '--no-sandbox',
    '--virtual-time-budget=5000', '--dump-dom', page
  ], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
} catch (e) {
  console.error('could not run ' + bin + ' — set CHROME=/path/to/chrome');
  process.exit(1);
}

const lines = dom.split('\n').filter((l) => /TEST (PASS|FAIL|ERROR|SUMMARY)/.test(l));
const bad = lines.filter((l) => /TEST (FAIL|ERROR)/.test(l));
lines.forEach((l) => console.log(l.trim()));

if (bad.length) {
  console.error(`\n${bad.length} failing assertion(s)`);
  process.exit(1);
}
