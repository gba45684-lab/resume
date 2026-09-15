/* Preview/template label integrity: consistent title casing and no legacy Change control. */
(() => {
  'use strict';

  const titleCase = value => String(value || '').trim().replace(/\b([a-z])([a-z0-9]*)\b/gi, (_, a, b) => a.toUpperCase() + b.toLowerCase());
  const templateRoots = () => [document.querySelector('#templatesScreen'), document.querySelector('#templateDetailScreen')].filter(Boolean);

  const normalizeTemplateLabels = root => {
    root.querySelectorAll('[data-template-name], .template-name, .template-title, .template-label, .template-card-title').forEach(el => {
      const text = String(el.textContent || '').trim();
      const match = text.match(/^(\d{1,3})\s*[-:.]?\s*(.+)$/);
      if (match) el.textContent = `${String(Number(match[1])).padStart(2, '0')} ${titleCase(match[2])}`;
      else if (text) el.textContent = titleCase(text);
    });
  };

  const removeLegacyChange = root => {
    root.querySelectorAll('button,a,[role="button"]').forEach(el => {
      if (String(el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase() !== 'change') return;
      const wrapper = el.closest('.field-row,.toolbar-item,.control-item,.editor-action,.action-row,.action-item');
      (wrapper || el).remove();
    });
  };

  const run = () => templateRoots().forEach(root => {
    normalizeTemplateLabels(root);
    removeLegacyChange(root);
  });

  run();
  new MutationObserver(run).observe(document.body, {childList:true, subtree:true});
})();
