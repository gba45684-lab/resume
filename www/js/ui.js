/* Resume Studio interaction polish
   Keeps the core builder dependency-free and offline-first.
*/
(function(){
  const style=document.createElement('link');style.rel='stylesheet';style.href='css/components.css';document.head.appendChild(style);
  const $=(s,r=document)=>r.querySelector(s);
  const sheet=$('#templateSheet');
  const search=$('#templateSearch');
  const toast=(message)=>{
    let el=$('#appToast');
    if(!el){el=document.createElement('div');el.id='appToast';el.className='toast';document.body.appendChild(el)}
    el.textContent=message;el.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove('show'),1800);
  };
  const closeTemplates=()=>sheet?.classList.add('hidden');
  document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape' && sheet && !sheet.classList.contains('hidden')){closeTemplates();return}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();if(typeof save==='function'){save();toast('Resume saved locally')}}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='p'){e.preventDefault();window.print()}
  });
  sheet?.addEventListener('click',(e)=>{if(e.target===sheet)closeTemplates()});
  document.addEventListener('click',(e)=>{
    const b=e.target.closest('.template-card');
    if(b && sheet && !sheet.classList.contains('hidden'))setTimeout(()=>toast('Template applied'),80);
  });
  const previewBtn=$('#previewBtn');
  if(previewBtn)previewBtn.title='Preview resume (Ctrl+P exports PDF)';
  const pdfBtn=$('#pdfBtn');
  if(pdfBtn)pdfBtn.title='Export the selected resume as PDF';
  if(search){search.setAttribute('aria-label','Search resume templates');search.addEventListener('keydown',(e)=>{if(e.key==='Escape'){e.stopPropagation();e.currentTarget.value='';if(typeof renderTemplateGrid==='function')renderTemplateGrid()}})}
  document.querySelectorAll('.section-heading').forEach((heading)=>{
    heading.setAttribute('role','button');heading.setAttribute('tabindex','0');heading.setAttribute('aria-label','Focus section');
    heading.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();heading.closest('.form-section')?.scrollIntoView({behavior:'smooth',block:'start'})}});
  });
  window.addEventListener('beforeprint',()=>{try{if(typeof save==='function')save()}catch{}});
})();
