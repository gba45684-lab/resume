/* ResuMate — premium 3D coverflow polish. Visual/interaction layer only. */
(() => {
  'use strict';

  const STYLE_ID = 'resumate-coverflow-premium-polish';
  const CSS = `
    #templatesScreen.coverflow-template-host .coverflow-viewport {
      height: clamp(470px, 62vh, 590px) !important;
      perspective: 2200px !important;
      perspective-origin: 50% 42%;
      overscroll-behavior: contain;
    }
    #templatesScreen.coverflow-template-host .coverflow-track {
      transform-style: preserve-3d;
      perspective: inherit;
    }
    #templatesScreen.coverflow-template-host .cf-card {
      width: min(330px, 58vw) !important;
      height: clamp(445px, 59vh, 555px) !important;
      border-radius: 22px !important;
      border: 1px solid rgba(255,255,255,.72) !important;
      box-shadow: 0 22px 55px rgba(20,18,28,.18), 0 2px 0 rgba(255,255,255,.8) inset !important;
      transition:
        transform .82s cubic-bezier(.16,1,.3,1),
        opacity .58s ease,
        filter .58s cubic-bezier(.2,.8,.2,1),
        box-shadow .82s cubic-bezier(.16,1,.3,1) !important;
      will-change: transform, opacity, filter;
    }
    #templatesScreen.coverflow-template-host .cf-card.cf-center {
      transform: translate3d(-50%,0,150px) rotateY(0deg) rotateX(0deg) scale(1.015) !important;
      box-shadow: 0 30px 72px rgba(24,20,35,.23), 0 0 0 1px rgba(255,255,255,.72) !important;
    }
    #templatesScreen.coverflow-template-host .cf-card.cf-left {
      transform: translate3d(-116%,10px,-35px) rotateY(27deg) rotateX(1deg) scale(.79) !important;
      filter: brightness(.82) saturate(.86) blur(.1px) !important;
      opacity: .48 !important;
    }
    #templatesScreen.coverflow-template-host .cf-card.cf-right {
      transform: translate3d(16%,10px,-35px) rotateY(-27deg) rotateX(1deg) scale(.79) !important;
      filter: brightness(.82) saturate(.86) blur(.1px) !important;
      opacity: .48 !important;
    }
    #templatesScreen.coverflow-template-host .cf-card.cf-far-left {
      transform: translate3d(-155%,24px,-145px) rotateY(43deg) scale(.63) !important;
      opacity: .08 !important;
    }
    #templatesScreen.coverflow-template-host .cf-card.cf-far-right {
      transform: translate3d(55%,24px,-145px) rotateY(-43deg) scale(.63) !important;
      opacity: .08 !important;
    }
    #templatesScreen.coverflow-template-host .cf-paper {
      padding: 19px !important;
      background:
        linear-gradient(135deg,rgba(255,255,255,.98),rgba(247,248,251,.98)) !important;
      box-shadow: inset 0 0 0 1px rgba(20,30,45,.035);
    }
    #templatesScreen.coverflow-template-host .cf-paper::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(120deg,transparent 25%,rgba(255,255,255,.55) 48%,transparent 68%);
      transform: translateX(-120%);
      transition: transform 1.15s cubic-bezier(.16,1,.3,1);
    }
    #templatesScreen.coverflow-template-host .cf-center .cf-paper::before {
      transform: translateX(120%);
    }
    #templatesScreen.coverflow-template-host .cf-meta {
      left: 11px !important;
      right: 11px !important;
      bottom: 11px !important;
      padding: 9px 11px !important;
      border-radius: 13px !important;
      background: rgba(255,255,255,.76) !important;
      border: 1px solid rgba(255,255,255,.9);
      box-shadow: 0 8px 22px rgba(20,20,30,.09);
      backdrop-filter: blur(16px) saturate(1.25);
    }
    #templatesScreen.coverflow-template-host .coverflow-nav {
      margin-top: 2px;
      gap: 13px;
    }
    #templatesScreen.coverflow-template-host .cf-nav-btn {
      width: 43px;
      height: 43px;
      border-color: rgba(180,134,39,.18);
      background: rgba(255,255,255,.82);
      box-shadow: 0 8px 22px rgba(20,20,30,.08);
      backdrop-filter: blur(12px);
    }
    #templatesScreen.coverflow-template-host .cf-nav-btn:hover {
      transform: translateY(-2px) scale(1.04);
      box-shadow: 0 12px 28px rgba(20,20,30,.13);
    }
    #templatesScreen.coverflow-template-host .cf-use {
      margin-top: 9px;
      padding: 10px 22px;
      border-radius: 999px;
      background: linear-gradient(135deg,#17131f,#35284b);
      box-shadow: 0 10px 26px rgba(34,24,52,.2);
      transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s ease !important;
    }
    #templatesScreen.coverflow-template-host .cf-use:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 15px 34px rgba(34,24,52,.26);
    }
    @media (max-width:560px) {
      #templatesScreen.coverflow-template-host .coverflow-viewport {
        height: clamp(410px, 61vh, 505px) !important;
      }
      #templatesScreen.coverflow-template-host .cf-card {
        width: min(292px,76vw) !important;
        height: clamp(390px, 56vh, 470px) !important;
        border-radius: 20px !important;
      }
      #templatesScreen.coverflow-template-host .cf-card.cf-left {
        transform: translate3d(-111%,10px,-30px) rotateY(25deg) scale(.76) !important;
      }
      #templatesScreen.coverflow-template-host .cf-card.cf-right {
        transform: translate3d(11%,10px,-30px) rotateY(-25deg) scale(.76) !important;
      }
      #templatesScreen.coverflow-template-host .cf-paper { padding: 15px !important; }
    }
    @media (prefers-reduced-motion:reduce) {
      #templatesScreen.coverflow-template-host .cf-card,
      #templatesScreen.coverflow-template-host .cf-nav-btn,
      #templatesScreen.coverflow-template-host .cf-use { transition:none !important; }
      #templatesScreen.coverflow-template-host .cf-paper::before { display:none; }
    }
  `;

  function install() {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    const viewport = document.querySelector('#templatesScreen.coverflow-template-host .coverflow-viewport');
    if (!viewport || viewport.dataset.premiumPointer === '1') return;
    viewport.dataset.premiumPointer = '1';
    let startX = 0;
    let startY = 0;
    let tracking = false;
    viewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      startX = event.clientX;
      startY = event.clientY;
      tracking = true;
    }, { passive:true });
    viewport.addEventListener('pointerup', (event) => {
      if (!tracking) return;
      tracking = false;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
        document.getElementById(dx < 0 ? 'cfNext' : 'cfPrev')?.click();
      }
    }, { passive:true });
    viewport.addEventListener('pointercancel', () => { tracking = false; }, { passive:true });
  }

  const observer = new MutationObserver(install);
  observer.observe(document.body, { childList:true, subtree:true });
  install();
})();
