import { readFile } from 'node:fs/promises';
const html = await readFile('www/index.html', 'utf8');
if (!html.includes('window.__RESUMATE_BUILD__ = 0;')) throw new Error('www/index.html is missing the OTA build marker');
if (!html.includes('js/ota-bootstrap.js')) throw new Error('www/index.html is missing the OTA bootstrap');
console.log('Project check passed: OTA marker and bootstrap are present.');
