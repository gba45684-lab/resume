import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const fail = [];
const warn = [];
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function exists(file) { return fs.existsSync(path.join(root, file)); }
function assert(condition, message) { if (!condition) fail.push(message); }

for (const file of [
  'www/index.html','www/css/style.css','www/css/components.css','www/css/ui-fixes.css',
  'www/js/templates.js','www/js/app.js','www/js/ota-bootstrap.js','www/js/ui-integrity.js','www/js/editor-live.js','www/js/native-enhancements.js',
  'android/app/src/main/java/com/krapal/resumeforge/MainActivity.java','android/app/src/main/java/com/krapal/resumeforge/PdfExportPlugin.java',
  'android/app/src/main/AndroidManifest.xml'
]) assert(exists(file), `Missing required file: ${file}`);

const html = read('www/index.html');
const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
const idCounts = new Map();
ids.forEach(id => idCounts.set(id, (idCounts.get(id) || 0) + 1));
for (const [id, count] of idCounts) if (count > 1) fail.push(`Duplicate DOM id: ${id} (${count} occurrences)`);

const localRefs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
  .map(m => m[1]).filter(ref => !/^(https?:|data:|#|javascript:)/i.test(ref));
for (const ref of new Set(localRefs)) assert(exists(path.join('www', ref)), `Missing local web asset: ${ref}`);

for (const script of ['templates.js','app.js','ota-bootstrap.js','ui-integrity.js','editor-live.js','native-enhancements.js']) {
  assert((html.match(new RegExp(`<script[^>]+src=["']js\\/${script}["']`, 'g')) || []).length === 1, `${script} must be loaded exactly once`);
}
assert(!html.includes('js/ui.js'), 'Obsolete ui.js wiring is still referenced');
assert((html.match(/ResuMate/g) || []).length <= 2, 'Duplicate ResuMate branding detected in main index shell');
assert(!html.includes('brand-subtitle'), 'AI Assistant subtitle remains in the global header');

const app = read('www/js/app.js');
const templatesSource = read('www/js/templates.js');
const ota = read('www/js/ota-bootstrap.js');
const enhancements = read('www/js/native-enhancements.js');
const nativePlugin = read('android/app/src/main/java/com/krapal/resumeforge/PdfExportPlugin.java');
const manifest = read('android/app/src/main/AndroidManifest.xml');
const mainActivity = read('android/app/src/main/java/com/krapal/resumeforge/MainActivity.java');
const pkg = JSON.parse(read('package.json'));

for (const file of ['www/js/app.js','www/js/templates.js','www/js/ota-bootstrap.js','www/js/editor-live.js','www/js/native-enhancements.js']) {
  try { execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'ignore' }); }
  catch { fail.push(`JavaScript syntax check failed: ${file}`); }
}

assert(!JSON.stringify(pkg).toLowerCase().includes('capgo'), 'Capgo reference remains in package metadata');
assert(!ota.toLowerCase().includes('capgo'), 'Capgo reference remains in OTA bootstrap');
assert(ota.includes('raw.githubusercontent.com/gba45684-lab/resume/ota/version.json'), 'OTA manifest URL is not configured for resume/ota');
assert(html.includes('window.__RESUMATE_BUILD__ = 0;'), 'OTA build marker missing from main index.html');
assert(html.includes('data-ota="github-branch"'), 'GitHub-branch OTA marker missing from index.html');

try {
  const context = { window: {} };
  vm.runInNewContext(templatesSource, context, { timeout: 1000 });
  const templates = context.window.TEMPLATES;
  assert(Array.isArray(templates), 'Template registry did not export window.TEMPLATES');
  if (Array.isArray(templates)) {
    const ids = templates.map(t => Number(t.id));
    const names = templates.map(t => String(t.name));
    assert(templates.length === 100, `Expected 100 templates, found ${templates.length}`);
    assert(ids.every(Number.isInteger), 'Template IDs contain non-integers');
    assert(new Set(ids).size === ids.length, 'Template IDs are duplicated');
    assert(new Set(names).size === names.length, 'Template names are duplicated');
    assert(ids.every((id, index) => id === index + 1), 'Template IDs are not sequential 1–100');
    assert(templates.every(t => t.source === 'Project-owned original' && t.license === 'Project-owned'), 'Template licensing metadata is inconsistent');
    assert(templates.every(t => t.layout && t.font && t.color && t.wash), 'Template contains incomplete design metadata');
  }
} catch (error) { fail.push(`Template registry execution failed: ${error?.message || error}`); }

const addTypes = [...html.matchAll(/data-add=["']([^"']+)["']/g)].map(m => m[1]);
const arrayKeyMatch = app.match(/arrayKey\s*=\s*\{([\s\S]*?)\};/);
const arrayKeyText = arrayKeyMatch?.[1] || '';
for (const type of addTypes) assert(new RegExp(`\\b${type}\\s*:`).test(arrayKeyText), `No state-array wiring for data-add type: ${type}`);

assert(enhancements.includes('data-profile-action'), 'Profile actions are not wired by the enhancement layer');
assert(enhancements.includes('PdfExport'), 'PDF export bridge is not wired in the enhancement layer');
assert(enhancements.includes('template-list-modal'), 'Template selector list modal is missing');
assert(enhancements.includes('detail-template-picker'), 'Template picker cleanup is missing');
assert(nativePlugin.includes('MediaStore.Downloads'), 'Native PDF exporter does not target device Downloads');
assert(nativePlugin.includes('showDownloadNotification'), 'Native PDF exporter does not send download notifications');
assert(nativePlugin.includes('ACTION_VIEW'), 'Download notification is not wired to open the PDF');
assert(mainActivity.includes('registerPlugin(PdfExportPlugin.class)'), 'PdfExport plugin is not registered');
assert(manifest.includes('POST_NOTIFICATIONS'), 'Notification permission is missing from Android manifest');
assert(mainActivity.includes('POST_NOTIFICATIONS'), 'Notification permission request is missing');

if (!exists('package-lock.json')) warn.push('package-lock.json is absent; CI uses npm install, so dependency resolution is not pinned.');
if (html.includes('.pdf,.docx')) warn.push('PDF/DOCX import controls are not supported by the bundled parser.');

console.log(`Audit: ${fail.length ? 'FAILED' : 'PASSED'}`);
if (warn.length) console.log(`Warnings (${warn.length}):\n- ${warn.join('\n- ')}`);
if (fail.length) {
  console.error(`Errors (${fail.length}):\n- ${fail.join('\n- ')}`);
  process.exit(1);
}
