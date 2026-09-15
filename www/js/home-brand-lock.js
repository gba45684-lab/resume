(() => {
  'use strict';

  const HOME_ID = 'homeScreen';
  const BRAND_ID = 'homeBrandLock';

  function sync() {
    const home = document.getElementById(HOME_ID);
    if (!home || !home.classList.contains('active')) return;

    const eyebrow = home.querySelector('.eyebrow');
    if (!eyebrow) return;

    let brand = document.getElementById(BRAND_ID);
    if (!brand) {
      brand = document.createElement('div');
      brand.id = BRAND_ID;
      brand.className = 'home-brand-lock brand-lockup';
      brand.setAttribute('aria-label', 'ResuMate');
      brand.innerHTML = '<div class="brand-title">ResuMate</div>';
    }

    if (brand.nextElementSibling !== eyebrow) {
      eyebrow.parentNode.insertBefore(brand, eyebrow);
    }

    document.querySelector('.app-header .brand-lockup')?.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.add('home-brand-confined');
  }

  function clearHomeState() {
    if (!document.getElementById(HOME_ID)?.classList.contains('active')) {
      document.documentElement.classList.remove('home-brand-confined');
      document.querySelector('.app-header .brand-lockup')?.removeAttribute('aria-hidden');
    }
  }

  const run = () => { sync(); clearHomeState(); };
  new MutationObserver(run).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 0);
  setTimeout(run, 250);
  setTimeout(run, 750);
})();
