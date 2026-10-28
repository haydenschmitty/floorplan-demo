// Turns a Floorplan map built for the web (build.mjs <root> --artifact, which leaves out local file
// paths) into this demo page: a title and link preview, a "Live demo" badge, and an Ask message that
// explains questions work in your own copy, since a public page can't run anyone's Claude.
// usage: node make-demo.mjs <path to floorplan/artifact.html>
import fs from 'node:fs';

const REPO = 'https://github.com/haydenschmitty/floorplan';
const TITLE = 'Floorplan live demo: Brewline';
const DESC = 'An interactive, plain-English map of a sample coffee-shop app, drawn by Floorplan. Explore every part, file and web request, run the tour, and see the Health check.';
const IMAGE = 'https://raw.githubusercontent.com/haydenschmitty/floorplan/main/docs/images/overview.png';

const src = process.argv[2];
if (!src) { console.error('usage: node make-demo.mjs <floorplan/artifact.html>'); process.exit(1); }
let html = fs.readFileSync(src, 'utf8');
if (/[A-Z]:\\\\Users|\/Users\/|\/home\//.test(html)) { console.error('✗ This map contains local file paths. Build it with --artifact.'); process.exit(1); }

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const meta = [
  `<meta name="description" content="${esc(DESC)}">`,
  `<meta property="og:title" content="${esc(TITLE)}">`,
  `<meta property="og:description" content="${esc(DESC)}">`,
  `<meta property="og:image" content="${IMAGE}">`,
  `<meta property="og:type" content="website">`,
  `<meta name="twitter:card" content="summary_large_image">`,
].join('\n');

const demo = `<style>
.demo-badge { display: inline-flex; align-items: center; gap: 6px; margin-left: 10px; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 500; color: var(--text); background: rgba(74, 222, 128, .14); text-decoration: none; white-space: nowrap; }
.demo-badge i { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; }
.demo-badge:hover { background: rgba(74, 222, 128, .24); }
#ask-warn.demo a { color: var(--text); font-weight: 500; }
@media (max-width: 1100px) { .demo-badge span { display: none; } }
@media (max-width: 760px) { .demo-badge { display: none; } }
/* phones: the map is made for bigger screens, so say so before it opens */
#demo-small { display: none; }
@media (max-width: 760px) {
  #demo-small { display: flex; position: fixed; inset: 0; z-index: 1000; align-items: center; justify-content: center; padding: 24px; background: var(--bg); font-family: var(--sans); }
  #demo-small[hidden] { display: none; }
  #demo-small .box { max-width: 340px; text-align: center; color: var(--text); }
  #demo-small h1 { font-size: 22px; margin: 0 0 10px; }
  #demo-small p { color: var(--text-2); font-size: 15px; line-height: 1.55; margin: 0 0 22px; }
  #demo-small a, #demo-small button { display: block; width: 100%; box-sizing: border-box; padding: 13px 16px; border-radius: 14px; font-size: 15px; font-weight: 500; text-decoration: none; margin-bottom: 10px; border: 0; cursor: pointer; font-family: inherit; }
  #demo-small a { background: var(--text); color: var(--bg); }
  #demo-small button { background: rgba(255, 255, 255, .08); color: var(--text); }
}
</style>
<div id="demo-small"><div class="box">
  <h1>Floorplan live demo</h1>
  <p>An interactive map of a sample coffee-shop app. It's made for a computer screen, so open this link on your laptop to explore it properly.</p>
  <a href="${REPO}" target="_blank" rel="noopener">See Floorplan on GitHub</a>
  <button type="button" onclick="this.closest('#demo-small').hidden = true">Continue anyway</button>
</div></div>
<script>
(() => {
  const REPO = ${JSON.stringify(REPO)};
  document.title = ${JSON.stringify(TITLE)}; // the map names the tab after the project on load
  // a badge beside the project name
  const hl = document.querySelector('header .hl');
  if (hl) {
    const a = document.createElement('a');
    a.className = 'demo-badge'; a.href = REPO; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = '<i></i>Live demo<span>&nbsp;· Get Floorplan</span>';
    hl.appendChild(a);
  }
  // Ask needs your own Claude, so the demo explains that instead of asking for the CLI
  const MSG = 'This is a live demo of <b>Floorplan</b>, mapping a sample coffee-shop app. Asking questions works in your own copy. <a href="' + REPO + '#install" target="_blank" rel="noopener">Get Floorplan for your app →</a>';
  const warn = document.getElementById('ask-warn');
  const input = document.getElementById('ask-input');
  const engine = document.getElementById('ask-engine');
  const fix = () => {
    if (warn && !warn.hidden && !warn.classList.contains('demo')) { warn.classList.add('info', 'demo'); warn.innerHTML = '<span>' + MSG + '</span>'; }
    if (input) input.placeholder = 'Ask questions about your own app in your copy of Floorplan';
    if (engine && /Unavailable/.test(engine.textContent)) engine.innerHTML = '<i></i>Demo';
  };
  if (warn) new MutationObserver(() => { if (!warn.classList.contains('demo') || warn.textContent.includes('serve.mjs')) { warn.classList.remove('demo'); fix(); } }).observe(warn, { childList: true, attributes: true, attributeFilter: ['hidden'] });
  fix();
})();
</script>`;

html = html
  .replace(/<title>[^<]*<\/title>/, `<title>${esc(TITLE)}</title>\n${meta}`)
  .replace(/<\/body>(?![\s\S]*<\/body>)/, `${demo}\n</body>`);
fs.writeFileSync(new URL('./index.html', import.meta.url), html);
console.log(`✓ wrote index.html (${Math.round(html.length / 1024)} KB)`);
