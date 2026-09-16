/* Preserve the real registry id on every Coverflow Use Template action. */
(() => {
  'use strict';
  const wire = () => {
    const screen = document.getElementById('templatesScreen');
    if (!screen?.classList.contains('coverflow-template-host')) return;
    screen.querySelectorAll('.cf-card[data-template-id]').forEach(card => {
      card.dataset.templateDetail = card.dataset.templateId;
    });
  };
  const start = () => {
    const root = document.getElementById('screenRoot') || document.body;
    new MutationObserver(wire).observe(root, {childList:true, subtree:true});
    wire();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
