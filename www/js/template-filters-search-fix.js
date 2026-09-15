/* Stable Templates filtering/search interaction layer. Keeps the approved UI unchanged. */
(() => {
  'use strict';

  const CATEGORIES = ['Modern', 'Professional', 'Minimal', 'Creative', 'Simple'];
  let activeCategory = 'All';
  let searchTerm = '';
  let applyTimer = 0;

  const normalize = value => String(value || '').trim().toLowerCase();

  // Match the app's own templateCategory() logic exactly.
  function categoryFor(template) {
    const layout = normalize(template?.layout);
    if (['sidebar', 'split', 'two-column', 'timeline'].includes(layout)) return 'Professional';
    if (['editorial', 'elegant', 'magazine'].includes(layout)) return 'Creative';
    if (['minimal', 'ats', 'mono'].includes(layout)) return 'Minimal';
    return Number(template?.id) % 2 ? 'Modern' : 'Simple';
  }

  function root() {
    return document.getElementById('templatesScreen');
  }

  function input() {
    return document.getElementById('templateSearch');
  }

  function cards() {
    const r = root();
    return r ? [...r.querySelectorAll('.template-card')] : [];
  }

  function applyFilters() {
    const templates = window.TEMPLATES || [];
    const q = normalize(searchTerm);

    cards().forEach(card => {
      const trigger = card.querySelector('[data-template-detail]');
      const id = Number(trigger?.dataset.templateDetail || 0);
      const template = templates.find(t => Number(t.id) === id);
      if (!template) {
        card.hidden = true;
        card.style.display = 'none';
        return;
      }

      const category = categoryFor(template);
      const haystack = normalize([template.name, template.layout, category].join(' '));
      const categoryMatch = activeCategory === 'All' || category === activeCategory;
      const searchMatch = !q || haystack.includes(q);
      const visible = categoryMatch && searchMatch;

      card.hidden = !visible;
      card.style.display = visible ? '' : 'none';
    });

    const r = root();
    if (r) {
      r.querySelectorAll('#templateScreenCats .chip').forEach(chip => {
        const selected = (chip.dataset.cat || 'All') === activeCategory;
        chip.classList.toggle('active', selected);
        chip.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });
    }
  }

  function syncFromRenderedScreen() {
    const r = root();
    const i = input();
    if (!r || !i) return;

    // The app may recreate this input when navigating back to Templates.
    i.setAttribute('enterkeyhint', 'search');
    i.setAttribute('autocomplete', 'off');
    if (i.value !== searchTerm) i.value = searchTerm;
    applyFilters();
  }

  function scheduleApply() {
    clearTimeout(applyTimer);
    applyTimer = setTimeout(syncFromRenderedScreen, 0);
  }

  // Capture BEFORE app.js's bubbling input listener. app.js currently rerenders the
  // whole Templates screen on every input, which destroys focus and the mobile IME.
  document.addEventListener('input', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.id !== 'templateSearch') return;

    searchTerm = target.value;
    event.stopPropagation();
    applyFilters();
  }, true);

  // Keep the search field focused when Android/iOS sends Enter from the keyboard.
  // We intentionally do not blur or replace the input node.
  document.addEventListener('keydown', event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.id !== 'templateSearch') return;
    if (event.key !== 'Enter') return;

    if (event.isComposing || event.keyCode === 229) return;

    searchTerm = target.value;
    event.preventDefault();
    event.stopPropagation();
    applyFilters();
  }, true);

  // Category clicks are also intercepted before app.js so the app does not
  // recreate the entire screen and break a smooth mobile interaction.
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const chip = target?.closest('#templateScreenCats [data-cat]');
    if (!chip) return;

    activeCategory = chip.dataset.cat || 'All';
    event.preventDefault();
    event.stopPropagation();
    applyFilters();
  }, true);

  window.addEventListener('DOMContentLoaded', scheduleApply, { once: true });
  new MutationObserver(scheduleApply).observe(document.documentElement, { childList: true, subtree: true });
  scheduleApply();
})();
