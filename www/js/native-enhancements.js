/* ResuMate UI integrity + native export enhancements. */
(function(){'use strict';
const STYLE_ID='resumate-enhancement-css';
const css=`
.brand-subtitle{display:none!important}
.detail-template-picker{display:none!important}
.template-name-button{appearance:none;border:0;background:transparent;padding:0;text-align:left;color:inherit;cursor:pointer;font:inherit}
.template-name-button:hover{text-decoration:underline;text-underline-offset:5px}
.template-list-modal{position:fixed;inset:0;z-index:9999;background:rgba(22,17,13,.52);display:flex;align-items:flex-start;justify-content:center;padding:70px 14px 24px;box-sizing:border-box}
.template-list-dialog{width:min(620px,100%);max-height:calc(100vh - 94px);overflow:hidden;background:#fff;border-radius:22px;box-shadow:0 22px 70px rgba(0,0,0,.25);display:flex;flex-direction:column}
.template-list-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid rgba(80,55,35,.1)}
.template-list-head h2{margin:0;font-size:20px}.template-list-close{border:0;background:#f3eadc;border-radius:10px;padding:8px 12px;cursor:pointer}
.template-list-body{overflow:auto;padding:8px}.template-list-row{display:flex;align-items:center;gap:12px;width:100%;border:0;background:transparent;border-radius:12px;padding:12px;text-align:left;cursor:pointer;color:inherit}.template-list-row:hover,.template-list-row.active{background:#f5eee4}.template-list-num{width:34px;font-size:12px;opacity:.55}.template-list-name{font-weight:700;flex:1}.template-list-type{font-size:12px;opacity:.58}
.profile-action{cursor:pointer}.resumate-modal{position:fixed;inset:0;z-index:10000;background:rgba(22,17,13,.52);display:flex;align-items:center;justify-content:center;padding:18px}.resumate-modal-card{width:min(520px,100%);background:#fff;border-radius:20px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.25)}.resumate-modal-card h2{margin:0 0 8px}.resumate-modal-card p{line-height:1.55;opacity:.75}.resumate-modal-card button{border:0;border-radius:11px;padding:10px 14px;cursor:pointer;margin-top:10px}.resumate-primary{background:#6b2d1f;color:#fff}.resumate-secondary{background:#f1e8db;color:inherit}
`;
if(!document.getElementById(STYLE_ID)){const s=document.createElement('style');s.id=STYLE_ID;s.textContent=css;document.head.appendChild(s)}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function category(t){const l=String(t.layout||'').toLowerCase();if(['sidebar','split','two-column','timeline'].includes(l))return 'Professional';if(['editorial','elegant','magazine'].includes(l))return 'Creative';if(['minimal','ats','mono'].includes(l))return 'Minimal';return Number(t.id)%2?'Modern':'Simple'}
function closeModal(){document.querySelectorAll('.template-list-modal,.resumate-modal').forEach(x=>x.remove())}
function openTemplateList(){
 closeModal();const ts=window.TEMPLATES||[];const current=Number(localStorage.getItem('resumate_template_v3')||1);
 const modal=document.createElement('div');modal.className='template-list-modal';modal.innerHTML=`<div class="template-list-dialog"><div class="template-list-head"><h2>Choose Template</h2><button class="template-list-close">Close</button></div><div class="template-list-body">${ts.map(t=>`<button class="template-list-row ${Number(t.id)===current?'active':''}" data-pick="${t.id}"><span class="template-list-num">${String(t.id).padStart(2,'0')}</span><span class="template-list-name">${esc(t.name)}</span><span class="template-list-type">${esc(category(t))}</span><span>›</span></button>`).join('')}</div></div>`;
 document.body.appendChild(modal);
 modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('.template-list-close')){closeModal();return}const row=e.target.closest('[data-pick]');if(!row)return;const id=Number(row.dataset.pick)||1;const original=document.querySelector('#templateDetailScreen [data-detail-template="'+id+'"]');closeModal();if(original){original.click()}else{localStorage.setItem('resumate_template_v3',String(id));location.reload()}});
}
function patchTemplateDetail(){
 const screen=document.getElementById('templateDetailScreen');if(!screen||!screen.classList.contains('active'))return;
 const title=screen.querySelector('.screen-title');if(title&&!title.dataset.templatePatched){title.dataset.templatePatched='1';const btn=document.createElement('button');btn.className='template-name-button';btn.textContent=title.textContent;btn.title='Tap to change template';btn.addEventListener('click',openTemplateList);title.replaceWith(btn)}
 const picker=screen.querySelector('.detail-template-picker');if(picker)picker.hidden=true;
}
function profileButtons(){
 const screen=document.getElementById('profileScreen');if(!screen||!screen.classList.contains('active'))return;
 const rows=[...screen.querySelectorAll('.list-row')];rows.forEach((row,i)=>{if(row.dataset.profileWired)return;row.dataset.profileWired='1';row.classList.add('profile-action');row.dataset.profileAction=['account','subscription','downloads','help','settings','share'][i]||''});
}
function modal(title,body){closeModal();const m=document.createElement('div');m.className='resumate-modal';m.innerHTML=`<div class="resumate-modal-card"><h2>${esc(title)}</h2><div>${body}</div><button class="resumate-secondary" data-close-modal>Close</button></div>`;document.body.appendChild(m);m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-close-modal]'))m.remove()});return m}
function handleProfile(action){
 if(action==='account'){const b=document.createElement('button');b.setAttribute('data-action','editor');b.hidden=true;document.body.appendChild(b);b.click();b.remove();return}
 if(action==='subscription'){const b=document.createElement('button');b.setAttribute('data-action','premium');b.hidden=true;document.body.appendChild(b);b.click();b.remove();return}
 if(action==='downloads'){const last=JSON.parse(localStorage.getItem('resumate_downloads_v1')||'[]');const body=last.length?`<p>Your PDF files are saved in the device <b>Downloads/ResuMate</b> folder.</p><div class="list-card">${last.slice(0,10).map(x=>`<div class="list-row"><div class="list-icon">PDF</div><div class="list-main"><b>${esc(x.name)}</b><span>${esc(x.time||'Downloaded')}</span></div></div>`).join('')}</div>`:'<p>No PDF downloads yet. Use <b>Download PDF</b> in the preview and the file will be saved to device storage.';modal('My Downloads',body);return}
 if(action==='help'){modal('ResuMate Help','<p><b>Edit:</b> update each resume section and changes auto-save on this device.</p><p><b>Templates:</b> open the selected template name to switch layouts instantly.</p><p><b>PDF:</b> download from Preview. The PDF is saved to device Downloads and a notification lets you open it.</p>');return}
 if(action==='settings'){modal('Settings','<p>Auto-save is <b>ON</b>. Resume content, template selection and design choices are continuously saved to this device.</p><p>Storage is local to this app. Clearing app data will remove the saved resume.</p>');return}
 if(action==='share'){const text='ResuMate — create, customize and download your professional resume.';if(navigator.share)navigator.share({title:'ResuMate',text}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>window.__RESUMATE_TOAST__?.('App message copied'));else modal('Share ResuMate','<p>Share is not available on this device.</p>');return}
}
async function exportPdf(){
 const paper=document.querySelector('#editorPaper .resume-paper')||document.querySelector('.detail-preview .resume-paper');if(!paper){window.print();return}
 const styles=[];for(const sheet of Array.from(document.styleSheets)){try{for(const rule of Array.from(sheet.cssRules||[]))styles.push(rule.cssText)}catch(_){} }
 const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${styles.join('\n')}@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}.resume-paper{box-shadow:none!important;margin:0!important;width:794px!important;min-height:1123px!important}</style></head><body>${paper.outerHTML}</body></html>`;
 const plugin=window.Capacitor?.Plugins?.PdfExport;
 if(!plugin?.savePdf){window.print();return}
 try{const result=await plugin.savePdf({html,fileName:'ResuMate-Resume.pdf'});const list=JSON.parse(localStorage.getItem('resumate_downloads_v1')||'[]');list.unshift({name:result?.fileName||'ResuMate-Resume.pdf',uri:result?.uri||'',time:new Date().toLocaleString()});localStorage.setItem('resumate_downloads_v1',JSON.stringify(list.slice(0,20)));window.__RESUMATE_TOAST__?.('PDF saved to Downloads')}
 catch(e){window.__RESUMATE_TOAST__?.('PDF download failed')}
}
function wirePdf(){document.addEventListener('click',e=>{const b=e.target.closest('[data-action="pdf"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();exportPdf()},true)}
function patch(){patchTemplateDetail();profileButtons()}
const observer=new MutationObserver(()=>setTimeout(patch,20));observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
document.addEventListener('click',e=>{const row=e.target.closest('[data-profile-action]');if(row){e.preventDefault();e.stopPropagation();handleProfile(row.dataset.profileAction)}},true);
wirePdf();window.__RESUMATE_TOAST__=msg=>{const t=document.getElementById('toast');if(t){t.textContent=msg;t.classList.add('show');clearTimeout(window.__rmToast);window.__rmToast=setTimeout(()=>t.classList.remove('show'),1800)}};
setTimeout(patch,100);
})();
