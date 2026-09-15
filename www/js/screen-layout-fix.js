/* ResuMate layout guard — locked header/home + guaranteed 100-template registry display. */
(() => {
  'use strict';

  const root = () => document.getElementById('screenRoot');
  const templates = () => document.getElementById('templatesScreen');
  const home = () => document.getElementById('homeScreen');

  function category(t) {
    const l = String(t?.layout || '').toLowerCase();
    if (['sidebar','split','two-column','timeline'].includes(l)) return 'Professional';
    if (['editorial','elegant','magazine'].includes(l)) return 'Creative';
    if (['minimal','ats','mono'].includes(l)) return 'Minimal';
    return Number(t?.id) % 2 ? 'Modern' : 'Simple';
  }

  function syncHome() {
    const r = root();
    const h = home();
    if (!r || !h) return;
    if (h.classList.contains('active')) {
      r.scrollTop = 0;
      r.style.overflowY = 'hidden';
      r.style.touchAction = 'none';
      h.style.overflow = 'hidden';
      h.style.touchAction = 'none';
    } else {
      r.style.overflowY = 'auto';
      r.style.touchAction = 'pan-y';
      h.style.overflow = 'visible';
      h.style.touchAction = 'pan-y';
    }
  }

  function ensure100() {
    const screen = templates();
    const all = Array.isArray(window.TEMPLATES) ? window.TEMPLATES : [];
    if (!screen || all.length < 100 || !screen.classList.contains('active')) return;
    const grid = screen.querySelector('.template-grid');
    if (!grid) return;

    const byId = new Map([...grid.querySelectorAll('[data-template-detail]')]
      .map(el => [Number(el.dataset.templateDetail), el]));
    let seed = grid.querySelector('.template-card');
    if (!seed) return;

    all.slice(0, 100).forEach(t => {
      if (byId.has(Number(t.id))) return;
      const card = seed.cloneNode(true);
      card.dataset.templateDetail = String(t.id);
      card.setAttribute('data-template-id', String(t.id));
      card.classList.remove('active', 'selected');
      const title = card.querySelector('.template-name, .template-title, h3, h4, strong');
      if (title) title.textContent = t.name;
      const categoryEl = card.querySelector('.template-category');
      if (categoryEl) categoryEl.textContent = category(t);
      const numberEl = card.querySelector('[data-template-number], .template-number');
      if (numberEl) numberEl.textContent = String(t.id).padStart(2, '0');
      const preview = card.querySelector('.mini-paper');
      if (preview) {
        preview.style.setProperty('--accent', t.color || '#6b2d1f');
        preview.style.setProperty('--wash', t.wash || '#f2e7d5');
        preview.style.setProperty('--font', t.font || 'Arial');
        const top = preview.querySelector('.mini-top');
        if (top) top.textContent = String(t.id).padStart(2, '0') + ' ' + t.name.replace(/^\d+\s*/, '');
      }
      grid.appendChild(card);
      byId.set(Number(t.id), card);
    });

    const search = String(screen.querySelector('#templateSearch')?.value || '').trim().toLowerCase();
    const active = screen.querySelector('#templateScreenCats .chip.active')?.dataset.cat || 'All';
    [...grid.querySelectorAll('[data-template-detail]')].forEach(card => {
      const id = Number(card.dataset.templateDetail);
      const t = all.find(x => Number(x.id) === id);
      if (!t) return;
      const hay = `${t.name} ${t.family} ${t.layout} ${category(t)}`.toLowerCase();
      const matchesSearch = !search || hay.includes(search);
      const matchesCategory = !active || active === 'All' || category(t) === active;
      card.hidden = !(matchesSearch && matchesCategory);
    });
  }

  function sync() {
    syncHome();
    ensure100();
  }

  const observer = new MutationObserver(() => requestAnimationFrame(sync));
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  document.addEventListener('click', () => setTimeout(sync, 0), true);
  document.addEventListener('input', e => {
    if (e.target?.id === 'templateSearch') setTimeout(sync, 0);
  }, true);
  window.addEventListener('resize', sync, { passive: true });
  requestAnimationFrame(sync);
})();
