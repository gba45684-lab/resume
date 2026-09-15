/* Preview mode polish: keep existing functions, but place editor controls below the resume and make Preview the full-screen workspace. */
(() => {
  'use strict';

  const CONTROL_RE = /add\s+section|reorder|font|style|color|edit\s+content|download\s+pdf|export\s+pdf/i;
  const PREVIEW_RE = /^\s*preview\s*$/i;
  const moved = new WeakSet();

  const textOf = el => String(el?.innerText || el?.textContent || '').replace(/\s+/g, ' ').trim();

  function editorRoot() {
    return document.getElementById('editorScreen') || document.querySelector('[id*="editor"]');
  }

  function previewActive(root) {
    const buttons = [...root.querySelectorAll('button,[role="tab"],a')];
    const preview = buttons.find(b => PREVIEW_RE.test(textOf(b)));
    return !!(preview && (preview.classList.contains('active') || preview.getAttribute('aria-selected') === 'true' || preview.closest('.active')));
  }

  function resumeNode(root) {
    const paper = root.querySelector('.resume-paper');
    if (!paper) return null;
    return paper.closest('.preview-pane,.preview-panel,.editor-preview,.preview-column,.preview-area,.editor-preview-wrap') || paper.parentElement;
  }

  function controls(root) {
    return [...root.querySelectorAll('button,a,[role="button"],select')].filter(el => {
      if (el.closest('.preview-bottom-controls')) return false;
      if (el.closest('.bottom-nav,.app-header')) return false;
      return CONTROL_RE.test(textOf(el) || el.getAttribute('aria-label') || el.getAttribute('title') || '');
    });
  }

  function apply() {
    const root = editorRoot();
    if (!root) return;
    const active = previewActive(root);
    root.classList.toggle('resumate-preview-fullscreen', active);
    if (!active) return;

    const host = resumeNode(root);
    if (!host) return;

    let tray = root.querySelector('.preview-bottom-controls');
    if (!tray) {
      tray = document.createElement('div');
      tray.className = 'preview-bottom-controls';
      tray.setAttribute('aria-label', 'Resume preview controls');
      host.insertAdjacentElement('afterend', tray);
    }

    controls(root).forEach(el => {
      if (moved.has(el)) return;
      moved.add(el);
      const wrapper = el.closest('.field-row,.toolbar-item,.control-item,.editor-action,.action-item') || el;
      if (wrapper && wrapper !== root && wrapper !== host && !wrapper.closest('.preview-bottom-controls')) tray.appendChild(wrapper);
      else tray.appendChild(el);
    });
  }

  document.addEventListener('click', () => setTimeout(apply, 0), true);
  const observer = new MutationObserver(() => {
    clearTimeout(window.__resumatePreviewMoveTimer);
    window.__resumatePreviewMoveTimer = setTimeout(apply, 20);
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class','aria-selected'] });
  window.addEventListener('resize', apply, { passive: true });
  setTimeout(apply, 50);
})();
