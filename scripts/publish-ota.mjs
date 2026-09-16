// ResuMate OTA publisher.
// Builds a self-contained HTML payload for the `ota` branch.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';

const build = Number.parseInt(process.argv[2], 10);
const outDirArg = process.argv[3];

if (!Number.isInteger(build) || build < 1) {
  throw new Error('usage: publish-ota.mjs <build-number> <out-dir>');
}
if (!outDirArg) {
  throw new Error('usage: publish-ota.mjs <build-number> <out-dir>');
}

const root = process.cwd();
const outDir = resolve(root, outDirArg);
const sourceHtmlPath = resolve(root, 'www/index.html');

const BUILD_MARKER = 'window.__RESUMATE_BUILD__ = 0;';
const OTA_MARKER = 'window.__RESUMATE_OTA_PAYLOAD__ = true;';

const allowedCss = new Set([
  'css/style.css',
  'css/components.css',
  'css/ui-fixes.css',
  'css/home-responsive-fix.css',
  'css/home-fixed-viewport.css',
  'css/templates-scroll-fix.css',
  'css/premium-polish.css',
  'css/premium-template-gallery.css',
]);

const allowedScripts = new Set([
  'js/ota-bootstrap.js',
  'js/templates.js',
  'js/app.js',
  'js/ui-integrity.js',
  'js/editor-live.js',
  'js/native-enhancements.js',
  'js/template-direct-preview.js',
  'js/preview-fullscreen-controls.js',
  'js/template-label-integrity.js',
  'js/template-filters-search-fix.js',
  'js/screen-layout-fix.js',
  'js/premium-template-gallery.js',
  'js/premium-template-actions.js',
]);

const normalizeAsset = (value) => {
  const cleaned = value.trim().replace(/^\.\//, '');
  if (!cleaned || cleaned.includes('://') || cleaned.startsWith('//') || cleaned.startsWith('data:')) {
    return cleaned;
  }
  return cleaned.split(/[?#]/, 1)[0];
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');

let html = await readFile(sourceHtmlPath, 'utf8');
if (!html.includes(BUILD_MARKER)) {
  throw new Error('expected build marker in www/index.html');
}

const cssRefs = [...html.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi)]
  .map((m) => normalizeAsset(m[1]));
const scriptRefs = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/gi)]
  .map((m) => normalizeAsset(m[1]));

const selectedCss = [...new Set(cssRefs.filter((ref) => allowedCss.has(ref)))];
const selectedScripts = [...new Set(scriptRefs.filter((ref) => allowedScripts.has(ref)))];

for (const ref of selectedCss) {
  const file = resolve(root, 'www', ref);
  const relativeFile = relative(resolve(root, 'www'), file);
  if (!relativeFile || relativeFile.startsWith('..')) {
    throw new Error(`CSS path escapes www/: ${ref}`);
  }
  html = html.replace(
    new RegExp(`<link\\b[^>]*\\brel=["']stylesheet["'][^>]*\\bhref=["']${escapeRegExp(ref)}["'][^>]*>`, 'i'),
    `<style data-ota-inline="${ref}">\n${await readFile(file, 'utf8')}\n</style>`,
  );
}

for (const ref of selectedScripts) {
  const file = resolve(root, 'www', ref);
  const relativeFile = relative(resolve(root, 'www'), file);
  if (!relativeFile || relativeFile.startsWith('..')) {
    throw new Error(`JS path escapes www/: ${ref}`);
  }
  html = html.replace(
    new RegExp(`<script\\b[^>]*\\bsrc=["']${escapeRegExp(ref)}["'][^>]*>\\s*<\\/script>`, 'i'),
    `<script data-ota-inline="${ref}">\n${await readFile(file, 'utf8')}\n</script>`,
  );
}

// The OTA document must be self-contained. Any remaining local CSS/JS reference
// is an error rather than silently publishing a broken update.
const remainingLocalStyles = [...html.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi)]
  .map((m) => normalizeAsset(m[1]))
  .filter((ref) => ref && !ref.includes('://') && !ref.startsWith('//') && !ref.startsWith('data:'));
if (remainingLocalStyles.length) {
  throw new Error(`un-inlined stylesheet references remain: ${remainingLocalStyles.join(', ')}`);
}

const remainingLocalScripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/gi)]
  .map((m) => normalizeAsset(m[1]))
  .filter((ref) => ref && !ref.includes('://') && !ref.startsWith('//') && !ref.startsWith('data:'));
if (remainingLocalScripts.length) {
  throw new Error(`un-inlined script references remain: ${remainingLocalScripts.join(', ')}`);
}

html = html.replace(
  /window\.\__RESUMATE_BUILD__\s*=\s*0\s*;/,
  `window.__RESUMATE_BUILD__ = ${build};`,
);

if (!html.includes(`window.__RESUMATE_BUILD__ = ${build};`)) {
  throw new Error(`failed to stamp OTA build ${build}`);
}

// Keep the marker exactly once so the bootstrap can distinguish an OTA payload.
html = html.replace(/window\.\__RESUMATE_OTA_PAYLOAD__\s*=\s*true\s*;?/g, '');
const headMarker = `<script>${OTA_MARKER}</script>`;
if (/<head\b[^>]*>/i.test(html)) {
  html = html.replace(/<head\b[^>]*>/i, (tag) => `${tag}\n${headMarker}`);
} else {
  html = `${headMarker}\n${html}`;
}

const markerCount = (html.match(/window\.\__RESUMATE_OTA_PAYLOAD__\s*=\s*true\s*;/g) || []).length;
if (markerCount !== 1) {
  throw new Error(`OTA payload marker count is ${markerCount}, expected 1`);
}

if (/<script\b[^>]*\bsrc=/i.test(html) || /<link\b[^>]*\brel=["']stylesheet["']/i.test(html)) {
  throw new Error('OTA payload still contains external script/style tags');
}

await mkdir(outDir, { recursive: true });
const htmlPath = resolve(outDir, 'index.html');
const versionPath = resolve(outDir, 'version.json');
await writeFile(htmlPath, html, 'utf8');

const digest = sha256(html);
const manifest = {
  version: `1.0.${build}`,
  build,
  schemaVersion: 3,
  updated: new Date().toISOString(),
  sha256: digest,
  rollbackEnabled: true,
  bundle: 'index.html',
};

await writeFile(versionPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

// Final read-back checks catch partial writes before Git publication.
const writtenHtml = await readFile(htmlPath, 'utf8');
const writtenManifest = JSON.parse(await readFile(versionPath, 'utf8'));
if (writtenManifest.build !== build) throw new Error('version.json build mismatch');
if (writtenManifest.sha256 !== sha256(writtenHtml)) throw new Error('version.json SHA-256 mismatch');
if (!writtenHtml.includes(`window.__RESUMATE_BUILD__ = ${build};`)) throw new Error('final HTML build marker missing');
if (!writtenHtml.includes(OTA_MARKER)) throw new Error('final HTML OTA marker missing');

console.log(`[OTA] Published payload prepared: build=${build}`);
console.log(`[OTA] index.html bytes=${Buffer.byteLength(writtenHtml, 'utf8')}`);
console.log(`[OTA] sha256=${writtenManifest.sha256}`);
console.log(`[OTA] css inlined=${selectedCss.length}; js inlined=${selectedScripts.length}`);
