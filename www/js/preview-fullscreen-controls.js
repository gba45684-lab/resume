/* Permanently remove the legacy editor controls from the entire app. */
(() => {
  'use strict';

  const CONTROL_RE = /^(add\s+section|reorder|font(?:\s+style)?|style|color|edit\s+content|download\s+pdf|export\s+pdf)$/i;
  const LABEL_RE = /add\s+section|reorder|font\s*(style)?|edit\s+content|download\s+pdf|export\s+pdf/i;

  const textOf = el => String(el?.innerText || el?.textContent || '').replace(/\s+/g, ' ').trim();

  function shouldRemove(el) {
    if (!(el instanceof Element)) return false;
    if (el.closest('.app-header,.bottom-nav')) return false;
    const text = textOf(el);
    const label = String(el.getAttribute('aria-label') || el.getAttribute('title') || '').trim();
    return CONTROL_RE.test(text) || LABEL_RE.test(label);
  }

  function removeLegacyControls() {
    document.querySelectorAll('button,a,[role="button"],[role="tab"],select').forEach(el => {
      if (shouldRemove(el)) {
        const wrapper = el.closest('.field-row,.toolbar-item,.control-item,.editor-action,.action-item');
        if (wrapper && wrapper !== document.body && wrapper !== document.documentElement) wrapper.remove();
        else el.remove();
      }
    });
  }

  // Run globally so the controls cannot reappear when navigating between screens.
  removeLegacyControls();
  const observer = new MutationObserver(() => removeLegacyControls());
  observer.observe(document.body, { childList: true, subtree: true });
})();
