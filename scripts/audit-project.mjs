import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const fail = [];
const warn = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}
function exists(file) {
  return fs.existsSync(path.join(root, file));
}
function assert(condition, message) {
  if (!condition) fail.push(message);
}

assert(exists('www/index.html'), 'Missing www/index.html');
assert(exists('www/css/style.css'), 'Missing www/css/style.css');
assert(exists('www/css/components.css'), 'Missing www/css/components.css');
assert(exists('www/css/template-variants.css'), 'Missing www/css/template-variants.css');
assert(exists('www/js/templates.js'), 'Missing www/js/templates.js');
assert(exists('www/js/app.js'), 'Missing www/js/app.js');
assert(exists('www/js/ota-bootstrap.js'), 'Missing www/js/ota-bootstrap.js');

const html = read('www/index.html');
const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
const idCounts = new Map();
ids.forEach(id => idCounts.set(id, (idCounts.get(id) || 0) + 1));
for (const [id, count] of idCounts) if (count > 1) fail.push(`Duplicate DOM id: ${id} (${count} occurrences)`);

const localRefs = [
  ...[...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m => m[1]),
  ...[...html.matchAll(/<link[^>]+href=["']([^"']+)["']/g)].map(m => m[1])
].filter(ref => !/^(https?:|data:|#|javascript:)/i.test(ref));
for (const ref of new Set(localRefs)) assert(exists(path.join('www', ref)), `Missing local web asset: ${ref}`);

assert((html.match(/<script[^>]+src=["']js\/templates\.js["']/g) || []).length === 1, 'templates.js must be loaded exactly once');
assert((html.match(/<script[^>]+src=["']js\/app\.js["']/g) || []).length === 1, 'app.js must be loaded exactly once');
assert((html.match(/<script[^>]+src=["']js\/ota-bootstrap\.js["']/g) || []).length === 1, 'ota-bootstrap.js must be loaded exactly once');
assert(!html.includes('js/ui.js'), 'Obsolete duplicate ui.js wiring is still referenced');

const app = read('www/js/app.js');
const templates = read('www/js/templates.js');
const ota = read('www/js/ota-bootstrap.js');
const pkg = JSON.parse(read('package.json'));

try {
  execFileSync(process.execPath, ['--check', path.join(root, 'www/js/app.js')], { stdio: 'ignore' });
  execFileSync(process.execPath, ['--check', path.join(root, 'www/js/templates.js')], { stdio: 'ignore' });
  execFileSync(process.execPath, ['--check', path.join(root, 'www/js/ota-bootstrap.js')], { stdio: 'ignore' });
} catch {
  fail.push('JavaScript syntax check failed');
}

assert(!JSON.stringify(pkg).toLowerCase().includes('capgo'), 'Capgo reference remains in package metadata');
assert(!ota.toLowerCase().includes('capgo'), 'Capgo reference remains in OTA bootstrap');
assert(ota.includes('raw.githubusercontent.com/gba45684-lab/resume/ota/version.json'), 'OTA manifest URL is not configured for resume/ota');
assert(html.includes('window.__RESUMATE_BUILD__ = 0;'), 'OTA build marker missing from main index.html');
assert(html.includes('data-ota="github-branch"'), 'GitHub-branch OTA marker missing from index.html');

const templateIds = [...templates.matchAll(/id:\s*(\d+)/g)].map(m => Number(m[1]));
const templateNames = [...templates.matchAll(/name:\s*`([^`]+)`/g)].map(m => m[1]);
assert(templateIds.length === 100, `Expected 100 template records, found ${templateIds.length}`);
assert(new Set(templateIds).size === templateIds.length, 'Template IDs are duplicated');
assert(new Set(templateNames).size === templateNames.length, 'Template names are duplicated');
assert(templates.includes('window.TEMPLATES = TEMPLATES;'), 'Template registry is not exposed to the app');

const addTypes = [...html.matchAll(/data-add=["']([^"']+)["']/g)].map(m => m[1]);
const removeTypes = [...app.matchAll(/arrayKey\s*=\s*\{([\s\S]*?)\};/)].map(m => m[1]).join('');
for (const type of addTypes) assert(new RegExp(`\\b${type}\\s*:`).test(removeTypes), `No array wiring for data-add type: ${type}`);

if (html.includes('accept=".json,.txt,.html,.htm,.pdf,.docx"')) warn.push('PDF/DOCX import controls are advertised without bundled parser support.');
if (!exists('package-lock.json')) warn.push('package-lock.json is absent; CI uses npm install, so dependency resolution is not pinned.');

console.log(`Audit: ${fail.length ? 'FAILED' : 'PASSED'}`);
if (warn.length) console.log(`Warnings (${warn.length}):\n- ${warn.join('\n- ')}`);
if (fail.length) {
  console.error(`Errors (${fail.length}):\n- ${fail.join('\n- ')}`);
  process.exit(1);
}
