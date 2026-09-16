/* ResuMate final UI polish: AI-free navigation + clean premium coverflow. */
(() => {
  'use strict';

  const STYLE_ID = 'resumate-final-ui-polish';
  let cleaning = false;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Keep screen switching clean: no overlapping entrance animations. */
      .screen { animation: none !important; }
      .screen-root { overflow-x: clip; }
      .bottom-nav { contain: layout paint; }

      /* Premium, calm 3D coverflow. The center A4 card is always the visual anchor. */
      #templatesScreen.coverflow-template-host .coverflow-page { padding-bottom: 24px; }
      #templatesScreen.coverflow-template-host .coverflow-viewport {
        height: clamp(500px, 68vh, 620px) !important;
        min-height: 500px;
        perspective: 1900px;
        perspective-origin: 50% 44%;
        overflow: hidden;
        isolation: isolate;
      }
      #templatesScreen.coverflow-template-host .coverflow-track {
        transform-style: preserve-3d;
        width: 100%;
        height: 100%;
      }
      #templatesScreen.coverflow-template-host .cf-card {
        top: 50% !important;
        width: min(338px, 58vw) !important;
        height: clamp(448px, 59vh, 560px) !important;
        transform-origin: 50% 50%;
        transition:
          transform .58s cubic-bezier(.16,1,.3,1),
          opacity .38s ease,
          filter .38s ease,
          box-shadow .58s cubic-bezier(.16,1,.3,1) !important;
        will-change: transform, opacity;
        box-shadow: 0 18px 42px rgba(15,23,42,.12);
      }
      #templatesScreen.coverflow-template-host .cf-card.cf-center {
        transform: translate3d(-50%, -50%, 145px) rotateY(0deg) scale(1) !important;
        opacity: 1;
        filter: none;
        z-index: 30;
        box-shadow: 0 28px 70px rgba(24,22,40,.18), 0 0 0 1px rgba(255,255,255,.82) !important;
      }
      #templatesScreen.coverflow-template-host .cf-card.cf-left {
        transform: translate3d(-119%, -50%, -35px) rotateY(25deg) scale(.78) !important;
        opacity: .38;
        filter: saturate(.82) brightness(.84);
        z-index: 20;
      }
      #templatesScreen.coverflow-template-host .cf-card.cf-right {
        transform: translate3d(19%, -50%, -35px) rotateY(-25deg) scale(.78) !important;
        opacity: .38;
        filter: saturate(.82) brightness(.84);
        z-index: 20;
      }
      #templatesScreen.coverflow-template-host .cf-card.cf-far-left {
        transform: translate3d(-164%, -50%, -135px) rotateY(40deg) scale(.62) !important;
        opacity: .08;
        z-index: 8;
      }
      #templatesScreen.coverflow-template-host .cf-card.cf-far-right {
        transform: translate3d(64%, -50%, -135px) rotateY(-40deg) scale(.62) !important;
        opacity: .08;
        z-index: 8;
      }
      #templatesScreen.coverflow-template-host .cf-card.cf-hidden {
        transform: translate3d(-50%, -50%, -240px) scale(.5) !important;
        opacity: 0;
        pointer-events: none;
      }
      #templatesScreen.coverflow-template-host .cf-paper {
        border-radius: 18px;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.55);
      }
      #templatesScreen.coverflow-template-host .cf-meta {
        bottom: 10px;
        border: 1px solid rgba(255,255,255,.65);
        box-shadow: 0 8px 25px rgba(15,23,42,.08);
      }
      #templatesScreen.coverflow-template-host .cf-nav-btn {
        width: 44px;
        height: 44px;
        border-color: rgba(108,77,246,.16);
        box-shadow: 0 7px 22px rgba(28,24,55,.08);
      }
      #templatesScreen.coverflow-template-host .cf-use {
        min-height: 40px;
        padding: 9px 20px;
        border-radius: 12px;
        background: linear-gradient(135deg,#6c4df6,#8b72ff);
        box-shadow: 0 10px 25px rgba(108,77,246,.22);
      }
      @media (max-width: 560px) {
        #templatesScreen.coverflow-template-host .coverflow-page { padding-left: 8px; padding-right: 8px; }
        #templatesScreen.coverflow-template-host .coverflow-viewport {
          height: clamp(475px, 62vh, 525px) !important;
          min-height: 475px;
          perspective: 1500px;
        }
        #templatesScreen.coverflow-template-host .cf-card {
          width: min(300px, 76vw) !important;
          height: clamp(405px, 55vh, 470px) !important;
        }
        #templatesScreen.coverflow-template-host .cf-card.cf-center {
          transform: translate3d(-50%, -50%, 110px) rotateY(0) scale(1) !important;
        }
        #templatesScreen.coverflow-template-host .cf-card.cf-left {
          transform: translate3d(-118%, -50%, -28px) rotateY(22deg) scale(.76) !important;
          opacity: .3;
        }
        #templatesScreen.coverflow-template-host .cf-card.cf-right {
          transform: translate3d(18%, -50%, -28px) rotateY(-22deg) scale(.76) !important;
          opacity: .3;
        }
        #templatesScreen.coverflow-template-host .cf-card.cf-far-left,
        #templatesScreen.coverflow-template-host .cf-card.cf-far-right { opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        #templatesScreen.coverflow-template-host .cf-card { transition: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function removeAI() {
    if (cleaning) return;
    cleaning = true;
    try {
      document.querySelectorAll('[data-nav="ai"]').forEach(el => el.remove());
      document.querySelectorAll('[data-action="ai"]').forEach(el => el.remove());
      document.querySelectorAll('#aiScreen, #suggestionsScreen').forEach(el => el.remove());
      document.querySelectorAll('a,button,[role="button"],.nav-item,.action-item,.tip-card').forEach(el => {
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (/\bai\b|ai assistant|ai resume|resume suggestions|suggestions|interview coach|resume doctor|tailor with ai/.test(text)) {
          if (!el.closest('#editorScreen')) el.remove();
        }
      });
      document.querySelectorAll('.action-card').forEach(card => {
        const children = [...card.children].filter(el => !el.hidden);
        if (children.length === 0) card.remove();
        else card.style.gridTemplateColumns = `repeat(${Math.min(children.length, 4)}, minmax(0,1fr))`;
      });
    } finally {
      cleaning = false;
    }
  }

  function boot() {
    injectStyle();
    removeAI();
    const observer = new MutationObserver(() => {
      if (cleaning) return;
      requestAnimationFrame(removeAI);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
