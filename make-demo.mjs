// Turns a Floorplan map built for the web (build.mjs <root> --artifact, which leaves out local file
// paths) into map.html, the map half of this demo: a title and link preview, a "Live demo" badge, and
// an Ask message that explains questions work in your own copy, since a public page can't run anyone's
// Claude. index.html shows map.html beside a scripted chat; map.html also works on its own.
// map.html?agent=codex shows it as made in Codex.
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
/* inside the chat page (index.html): the chat replaces Ask. The map has its own phone layout (Floorplan 0.5.0 and later). */
.embedded #ask { display: none !important; }
.demo-badge { display: inline-flex; align-items: center; gap: 6px; margin-left: 10px; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 500; color: var(--text); background: rgba(74, 222, 128, .14); text-decoration: none; white-space: nowrap; }
.demo-badge i { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; }
.demo-badge:hover { background: rgba(74, 222, 128, .24); }
#ask-warn.demo a { color: var(--text); font-weight: 500; }
@media (max-width: 1100px) { .demo-badge span { display: none; } }
@media (max-width: 760px) { .demo-badge { display: none; } }
</style>
<script>
(() => {
  if (window.top !== window.self) document.documentElement.classList.add("embedded");
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

// map.html?agent=codex shows the map as Codex made it (Ask bar, "Fix with Codex"), for the chat page's
// Claude Code / Codex switch. It has to run before the viewer reads the graph.
const agentSwitch = `<script>try { if (new URLSearchParams(location.search).get('agent') === 'codex') window.FLOORPLAN.meta.agent = 'codex'; } catch {}</script>`;
const dataAt = html.indexOf('window.FLOORPLAN = ');
const dataEnd = html.indexOf('</script>', dataAt) + '</script>'.length;
if (dataAt < 0) { console.error('✗ No map data found. Is this a Floorplan map?'); process.exit(1); }
html = html.slice(0, dataEnd) + '\n' + agentSwitch + html.slice(dataEnd);

html = html
  .replace(/<title>[^<]*<\/title>/, `<title>${esc(TITLE)}</title>\n${meta}`)
  .replace(/<\/body>(?![\s\S]*<\/body>)/, `${demo}\n</body>`);
fs.writeFileSync(new URL('./map.html', import.meta.url), html);
console.log(`✓ wrote map.html (${Math.round(html.length / 1024)} KB)`);
