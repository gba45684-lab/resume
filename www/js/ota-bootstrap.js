/* ResuMate1-style GitHub-branch OTA bootstrap.
 * The OTA publisher creates a self-contained HTML bundle, so the active update
 * does not depend on remote relative CSS/JS files.
 */
(() => {
  const CURRENT = Number(window.__RESUMATE_BUILD__ || 0);
  const KEY_HTML = 'resumate_ota_html_v1';
  const KEY_BUILD = 'resumate_ota_build_v1';
  const KEY_PREVIOUS = 'resumate_ota_previous_html_v1';
  const KEY_PENDING = 'resumate_ota_pending_v1';
  const BOOT_OK = 'resumate_ota_boot_ok';
  const MANIFEST_URL = 'https://raw.githubusercontent.com/gba45684-lab/resume/ota/version.json';
  const BUILD_URL = 'https://raw.githubusercontent.com/gba45684-lab/resume/ota/index.html';

  const digest = async text => {
    if (!globalThis.crypto?.subtle) return null;
    const bytes = new TextEncoder().encode(text);
    const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Every document load must prove health again. The app sets BOOT_OK only
  // after its own JavaScript has initialized successfully.
  try { sessionStorage.removeItem(BOOT_OK); } catch {}

  const activateCached = () => {
    try {
      const html = localStorage.getItem(KEY_HTML);
      const build = Number(localStorage.getItem(KEY_BUILD) || 0);
      if (html && build > CURRENT) {
        document.open();
        document.write(html);
        document.close();
        return true;
      }
    } catch {}
    return false;
  };

  const rollbackIfUnhealthy = () => {
    try {
      const pending = Number(localStorage.getItem(KEY_PENDING) || 0);
      const previous = localStorage.getItem(KEY_PREVIOUS);
      if (pending && CURRENT === pending && !sessionStorage.getItem(BOOT_OK) && previous) {
        localStorage.setItem(KEY_HTML, previous);
        localStorage.setItem(KEY_BUILD, String(Math.max(0, CURRENT - 1)));
        localStorage.removeItem(KEY_PENDING);
        location.reload();
        return true;
      }
    } catch {}
    return false;
  };

  const checkForUpdate = async () => {
    try {
      const response = await fetch(`${MANIFEST_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return;
      const manifest = await response.json();
      const remoteBuild = Number(manifest.build || 0);
      if (!remoteBuild || remoteBuild <= CURRENT) return;

      const htmlResponse = await fetch(`${BUILD_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!htmlResponse.ok) return;
      const html = await htmlResponse.text();
      if (!html.includes(`window.__RESUMATE_BUILD__ = ${remoteBuild};`)) return;
      if (!/window\.TEMPLATES\s*=|const\s+TEMPLATES\s*=/.test(html)) return;
      if (manifest.sha256) {
        const actual = await digest(html);
        if (actual && actual !== manifest.sha256) return;
      }

      const oldHtml = localStorage.getItem(KEY_HTML);
      if (!oldHtml) localStorage.setItem(KEY_PREVIOUS, document.documentElement.outerHTML);
      localStorage.setItem(KEY_HTML, html);
      localStorage.setItem(KEY_BUILD, String(remoteBuild));
      localStorage.setItem(KEY_PENDING, String(remoteBuild));
      location.reload();
    } catch {}
  };

  window.__RESUMATE_OTA_READY__ = () => {
    try {
      sessionStorage.setItem(BOOT_OK, '1');
      localStorage.removeItem(KEY_PENDING);
    } catch {}
  };

  if (rollbackIfUnhealthy()) return;
  if (activateCached()) return;
  void checkForUpdate();
})();
