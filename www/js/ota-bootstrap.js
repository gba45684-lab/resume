/* ResuMate1-style GitHub-branch OTA bootstrap.
 * The OTA publisher creates a self-contained HTML bundle.
 * Activation uses a persistent attempt marker so a failed OTA rolls back on the next launch.
 */
(() => {
  const CURRENT = Number(window.__RESUMATE_BUILD__ || 0);
  const IS_OTA_PAYLOAD = window.__RESUMATE_OTA_PAYLOAD__ === true;
  const KEY_HTML = 'resumate_ota_html_v2';
  const KEY_BUILD = 'resumate_ota_build_v2';
  const KEY_PREVIOUS = 'resumate_ota_previous_html_v2';
  const KEY_PENDING = 'resumate_ota_pending_v2';
  const KEY_ATTEMPT = 'resumate_ota_attempt_v2';
  const BOOT_OK = 'resumate_ota_boot_ok_v2';
  const MANIFEST_URL = 'https://raw.githubusercontent.com/gba45684-lab/resume/ota/version.json';
  const BUILD_URL = 'https://raw.githubusercontent.com/gba45684-lab/resume/ota/index.html';

  // When executing inside the already-downloaded self-contained OTA document,
  // do not run the native bootstrap a second time. The app will report health below.
  if (IS_OTA_PAYLOAD) {
    window.__RESUMATE_OTA_READY__ = () => {
      try {
        sessionStorage.setItem(BOOT_OK, '1');
        localStorage.removeItem(KEY_PENDING);
        localStorage.removeItem(KEY_ATTEMPT);
        localStorage.removeItem(KEY_PREVIOUS);
      } catch {}
    };
    return;
  }

  try { sessionStorage.removeItem(BOOT_OK); } catch {}

  const digest = async text => {
    if (!globalThis.crypto?.subtle) return null;
    const bytes = new TextEncoder().encode(text);
    const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const rollbackPending = () => {
    try {
      const pending = Number(localStorage.getItem(KEY_PENDING) || 0);
      const attempt = Number(localStorage.getItem(KEY_ATTEMPT) || 0);
      const previous = localStorage.getItem(KEY_PREVIOUS);
      if (!pending || !attempt || pending !== attempt || !previous) return false;
      localStorage.setItem(KEY_HTML, previous);
      localStorage.setItem(KEY_BUILD, String(Math.max(0, CURRENT)));
      localStorage.removeItem(KEY_PENDING);
      localStorage.removeItem(KEY_ATTEMPT);
      localStorage.removeItem(KEY_PREVIOUS);
      location.reload();
      return true;
    } catch {}
    return false;
  };

  const activateCached = () => {
    try {
      const html = localStorage.getItem(KEY_HTML);
      const build = Number(localStorage.getItem(KEY_BUILD) || 0);
      if (!html || build <= CURRENT) return false;
      localStorage.setItem(KEY_ATTEMPT, String(build));
      document.open();
      document.write(html);
      document.close();
      return true;
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
      if (!html.includes('window.__RESUMATE_OTA_PAYLOAD__ = true;')) return;
      if (manifest.sha256) {
        const actual = await digest(html);
        if (actual && actual !== manifest.sha256) return;
      }

      const oldHtml = localStorage.getItem(KEY_HTML);
      if (!oldHtml) localStorage.setItem(KEY_PREVIOUS, document.documentElement.outerHTML);
      localStorage.setItem(KEY_HTML, html);
      localStorage.setItem(KEY_BUILD, String(remoteBuild));
      localStorage.setItem(KEY_PENDING, String(remoteBuild));
      localStorage.removeItem(KEY_ATTEMPT);
      location.reload();
    } catch {}
  };

  window.__RESUMATE_OTA_READY__ = () => {
    try {
      sessionStorage.setItem(BOOT_OK, '1');
      localStorage.removeItem(KEY_PENDING);
      localStorage.removeItem(KEY_ATTEMPT);
      localStorage.removeItem(KEY_PREVIOUS);
    } catch {}
  };

  // A pending build that has already been attempted without a health signal is bad.
  // Restore the previous bundle before trying any newer update.
  if (rollbackPending()) return;
  if (activateCached()) return;
  void checkForUpdate();
})();
