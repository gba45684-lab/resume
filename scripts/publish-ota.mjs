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
const allowedCss = new Set(['css/style.css','css/components.css','css/ui-fixes.css','css/home-responsive-fix.css','css/home-fixed-viewport.css','css/templates-scroll-fix.css','css/premium-polish.css']);
const allowedScripts = new Set(['js/ota-bootstrap.js','js/templates.js','js/app.js','js/ui-integrity.js','js/editor-live.js','js/native-enhancements.js','js/template-direct-preview.js','js/preview-fullscreen-controls.js','js/template-label-integrity.js','js/template-filters-search-fix.js','js/screen-layout-fix.js']);
const assets = [
  ...cssRefs.filter(x => allowedCss.has(x)).map(x => [x,'style']),
  ...scriptRefs.filter(x => allowedScripts.has(x)).map(x => [x,'script'])
];