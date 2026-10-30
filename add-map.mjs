// Adds a Floorplan map of a public repo to the gallery (maps/): the exported copy goes to
// maps/<owner>/<repo>/index.html with a title, a link preview and a way back to the gallery, and
// maps/maps.json lists it. Prints the README badge for the project's maintainers.
// The map must be an export (node floorplan/serve.mjs --export) without Health or recent work: a public
// gallery never shows another project's weak spots or work in progress.
// usage: node add-map.mjs <exported map.html> <owner/repo>
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://haydenschmitty.github.io/floorplan-demo';
const [src, repo] = process.argv.slice(2);
const fail = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };
if (!src || !repo) fail('usage: node add-map.mjs <exported map.html> <owner/repo>');
if (!/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/.test(repo)) fail(`"${repo}" isn't a GitHub owner/repo.`);

let html = fs.readFileSync(src, 'utf8');
const DATA = '<script>window.FLOORPLAN = ';
const a = html.indexOf(DATA), b = html.indexOf(';</script>', a);
if (a < 0 || b < 0) fail('No map data found. Is this a Floorplan map?');
const g = JSON.parse(html.slice(a + DATA.length, b));
if (!g.meta?.exported) fail('This map isn\'t an export. Run node floorplan/serve.mjs --export in the mapped project first.');
if (g.health) fail('This export includes Health. Export it again without health: the gallery never publishes another project\'s weak spots.');
if (g.recent) fail('This export includes recent work. Export it again without recent.');
// absolute paths only: a project can have its own Users/ folder
if (g.meta.root || /[A-Z]:(\\\\|\/)Users(\\\\|\/)|"\/(Users|home)\//.test(html)) fail('This map contains local file paths.');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const name = repo.split('/')[1];
const title = `How ${name} works: a map of the codebase`;
const summary = g.project?.summary || `An interactive, plain-English map of ${repo}.`;
const url = `${SITE}/maps/${repo}/`;
const meta = [
  `<meta name="description" content="${esc(summary)}">`,
  `<meta property="og:title" content="${esc(title)}">`,
  `<meta property="og:description" content="${esc(summary)}">`,
  `<meta property="og:image" content="https://opengraph.githubassets.com/1/${repo}">`,
  `<meta property="og:url" content="${url}">`,
  `<meta name="twitter:card" content="summary_large_image">`,
].join('\n');
// beside the project name: where the map came from, and the way back to the other maps
const back = `<style>
.gal-badge { display: inline-flex; align-items: center; gap: 6px; margin-left: 10px; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 500; color: var(--text); background: rgba(var(--ink), .07); text-decoration: none; white-space: nowrap; }
.gal-badge:hover { background: rgba(var(--ink), .12); }
/* the gallery card already says when it was mapped */
.xtag { display: none; }
@media (max-width: 1280px) { .gal-badge.src { display: none; } }
@media (max-width: 760px) { .gal-badge { display: none; } }
</style>
<script>
(() => {
  document.title = ${JSON.stringify(title)}; // the map names the tab after the project on load
  const hl = document.querySelector('header .hl');
  if (!hl) return;
  const src = document.createElement('a');
  src.className = 'gal-badge src'; src.href = ${JSON.stringify(`https://github.com/${repo}`)}; src.target = '_blank'; src.rel = 'noopener';
  src.textContent = ${JSON.stringify(repo)};
  const all = document.createElement('a');
  all.className = 'gal-badge'; all.href = '../../';
  all.textContent = '← More maps';
  hl.append(src, all);
})();
</script>`;
html = html
  .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>\n${meta}`)
  .replace(/<\/body>(?![\s\S]*<\/body>)/, `${back}\n</body>`);

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const out = path.join(here, 'maps', ...repo.split('/'), 'index.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);

const listFile = path.join(here, 'maps', 'maps.json');
let list = [];
try { list = JSON.parse(fs.readFileSync(listFile, 'utf8')); } catch {}
const top = g.nodes.filter((n) => !n.parent && n.kind !== 'external');
const entry = {
  repo, name: g.project?.name || name, summary,
  parts: top.length, files: g.files.length, endpoints: g.routes.length,
  uses: g.nodes.filter((n) => n.kind === 'external').map((n) => n.label).slice(0, 8),
  mappedAt: g.meta.exported.at, commit: (g.meta.repos?.[0]?.head || '').slice(0, 7) || null,
};
list = [entry, ...list.filter((x) => x.repo !== repo)].sort((x, y) => y.mappedAt.localeCompare(x.mappedAt));
fs.writeFileSync(listFile, JSON.stringify(list, null, 2) + '\n');

console.log(`✓ wrote maps/${repo}/index.html (${Math.round(html.length / 1024)} KB) and updated maps/maps.json`);
console.log(`\nMap: ${url}\nBadge for the project's README:\n\n[![Floorplan: explore the map](${SITE}/badge.svg)](${url})\n`);
