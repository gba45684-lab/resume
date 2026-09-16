/* ResuMate Templates — match the existing app heading UI used by Edit Resume/Profile. */
(() => {
  'use strict';
  const style = document.createElement('style');
  style.id = 'resumate-template-heading-ui-fix';
  style.textContent = `
    #templatesScreen.coverflow-template-host .coverflow-heading{
      display:block!important;
      margin:0 0 12px!important;
      min-height:0!important;
      text-align:left!important;
    }
    #templatesScreen.coverflow-template-host .coverflow-heading .eyebrow{
      display:block!important;
      margin:0 0 4px!important;
      text-align:left!important;
    }
    #templatesScreen.coverflow-template-host .coverflow-heading .screen-title{
      margin:0!important;
      text-align:left!important;
      background:none!important;
      -webkit-background-clip:initial!important;
      background-clip:initial!important;
      color:inherit!important;
      text-shadow:none!important;
    }
    #templatesScreen.coverflow-template-host .coverflow-heading .screen-subtitle{
      margin:4px 0 0!important;
      text-align:left!important;
    }
    #templatesScreen.coverflow-template-host .coverflow-tools input,
    #templatesScreen.coverflow-template-host .coverflow-tools select{
      font:inherit!important;
      color:inherit!important;
      background:var(--surface,#fff)!important;
      border-color:rgba(127,127,127,.18)!important;
    }
    @media(max-width:560px){
      #templatesScreen.coverflow-template-host .coverflow-heading{margin-bottom:9px!important}
    }
  `;
  document.head.appendChild(style);

  function apply(){
    const screen=document.getElementById('templatesScreen');
    const heading=screen?.querySelector('.coverflow-heading');
    if(!heading)return;
    if(heading.dataset.appUiHeading==='1')return;
    heading.innerHTML='<div class="eyebrow">TEMPLATES</div><h1 class="screen-title">Templates</h1><p class="screen-subtitle">Choose a layout for your resume.</p>';
    heading.dataset.appUiHeading='1';
  }

  const start=()=>{
    apply();
    const root=document.getElementById('screenRoot')||document.body;
    new MutationObserver(apply).observe(root,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
