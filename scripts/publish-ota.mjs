// ResuMate1-style OTA publisher.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const build = Number.parseInt(process.argv[2], 10);
const outDir = process.argv[3];
if (!Number.isInteger(build) || build < 1) throw new Error('usage: publish-ota.mjs <build-number> <out-dir>');
if (!outDir) throw new Error('usage: publish-ota.mjs <build-number> <out-dir>');

const marker = 'window.__RESUMATE_BUILD__ = 0;';
let html = await readFile('www/index.html', 'utf8');
if (!html.includes(marker)) throw new Error('expected build marker in www/index.html');

const cssRefs = [...html.matchAll(/<link\s+rel=["']stylesheet["']\s+href=["']([^"']+)["']\s*\/?\s*>/gi)].map(m => m[1]);
const scriptRefs = [...html.matchAll(/<script\s+src=["']([^"']+)["']\s*>\s*<\/script>/gi)].map(m => m[1]);
const allowedCss = new Set(['css/style.css','css/components.css','css/ui-fixes.css','css/templates-scroll-fix.css']);
const allowedScripts = new Set(['js/ota-bootstrap.js','js/templates.js','js/app.js','js/ui-integrity.js','js/editor-live.js','js/native-enhancements.js','js/template-direct-preview.js','js/preview-fullscreen-controls.js','js/template-filters-search-fix.js','js/screen-layout-fix.js','js/home-brand-lock.js']);
const assets = [
  ...cssRefs.filter(x => allowedCss.has(x)).map(x => [x,'style']),
  ...scriptRefs.filter(x => allowedScripts.has(x)).map(x => [x,'script'])
];
if (!assets.some(([asset]) => asset === 'js/app.js')) throw new Error('www/index.html must reference js/app.js');
if (!assets.some(([asset]) => asset === 'js/templates.js')) throw new Error('www/index.html must reference js/templates.js');
if (!assets.some(([asset]) => asset === 'js/ota-bootstrap.js')) throw new Error('www/index.html must reference js/ota-bootstrap.js');

for (const [asset, kind] of assets) {
  const source = await readFile(`www/${asset}`, 'utf8');
  const escaped = source.replace(/<\/script/gi, '<\\/script');
  const sourceWithMarker = asset === 'js/ota-bootstrap.js' ? `window.__RESUMATE_OTA_PAYLOAD__ = true;\n${escaped}` : escaped;
  const tag = kind === 'style' ? `<style data-ota-inline="${asset}">\n${source}\n</style>` : `<script data-ota-inline="${asset}">\n${sourceWithMarker}\n</script>`;
  const escapedAsset = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = kind === 'style' ? new RegExp(`<link\\s+rel=["']stylesheet["']\\s+href=["']${escapedAsset}["']\\s*/?>`, 'i') : new RegExp(`<script\\s+src=["']${escapedAsset}["']\\s*>\\s*</script>`, 'i');
  if (!pattern.test(html)) throw new Error(`Missing ${kind} reference for ${asset}`);
  html = html.replace(pattern, tag);
}

html = html.replace(marker, `window.__RESUMATE_BUILD__ = ${build};`);
const externalScripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
if (externalScripts.length) throw new Error(`OTA bundle still has external scripts: ${externalScripts.join(', ')}`);
const externalStyles = [...html.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map(m => m[1]);
if (externalStyles.length) throw new Error(`OTA bundle still has external stylesheets: ${externalStyles.join(', ')}`);
if (!html.includes('window.__RESUMATE_OTA_PAYLOAD__ = true;')) throw new Error('OTA payload marker missing');

const sha256 = createHash('sha256').update(html, 'utf8').digest('hex');
const manifest = { version:`1.0.${build}`, build, schemaVersion:3, updated:new Date().toISOString(), sha256, rollbackEnabled:true, bundle:'index.html' };
await mkdir(outDir, { recursive:true });
await writeFile(`${outDir}/index.html`, html, 'utf8');
await writeFile(`${outDir}/version.json`, `${JSON.stringify(manifest,null,2)}\n`, 'utf8');
console.log(`Prepared self-contained OTA build ${build}`);
