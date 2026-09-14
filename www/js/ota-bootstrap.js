/* ResuMate1-compatible GitHub-branch OTA bootstrap.
 * Main publishes www/index.html to the `ota` branch with version.json.
 * The app downloads that HTML, verifies sha256, stores it locally, and
 * activates it on the next launch. No Capgo service or updater plugin is used.
 */
(() => {
  const CURRENT = Number(window.__RESUMATE_BUILD__ || 0);
  const KEY_HTML = 'resumate_ota_html_v1';
  const KEY_BUILD = 'resumate_ota_build_v1';
  const KEY_PREVIOUS = 'resumate_ota_previous_html_v1';
  const KEY_PENDING = 'resumate_ota_pending_v1';
  const MANIFEST_URL = 'https://raw.githubusercontent.com/gba45684-lab/resume/ota/version.json';
  const BUILD_URL = 'https://raw.githubusercontent.com/gba45684-lab/resume/ota/index.html';

  const digest = async text => {
    if (!globalThis.crypto?.subtle) return null;
    const bytes = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
  };

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
      if (pending && CURRENT === pending && !sessionStorage.getItem('resumate_ota_boot_ok') && previous) {
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
      sessionStorage.setItem('resumate_ota_boot_ok', '1');
      localStorage.removeItem(KEY_PENDING);
    } catch {}
  };

  if (rollbackIfUnhealthy()) return;
  if (activateCached()) return;
  void checkForUpdate();
})();
