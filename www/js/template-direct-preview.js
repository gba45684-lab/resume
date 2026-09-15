/* Direct template selection -> Preview. Keeps the existing editor UI and skips the intermediate detail screen. */
(() => {
  'use strict';

  document.addEventListener('click', event => {
    const card = event.target.closest('[data-template-detail]');
    if (!card) return;

    // The core app currently opens the template-detail screen for this click.
    // Intercept it before the core bubble listener and route the same template
    // through the existing "Use This Template" action, which opens Preview.
    event.preventDefault();
    event.stopImmediatePropagation();

    const id = Number(card.dataset.templateDetail) || 1;
    setTimeout(() => {
      const action = document.createElement('button');
      action.type = 'button';
      action.hidden = true;
      action.dataset.action = 'use-template';
      action.dataset.id = String(id);
      document.body.appendChild(action);
      action.click();
      action.remove();
    }, 0);
  }, true);
})();
