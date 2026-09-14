// ResuMate1-style OTA publisher.
// Usage: node scripts/publish-ota.mjs <build-number> <out-dir>
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const build = Number.parseInt(process.argv[2], 10);
const outDir = process.argv[3];
if (!Number.isInteger(build) || build < 1) throw new Error('usage: publish-ota.mjs <build-number> <out-dir>');
if (!outDir) throw new Error('usage: publish-ota.mjs <build-number> <out-dir>');

const marker = 'window.__RESUMATE_BUILD__ = 0;';
let html = await readFile('www/index.html', 'utf8');
if (!html.includes(marker)) throw new Error(`expected to find "${marker}" in www/index.html`);

const assets = [
  ['css/style.css', 'style'],
  ['css/components.css', 'style'],
  ['css/template-variants.css', 'style'],
  ['js/ota-bootstrap.js', 'script'],
  ['js/templates.js', 'script'],
  ['js/app.js', 'script']
];

for (const [asset, kind] of assets) {
  const source = await readFile(`www/${asset}`, 'utf8');
  const escaped = source.replace(/<\/script/gi, '<\\/script');
  const tag = kind === 'style' ? `<style data-ota-inline="${asset}">\n${source}\n</style>` : `<script data-ota-inline="${asset}">\n${escaped}\n</script>`;
  const pattern = kind === 'style'
    ? new RegExp(`<link\\s+rel=["']stylesheet["']\\s+href=["']${asset.replace('/', '\\/')}["']\\s*/?>`, 'i')
    : new RegExp(`<script\\s+src=["']${asset.replace('/', '\\/')}["']\\s*>\\s*</script>`, 'i');
  if (!pattern.test(html)) throw new Error(`Missing ${kind} reference for ${asset} in www/index.html`);
  html = html.replace(pattern, tag);
}

html = html.replace(marker, `window.__RESUMATE_BUILD__ = ${build};`);

// An OTA payload must be self-contained; only the user-supplied photo URL may remain external.
const externalScripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
if (externalScripts.length) throw new Error(`OTA bundle still has external scripts: ${externalScripts.join(', ')}`);
const externalStyles = [...html.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map(m => m[1]);
if (externalStyles.length) throw new Error(`OTA bundle still has external stylesheets: ${externalStyles.join(', ')}`);

const sha256 = createHash('sha256').update(html, 'utf8').digest('hex');
const manifest = {
  version: `1.0.${build}`,
  build,
  schemaVersion: 2,
  updated: new Date().toISOString(),
  sha256,
  rollbackEnabled: true,
  bundle: 'index.html'
};

await mkdir(outDir, { recursive: true });
await writeFile(`${outDir}/index.html`, html, 'utf8');
await writeFile(`${outDir}/version.json`, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Prepared self-contained OTA build ${build} (sha256 ${sha256.slice(0, 12)}...) in ${outDir}/`);
