/**
 * Builds a screenshot page with a demo profile pre-loaded, so headless
 * chromium captures populated screens rather than empty states.
 * Animations and transitions are disabled so captures are never mid-fade.
 *
 *   node scripts/make-shot-page.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

html = html.replace('</head>',
  '<style>*,*::before,*::after{animation:none!important;transition:none!important}.toast{display:none!important}</style>\n</head>');

const seed = `
<script>
document.addEventListener('DOMContentLoaded', function () {
  var r = (location.hash || '#today').replace('#', '');
  HL_APP.state.profile = {
    fullName: 'Sohil Momin', birthDate: '1990-01-15', birthTime: '06:45',
    birthLocation: 'Pune', tzOffset: '330', gender: 'male', occupation: 'Doctor',
    userQuestion: 'Career and health'
  };
  HL_APP.renderAll();
  HL_APP.setRoute(r);
  if (r === 'couple') {
    document.getElementById('coupleA').value = '1990-01-15';
    document.getElementById('coupleB').value = '1988-07-04';
    HL_APP.compareCouple();
  }
  if (r === 'oracle') {
    document.getElementById('oracleQ').value = 'Should I take the offer?';
    HL_APP.setMode('tarot');
    HL_APP.setSpread(5);
    HL_APP.drawNow();
  }
  if (r === 'library') {
    HL_APP.setLib('iching');
  }
});
</script>
`;

html = html.replace('</body>', seed + '</body>');

const target = path.join(root, '.shot.html');
fs.writeFileSync(target, html);
console.log(target);
