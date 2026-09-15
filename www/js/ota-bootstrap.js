/* ResuMate1-style GitHub-branch OTA bootstrap + long update alert. */
(() => {
  const CURRENT = Number(window.__RESUMATE_BUILD__ || 0);
  const IS_OTA_PAYLOAD = window.__RESUMATE_OTA_PAYLOAD__ === true;
  const KEY_HTML = 'resumate_ota_html_v2';
  const KEY_BUILD = 'resumate_ota_build_v2';
  const KEY_PREVIOUS = 'resumate_ota_previous_html_v2';
  const KEY_PENDING = 'resumate_ota_pending_v2';
  const KEY_ATTEMPT = 'resumate_ota_attempt_v2';
  const KEY_ALERTED = 'resumate_ota_alerted_build_v1';
  const BOOT_OK = 'resumate_ota_boot_ok_v2';
  const MANIFEST_URL = 'https://raw.githubusercontent.com/gba45684-lab/resume/ota/version.json';
  const BUILD_URL = 'https://raw.githubusercontent.com/gba45684-lab/resume/ota/index.html';

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

  const nativeAlert = async (method, args = {}) => {
    try {
      const plugin = globalThis.Capacitor?.Plugins?.ResuMateUpdateAlert;
      if (plugin?.[method]) {
        await plugin[method](args);
        return true;
      }
    } catch {}
    return false;
  };

  const showUpdateIndicator = build => {
    try {
      let bar = document.getElementById('resumate-ota-update-alert');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'resumate-ota-update-alert';
        bar.setAttribute('role', 'status');
        bar.style.cssText = 'position:fixed;left:12px;right:12px;top:12px;z-index:2147483646;padding:13px 15px;border-radius:14px;background:#2f241d;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.24);font:700 14px/1.35 system-ui,sans-serif;text-align:center;';
        document.body.appendChild(bar);
      }
      bar.textContent = `ResuMate update ${build} found — updating in a few seconds…`;
    } catch {}
  };

  const alertForUpdate = async build => {
    try {
      if (Number(localStorage.getItem(KEY_ALERTED) || 0) === build) return;
      localStorage.setItem(KEY_ALERTED, String(build));
    } catch {}
    showUpdateIndicator(build);
    const native = await nativeAlert('ringUpdate', { build });
    if (!native) {
      try { navigator.vibrate?.([0, 350, 180, 350, 180, 700]); } catch {}
    }
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

  const getCachedBuild = () => {
    try { return Number(localStorage.getItem(KEY_BUILD) || 0); } catch { return 0; }
  };

  const activateCached = () => {
    try {
      const html = localStorage.getItem(KEY_HTML);
      const build = getCachedBuild();
      if (!html || build <= CURRENT) return false;
      localStorage.setItem(KEY_ATTEMPT, String(build));
      document.open();
      document.write(html);
      document.close();
      return true;
    } catch {}
    return false;
  };

  const checkForUpdate = async (baseline = CURRENT) => {
    try {
      const response = await fetch(`${MANIFEST_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return;
      const manifest = await response.json();
      const remoteBuild = Number(manifest.build || 0);
      // When a cached OTA payload is already active, compare against its build.
      if (!remoteBuild || remoteBuild <= baseline) return;
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

      // Alert first so an OTA update is visibly/audibly acknowledged before
      // the cached payload is activated. The native Android plugin rings for
      // 8 seconds and applies a vibration pattern; browser fallback vibrates.
      await alertForUpdate(remoteBuild);
      setTimeout(() => location.reload(), 8000);
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

  if (rollbackPending()) return;

  if (activateCached()) {
    const cachedBuild = getCachedBuild();
    setTimeout(() => { void checkForUpdate(cachedBuild); }, 1200);
    return;
  }
  void checkForUpdate(CURRENT);
})();
