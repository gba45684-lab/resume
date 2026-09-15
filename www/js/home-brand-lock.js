(() => {
  'use strict';

  const HOME_ID = 'homeScreen';
  const ROW_ID = 'homeBrandRow';

  function sync() {
    const home = document.getElementById(HOME_ID);
    const header = document.querySelector('.app-header');
    const eyebrow = home?.querySelector('.eyebrow');
    if (!home || !header || !home.classList.contains('active') || !eyebrow) return;

    let row = document.getElementById(ROW_ID);
    if (!row) {
      row = document.createElement('div');
      row.id = ROW_ID;
      row.className = 'home-brand-row';
      row.innerHTML = '<div class="home-brand-lock brand-lockup" aria-label="ResuMate"><div class="brand-title">ResuMate</div></div><button type="button" class="premium-chip home-premium-chip" aria-label="Premium">♛ <span>PREMIUM</span></button>';
    }

    if (row.parentNode !== home || row.nextElementSibling !== eyebrow) {
      eyebrow.parentNode.insertBefore(row, eyebrow);
    }

    const headerPremium = document.getElementById('premiumBtn');
    const homePremium = row.querySelector('.home-premium-chip');
    if (headerPremium && homePremium && !homePremium.dataset.bound) {
      homePremium.addEventListener('click', () => headerPremium.click());
      homePremium.dataset.bound = '1';
    }

    header.querySelector('.brand-lockup')?.setAttribute('aria-hidden', 'true');
    headerPremium?.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.add('home-brand-confined');
  }

  function clearHomeState() {
    const home = document.getElementById(HOME_ID);
    if (home?.classList.contains('active')) return;
    document.getElementById(ROW_ID)?.remove();
    document.querySelector('.app-header .brand-lockup')?.removeAttribute('aria-hidden');
    document.getElementById('premiumBtn')?.removeAttribute('aria-hidden');
    document.documentElement.classList.remove('home-brand-confined');
  }

  const run = () => { sync(); clearHomeState(); };
  new MutationObserver(run).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 0);
  setTimeout(run, 250);
  setTimeout(run, 750);
})();
