/* Preserve the real registry id on every Coverflow Use Template action and keep gallery controls on the app UI system. */
(() => {
  'use strict';
  const uiStyle = `
    #templatesScreen.coverflow-template-host .coverflow-heading{justify-content:flex-start;margin:0 0 10px;padding:0 2px;min-height:34px}
    #templatesScreen.coverflow-template-host .coverflow-heading h2{font:inherit;font-size:clamp(20px,2.2vw,24px);line-height:1.2;font-weight:700;letter-spacing:0;color:var(--text,#182033);background:none;-webkit-background-clip:initial;background-clip:initial;color:var(--text,#182033);text-shadow:none}
    #templatesScreen.coverflow-template-host .coverflow-tools{justify-content:flex-start;gap:8px;margin:0 0 9px;padding:0 2px;font-family:inherit}
    #templatesScreen.coverflow-template-host .coverflow-tools input,
    #templatesScreen.coverflow-template-host .coverflow-tools select{font:inherit;font-size:13px;font-weight:500;height:36px;border:1px solid var(--border,rgba(127,127,127,.2));border-radius:9px;background:var(--surface,#fff);color:var(--text,#182033);box-shadow:none}
    #templatesScreen.coverflow-template-host .coverflow-tools input::placeholder{color:var(--muted,#6b7280);opacity:.78}
    #templatesScreen.coverflow-template-host .coverflow-tools input:focus,
    #templatesScreen.coverflow-template-host .coverflow-tools select:focus{border-color:var(--primary,#304b68);box-shadow:0 0 0 2px color-mix(in srgb,var(--primary,#304b68) 12%,transparent)}
    #templatesScreen.coverflow-template-host .coverflow-count{font:inherit;font-size:11px;color:var(--muted,#6b7280);opacity:.72;text-align:left;margin:0 2px 5px}
    @media(max-width:560px){
      #templatesScreen.coverflow-template-host .coverflow-heading{margin-bottom:7px}
      #templatesScreen.coverflow-template-host .coverflow-heading h2{font-size:19px}
      #templatesScreen.coverflow-template-host .coverflow-tools{gap:6px;margin-bottom:7px}
      #templatesScreen.coverflow-template-host .coverflow-tools input,
      #templatesScreen.coverflow-template-host .coverflow-tools select{height:35px;font-size:12px}
    }
  `;
  const wire = () => {
    const screen = document.getElementById('templatesScreen');
    if (!screen?.classList.contains('coverflow-template-host')) return;
    if (!document.getElementById('resumate-template-ui-style')) {
      const style = document.createElement('style');
      style.id = 'resumate-template-ui-style';
      style.textContent = uiStyle;
      document.head.appendChild(style);
    }
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
