/* Connect the premium gallery's five Use Template buttons to the existing ResuMate detail flow. */
(() => {
  'use strict';
  const wire = () => {
    const screen = document.getElementById('templatesScreen');
    if (!screen?.classList.contains('active')) return;
    if (!screen.querySelector('.premium-gallery-page')) {
      screen.classList.remove('premium-gallery-host');
      screen.appendChild(document.createComment('premium-gallery-remount'));
      return;
    }
    screen.querySelectorAll('.premium-gallery-card').forEach((card, index) => {
      const button = card.querySelector('.use-btn');
      if (button) button.dataset.templateDetail = String(index + 1);
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
