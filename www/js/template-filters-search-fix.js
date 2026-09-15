/* Template filters + mobile search keyboard fix. Keeps the existing Templates UI unchanged. */
(() => {
  'use strict';

  const CATEGORIES = ['Modern', 'Professional', 'Minimal', 'Creative', 'Simple'];
  let activeCategory = 'All';
  let searchTerm = '';
  let refreshTimer = 0;

  const normalize = value => String(value || '').trim().toLowerCase();
  const categoryFor = template => {
    const explicit = normalize(template?.family);
    if (explicit === 'professional' || explicit === 'modern' || explicit === 'minimal' || explicit === 'creative') return template.family;
    const layout = normalize(template?.layout);
    if (['sidebar', 'split', 'two-column', 'timeline', 'executive'].includes(layout)) return 'Professional';
    if (['editorial', 'elegant', 'magazine', 'portfolio', 'geometric', 'asymmetric'].includes(layout)) return 'Creative';
    if (['minimal', 'ats', 'mono', 'classic'].includes(layout)) return 'Minimal';
    return Number(template?.id) % 2 ? 'Modern' : 'Simple';
  };

  const cardTemplateId = card => {
    const node = card.querySelector('[data-template-detail]') || card.closest('[data-template-detail]');
    return Number(node?.dataset.templateDetail || card.dataset.templateId || 0);
  };

  function templateCards() {
    const root = document.getElementById('templatesScreen');
    if (!root) return [];
    return [...root.querySelectorAll('[data-template-detail]')].map(el => el.closest('.template-card') || el);
  }

  function apply() {
    const templates = window.TEMPLATES || [];
    templateCards().forEach(card => {
      const id = cardTemplateId(card);
      const t = templates.find(x => Number(x.id) === id);
      const haystack = normalize([t?.name, t?.family, t?.layout, categoryFor(t)].join(' '));
      const categoryMatch = activeCategory === 'All' || normalize(categoryFor(t)) === normalize(activeCategory);
      const searchMatch = !searchTerm || haystack.includes(normalize(searchTerm));
      card.hidden = !(categoryMatch && searchMatch);
      card.style.display = card.hidden ? 'none' : '';
    });
  }

  function findSearchInput() {
    const root = document.getElementById('templatesScreen');
    if (!root) return null;
    return root.querySelector('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]');
  }

  function wire() {
    const root = document.getElementById('templatesScreen');
    if (!root) return;

    const buttons = [...root.querySelectorAll('button,a,[role="button"],input[type="button"]')];
    buttons.forEach(button => {
      const text = String(button.textContent || '').replace(/\s+/g, ' ').trim();
      if (!CATEGORIES.includes(text)) return;
      if (button.dataset.templateFilterFix === '1') return;
      button.dataset.templateFilterFix = '1';
      button.addEventListener('click', event => {
        event.preventDefault();
        activeCategory = text;
        buttons.forEach(other => {
          if (CATEGORIES.includes(String(other.textContent || '').replace(/\s+/g, ' ').trim())) {
            other.classList.toggle('active', other === button);
            other.setAttribute('aria-pressed', other === button ? 'true' : 'false');
          }
        });
        apply();
      });
    });

    const input = findSearchInput();
    if (input && input.dataset.templateSearchFix !== '1') {
      input.dataset.templateSearchFix = '1';
      input.setAttribute('enterkeyhint', 'search');
      input.addEventListener('input', () => {
        searchTerm = input.value;
        apply();
      });
      input.addEventListener('keydown', event => {
        if (event.key !== 'Enter' || event.isComposing) return;
        // Search immediately without allowing the browser/form to navigate or blur the field.
        event.preventDefault();
        event.stopPropagation();
        searchTerm = input.value;
        apply();
      }, true);
    }

    apply();
  }

  function scheduleWire() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(wire, 0);
  }

  document.addEventListener('click', scheduleWire, true);
  document.addEventListener('input', scheduleWire, true);
  window.addEventListener('DOMContentLoaded', scheduleWire, { once: true });
  new MutationObserver(scheduleWire).observe(document.documentElement, { childList: true, subtree: true });
})();
