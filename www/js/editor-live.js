/* ResuMate live split editor: section editing + live template switching. */
(function(){
  'use strict';
  const sections = [
    ['personal','Personal Information'],['summary','Summary / Objective'],['experience','Experience'],['education','Education'],
    ['skills','Skills'],['projects','Projects'],['certifications','Certifications'],['achievements','Achievements'],['languages','Languages'],['custom','Custom Section']
  ];
  const state = { active:'personal', templateIndex:0 };
  const esc = s => String(s ?? '').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function data(){ return window.resumeData || window.resume || window.currentResume || {}; }
  function templateList(){ return Array.isArray(window.RESUME_TEMPLATES)?window.RESUME_TEMPLATES:(Array.isArray(window.templates)?window.templates:[]); }
  function render(){
    const root=document.getElementById('editorScreen'); if(!root) return;
    const d=data(), ts=templateList();
    root.innerHTML=`<div class="live-editor">
      <aside class="live-editor-panel"><div class="editor-panel-head"><button class="editor-back" data-action="back">‹</button><div><h2>Edit Resume</h2><small>Choose a section</small></div></div>
      <div class="section-list">${sections.map(([id,label])=>`<button class="section-edit ${state.active===id?'active':''}" data-section="${id}"><span>${label}</span><b>›</b></button>`).join('')}</div>
      <div class="editor-fields" id="liveFields"></div></aside>
      <section class="live-preview-panel"><div class="preview-toolbar"><div><strong>Live Preview</strong><small>Changes appear instantly</small></div><button class="template-switch" data-action="template">Change Template</button></div>
      <div class="template-strip" id="templateStrip">${ts.length?ts.slice(0,12).map((t,i)=>`<button class="template-mini ${i===state.templateIndex?'active':''}" data-template-index="${i}"><span class="template-thumb">${esc(t.name||t.title||('Template '+(i+1)))}</span></button>`).join(''):'<span class="template-empty">Templates will appear here</span>'}</div>
      <div class="live-resume-preview" id="liveResumePreview">${window.renderResumePreview?window.renderResumePreview(d,ts[state.templateIndex]):'<div class="preview-placeholder">Resume preview</div>'}</div></section></div>`;
    fields(); wire();
  }
  function fields(){
    const box=document.getElementById('liveFields'); if(!box)return; const d=data(), id=state.active;
    const presets={personal:[['name','Full Name'],['email','Email'],['phone','Phone'],['location','Location'],['linkedin','LinkedIn']],summary:[['summary','Professional Summary']],experience:[['experience','Experience / Job History']],education:[['education','Education']],skills:[['skills','Skills']],projects:[['projects','Projects']],certifications:[['certifications','Certifications']],achievements:[['achievements','Achievements']],languages:[['languages','Languages']],custom:[['custom','Custom Section']]}[id]||[];
    box.innerHTML=`<div class="field-head"><h3>${sections.find(x=>x[0]===id)?.[1]||'Edit'}</h3><span>Live</span></div>${presets.map(([key,label])=>{const val=typeof d[key]==='string'?d[key]:JSON.stringify(d[key]??'',null,2);return `<label class="live-field"><span>${label}</span><textarea data-key="${key}" rows="${key==='summary'||key==='experience'||key==='education'||key==='projects'||key==='skills'?6:3}">${esc(val)}</textarea></label>`}).join('')}`;
    box.querySelectorAll('textarea').forEach(el=>el.addEventListener('input',()=>{let v=el.value;try{if(['experience','education','skills','projects','certifications','achievements','languages','custom'].includes(el.dataset.key)&&/^[\[{]/.test(v))v=JSON.parse(v)}catch(_){};d[el.dataset.key]=v;try{localStorage.setItem('resumate_resume_data',JSON.stringify(d))}catch(_){};refreshPreview()}));
  }
  function refreshPreview(){const p=document.getElementById('liveResumePreview');const ts=templateList();if(!p)return;if(window.renderResumePreview)p.innerHTML=window.renderResumePreview(data(),ts[state.templateIndex]);p.dispatchEvent(new CustomEvent('resumate:preview-updated',{bubbles:true}));}
  function wire(){
    document.querySelectorAll('.section-edit').forEach(b=>b.onclick=()=>{state.active=b.dataset.section;render()});
    document.querySelectorAll('[data-template-index]').forEach(b=>b.onclick=()=>{state.templateIndex=Number(b.dataset.templateIndex);refreshPreview();document.querySelectorAll('[data-template-index]').forEach(x=>x.classList.toggle('active',x===b))});
    document.querySelector('[data-action="template"]')?.addEventListener('click',()=>document.getElementById('templateStrip')?.scrollIntoView({behavior:'smooth',block:'nearest'}));
    document.querySelector('[data-action="back"]')?.addEventListener('click',()=>window.history.back());
  }
  window.ResuMateLiveEditor={open:function(){state.active='personal';render()},refresh:refreshPreview};
})();
