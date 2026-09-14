/* Runtime UI integrity guard. It does not replace the app controller; it protects the rendered shell. */
(() => {
  'use strict';
  const screenIds=['homeScreen','templatesScreen','templateDetailScreen','editorScreen','myResumesScreen','aiScreen','suggestionsScreen','premiumScreen','profileScreen'];
  const navNames=['home','templates','ai','profile'];
  const navFor={home:'homeScreen',templates:'templatesScreen',ai:'aiScreen',profile:'profileScreen'};

  function dedupeIds(){
    const seen=new Set();
    document.querySelectorAll('[id]').forEach(el=>{
      if(!el.id)return;
      if(seen.has(el.id)) el.removeAttribute('id'); else seen.add(el.id);
    });
  }

  function enforceScreens(){
    const screens=screenIds.map(id=>document.getElementById(id)).filter(Boolean);
    if(!screens.length)return;
    const active=screens.filter(s=>s.classList.contains('active'));
    if(active.length!==1){
      screens.forEach(s=>s.classList.remove('active'));
      (active[0]||document.getElementById('homeScreen')||screens[0]).classList.add('active');
    }
    const current=screens.find(s=>s.classList.contains('active'));
    const key=Object.keys(navFor).find(k=>navFor[k]===current?.id);
    document.querySelectorAll('.bottom-nav [data-nav]').forEach(btn=>{
      btn.classList.toggle('active',btn.dataset.nav===key);
      btn.setAttribute('aria-current',btn.dataset.nav===key?'page':'false');
    });
  }

  function repairNav(){
    document.querySelectorAll('.bottom-nav [data-nav]').forEach(btn=>{
      const name=btn.dataset.nav;
      if(!navNames.includes(name))btn.remove();
      if(!btn.getAttribute('aria-label'))btn.setAttribute('aria-label',`${name} screen`);
    });
  }

  function repairButtons(){
    document.querySelectorAll('button').forEach(btn=>{
      if(!btn.type)btn.type='button';
      const text=(btn.textContent||'').replace(/\s+/g,' ').trim();
      if(!btn.getAttribute('aria-label') && !text){
        const action=btn.dataset.action||btn.dataset.nav;
        if(action)btn.setAttribute('aria-label',action.replace(/[-_]/g,' '));
      }
    });
  }

  function removeAccidentalDuplicateCards(){
    document.querySelectorAll('.screen.active [data-unique]').forEach(el=>{
      const key=el.getAttribute('data-unique');
      if(!key)return;
      const same=[...document.querySelectorAll(`.screen.active [data-unique="${CSS.escape(key)}"]`)];
      same.slice(1).forEach(x=>x.remove());
    });
  }

  function run(){
    dedupeIds();
    repairNav();
    repairButtons();
    enforceScreens();
    removeAccidentalDuplicateCards();
    document.documentElement.classList.add('ui-integrity-ready');
  }

  window.addEventListener('DOMContentLoaded',run,{once:true});
  const root=document.getElementById('screenRoot');
  if(root){
    new MutationObserver(()=>{
      requestAnimationFrame(()=>{repairButtons();enforceScreens();removeAccidentalDuplicateCards();});
    }).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  }
})();
