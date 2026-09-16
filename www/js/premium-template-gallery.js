/* Premium animated template gallery. Scoped to #templatesScreen only. */
(() => {
  'use strict';
  const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function modal() {
    let el = document.getElementById('resumateGalleryModal');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'resumateGalleryModal';
    el.innerHTML = '<div class="gallery-modal-box" role="dialog" aria-modal="true" aria-label="Template quick preview"><div class="gallery-modal-head"><span class="gallery-modal-title">Template preview</span><button class="gallery-modal-close" type="button" aria-label="Close preview">×</button></div><div class="gallery-modal-preview"></div><div class="gallery-modal-copy">Quick preview. Use the existing template card action to open the full ResuMate editor/preview flow.</div></div>';
    document.body.appendChild(el);
    const close = () => el.classList.remove('is-open');
    el.querySelector('.gallery-modal-close').addEventListener('click', close);
    el.addEventListener('click', e => { if (e.target === el) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    return el;
  }

  function enhance() {
    const screen = document.getElementById('templatesScreen');
    if (!screen || !screen.classList.contains('active')) return;
    const cards = screen.querySelectorAll('.template-card');
    cards.forEach((card, index) => {
      if (card.dataset.galleryEnhanced === 'true') return;
      card.dataset.galleryEnhanced = 'true';
      if (index < 5) card.dataset.premiumFeatured = 'true';

      const host = card.querySelector('button');
      const preview = card.querySelector('.template-preview');
      if (!host || !preview) return;

      const shine = document.createElement('span');
      shine.className = 'gallery-shine';
      host.appendChild(shine);

      const detail = document.createElement('span');
      detail.className = 'gallery-detail';
      detail.textContent = 'Quick preview';
      host.appendChild(detail);

      if (!reduceMotion()) {
        card.addEventListener('pointermove', e => {
          if (e.pointerType === 'touch') return;
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          const rx = (0.5 - y) * 6;
          const ry = (x - 0.5) * 8;
          card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
          preview.style.setProperty('--gallery-x', `${x * 100}%`);
          preview.style.setProperty('--gallery-y', `${y * 100}%`);
        });
        card.addEventListener('pointerleave', () => { card.style.transform = ''; });
      }

      // Desktop quick-preview: Alt/Option + click. Normal click keeps the app's existing template flow.
      host.addEventListener('click', e => {
        if (!e.altKey) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        const m = modal();
        m.querySelector('.gallery-modal-title').textContent = card.querySelector('.template-meta b')?.textContent || 'Template preview';
        const target = m.querySelector('.gallery-modal-preview');
        target.innerHTML = '';
        const clone = preview.cloneNode(true);
        clone.querySelectorAll('[data-template-detail]').forEach(x => x.removeAttribute('data-template-detail'));
        target.appendChild(clone);
        m.classList.add('is-open');
      }, true);
    });
  }

  const observer = new MutationObserver(() => requestAnimationFrame(enhance));
  const start = () => {
    const root = document.getElementById('screenRoot') || document.body;
    observer.observe(root, { childList: true, subtree: true });
    enhance();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
