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
  'www/index.html','www/css/style.css','www/css/components.css','www/css/template-variants.css',
  'www/js/templates.js','www/js/app.js','www/js/ota-bootstrap.js'
]) assert(exists(file), `Missing required file: ${file}`);

const html = read('www/index.html');
const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
const idCounts = new Map();
ids.forEach(id => idCounts.set(id, (idCounts.get(id) || 0) + 1));
for (const [id, count] of idCounts) if (count > 1) fail.push(`Duplicate DOM id: ${id} (${count} occurrences)`);

const localRefs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
  .map(m => m[1])
  .filter(ref => !/^(https?:|data:|#|javascript:)/i.test(ref));
for (const ref of new Set(localRefs)) assert(exists(path.join('www', ref)), `Missing local web asset: ${ref}`);

assert((html.match(/<script[^>]+src=["']js\/templates\.js["']/g) || []).length === 1, 'templates.js must be loaded exactly once');
assert((html.match(/<script[^>]+src=["']js\/app\.js["']/g) || []).length === 1, 'app.js must be loaded exactly once');
assert((html.match(/<script[^>]+src=["']js\/ota-bootstrap\.js["']/g) || []).length === 1, 'ota-bootstrap.js must be loaded exactly once');
assert(!html.includes('js/ui.js'), 'Obsolete ui.js wiring is still referenced');

const app = read('www/js/app.js');
const templatesSource = read('www/js/templates.js');
const ota = read('www/js/ota-bootstrap.js');
const pkg = JSON.parse(read('package.json'));

for (const file of ['www/js/app.js','www/js/templates.js','www/js/ota-bootstrap.js']) {
  try { execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'ignore' }); }
  catch { fail.push(`JavaScript syntax check failed: ${file}`); }
}

assert(!JSON.stringify(pkg).toLowerCase().includes('capgo'), 'Capgo reference remains in package metadata');
assert(!ota.toLowerCase().includes('capgo'), 'Capgo reference remains in OTA bootstrap');
assert(ota.includes('raw.githubusercontent.com/gba45684-lab/resume/ota/version.json'), 'OTA manifest URL is not configured for resume/ota');
assert(html.includes('window.__RESUMATE_BUILD__ = 0;'), 'OTA build marker missing from main index.html');
assert(html.includes('data-ota="github-branch"'), 'GitHub-branch OTA marker missing from index.html');

// Evaluate the pure template registry in an isolated context so this audit validates
// the real runtime array rather than assuming literal `id: 1` source syntax.
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
} catch (error) {
  fail.push(`Template registry execution failed: ${error?.message || error}`);
}

const addTypes = [...html.matchAll(/data-add=["']([^"']+)["']/g)].map(m => m[1]);
const arrayKeyMatch = app.match(/arrayKey\s*=\s*\{([\s\S]*?)\};/);
const arrayKeyText = arrayKeyMatch?.[1] || '';
for (const type of addTypes) assert(new RegExp(`\\b${type}\\s*:`).test(arrayKeyText), `No state-array wiring for data-add type: ${type}`);

// Verify each form target exists exactly once for the repeater sections.
for (const type of addTypes) {
  const id = type === 'skill' ? 'skillFields' : `${type}Fields`;
  const count = (html.match(new RegExp(`id=["']${id}["']`, 'g')) || []).length;
  assert(count === 1, `Repeater target ${id} must exist exactly once`);
}

if (!exists('package-lock.json')) warn.push('package-lock.json is absent; CI uses npm install, so dependency resolution is not pinned.');
if (html.includes('.pdf,.docx')) warn.push('PDF/DOCX import controls are not supported by the bundled parser.');

console.log(`Audit: ${fail.length ? 'FAILED' : 'PASSED'}`);
if (warn.length) console.log(`Warnings (${warn.length}):\n- ${warn.join('\n- ')}`);
if (fail.length) {
  console.error(`Errors (${fail.length}):\n- ${fail.join('\n- ')}`);
  process.exit(1);
}
