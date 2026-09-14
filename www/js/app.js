(() => {
  'use strict';

  const STORAGE_KEY = 'resume_app_v2';
  const TEMPLATE_KEY = 'resume_template';
  const MAX_TEMPLATES = 100;
  const SAVE_DELAY = 350;
  let saveTimer = null;
  let state;
  let selected = 1;
  let zoom = 0.8;

  const defaults = {
    personal: {
      name: 'Alex Morgan', title: 'Senior Product Manager', email: 'alex@example.com',
      phone: '+91 98765 43210', location: 'New Delhi, India', website: 'linkedin.com/in/alexmorgan', photo: ''
    },
    summary: 'Product-focused professional with 6+ years of experience delivering customer-facing products, improving processes and leading cross-functional teams. Strong record of translating business goals into measurable outcomes.',
    experience: [{ role: 'Senior Product Manager', company: 'Example Technologies', location: 'New Delhi, India', start: '2023', end: 'Present', details: 'Led product strategy from discovery to launch across engineering, design and commercial teams.\nIncreased activation by 28% through data-driven experiments and onboarding improvements.\nBuilt quarterly roadmap and KPI framework used by leadership.' }],
    education: [{ degree: 'Bachelor of Business Administration', school: 'University of Delhi', location: 'New Delhi, India', year: '2020', grade: '8.4/10', details: 'Relevant coursework: Strategy, Finance, Marketing and Analytics.' }],
    skills: [{ name: 'Product Strategy', level: 'Expert' }, { name: 'Project Management', level: 'Advanced' }, { name: 'Data Analytics', level: 'Advanced' }, { name: 'Excel', level: 'Advanced' }, { name: 'Leadership', level: 'Advanced' }],
    projects: [{ name: 'Customer Insights Dashboard', description: 'Built a reporting workflow that reduced manual reporting time by 60% and gave stakeholders weekly visibility into product KPIs.', technologies: 'SQL, Excel, Power BI', url: '' }],
    certifications: [{ name: 'Google Project Management', issuer: 'Google', year: '2024', url: '' }],
    achievements: [{ title: 'Product Excellence Award', description: 'Recognized for leading a cross-functional launch that exceeded adoption target by 35%.', year: '2024' }],
    languages: [{ name: 'English', level: 'Fluent' }, { name: 'Hindi', level: 'Native' }],
    volunteer: [{ role: 'Volunteer Mentor', organization: 'Career Mentors Network', year: '2023–Present', details: 'Mentor early-career professionals on resumes, interviews and career planning.' }],
    publications: [{ title: 'Building Better Customer Onboarding', publisher: 'Product Journal', year: '2024', url: '' }],
    interests: 'Technology, personal finance, photography, travel',
    references: 'Available on request.'
  };

  const configs = {
    experience: { fields: [['role', 'Role / Job title'], ['company', 'Company'], ['location', 'Location'], ['start', 'Start'], ['end', 'End']], area: ['details', 'Achievements & responsibilities'] },
    education: { fields: [['degree', 'Degree / qualification'], ['school', 'Institution'], ['location', 'Location'], ['year', 'Year'], ['grade', 'Grade / GPA']], area: ['details', 'Details / coursework'] },
    skill: { fields: [['name', 'Skill name'], ['level', 'Proficiency']] },
    project: { fields: [['name', 'Project name'], ['technologies', 'Technologies'], ['url', 'URL']], area: ['description', 'Description & impact'] },
    certification: { fields: [['name', 'Certification'], ['issuer', 'Issuer'], ['year', 'Year'], ['url', 'Credential URL']] },
    achievement: { fields: [['title', 'Award / achievement'], ['year', 'Year']], area: ['description', 'Description'] },
    language: { fields: [['name', 'Language'], ['level', 'Proficiency']] },
    volunteer: { fields: [['role', 'Role'], ['organization', 'Organization'], ['year', 'Year']], area: ['details', 'Details'] },
    publication: { fields: [['title', 'Title'], ['publisher', 'Publisher'], ['year', 'Year'], ['url', 'URL']] }
  };

  const arrayKey = {
    experience: 'experience', education: 'education', skill: 'skills', project: 'projects',
    certification: 'certifications', achievement: 'achievements', language: 'languages',
    volunteer: 'volunteer', publication: 'publications'
  };

  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lines = value => String(value ?? '').split(/\n+/).map(v => v.trim()).filter(Boolean);

  function normalize(input) {
    const source = input && typeof input === 'object' ? input : {};
    const next = clone(defaults);
    Object.keys(next).forEach(key => {
      if (source[key] !== undefined) next[key] = clone(source[key]);
    });
    next.personal = { ...clone(defaults.personal), ...(source.personal && typeof source.personal === 'object' ? source.personal : {}) };
    Object.keys(arrayKey).forEach(type => {
      const key = arrayKey[type];
      if (!Array.isArray(next[key])) next[key] = [];
      next[key] = next[key].filter(item => item && typeof item === 'object').map(item => ({ ...item }));
    });
    return next;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalize(JSON.parse(raw)) : clone(defaults);
    } catch {
      return clone(defaults);
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(TEMPLATE_KEY, String(selected));
    const label = document.querySelector('#saveState');
    if (label) label.textContent = 'Saved';
    updateProgress();
  }

  function markDirty() {
    const label = document.querySelector('#saveState');
    if (label) label.textContent = 'Saving…';
    renderPreview();
    updateProgress();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, SAVE_DELAY);
  }

  function updateProgress() {
    const checks = [
      state.personal.name, state.personal.title, state.personal.email, state.summary,
      state.experience.length, state.education.length, state.skills.length, state.projects.length,
      state.certifications.length, state.achievements.length, state.languages.length,
      state.volunteer.length, state.publications.length, state.interests
    ];
    const complete = checks.filter(Boolean).length;
    const bar = document.querySelector('#progressBar');
    if (bar) bar.style.width = `${Math.max(8, Math.round((complete / checks.length) * 100))}%`;
  }

  function getArray(type) {
    const key = arrayKey[type];
    return state[key];
  }

  function emptyItem(type) {
    const config = configs[type];
    const item = {};
    config.fields.forEach(([key]) => { item[key] = ''; });
    if (config.area) item[config.area[0]] = '';
    return item;
  }

  function renderRepeater(type) {
    const boxId = type === 'skill' ? 'skillFields' : `${type}Fields`;
    const box = document.getElementById(boxId);
    if (!box) return;
    const items = getArray(type);
    const config = configs[type];
    box.innerHTML = items.map((item, index) => {
      const fields = config.fields.map(([key, label]) => `<label>${esc(label)}<input data-repeat="${type}.${index}.${key}" value="${esc(item[key] ?? '')}" placeholder="${esc(label)}"></label>`).join('');
      const area = config.area ? `<label>${esc(config.area[1])}<textarea rows="4" data-repeat="${type}.${index}.${config.area[0]}">${esc(item[config.area[0]] ?? '')}</textarea></label>` : '';
      return `<div class="repeat-card"><button class="remove" type="button" data-remove="${type}:${index}" aria-label="Remove ${esc(type)} ${index + 1}">Remove</button><div class="grid">${fields}</div>${area}</div>`;
    }).join('');
  }

  function renderAllRepeaters() {
    Object.keys(configs).forEach(renderRepeater);
  }

  function section(title, body) {
    return `<section class="section"><div class="section-title">${esc(title)}</div>${body}</section>`;
  }

  function bullets(value) {
    const items = lines(value);
    return items.length ? `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : '';
  }

  function renderMain(includeSkills = true) {
    let out = state.summary ? section('Profile', `<p>${esc(state.summary)}</p>`) : '';
    const ex = state.experience.filter(x => x.role || x.company).map(x => `<div class="exp"><div class="exp-head"><div><div class="job">${esc(x.role)}</div><div class="company">${esc(x.company)}${x.location ? ` · ${esc(x.location)}` : ''}</div></div><div class="date">${esc(x.start)}${x.end ? ` — ${esc(x.end)}` : ''}</div></div>${bullets(x.details)}</div>`).join('');
    if (ex) out += section('Experience', ex);
    const edu = state.education.filter(x => x.degree || x.school).map(x => `<div class="exp"><div class="exp-head"><div><div class="job">${esc(x.degree)}</div><div class="company">${esc(x.school)}${x.location ? ` · ${esc(x.location)}` : ''}</div></div><div class="date">${esc(x.year)}</div></div>${x.grade ? `<p class="muted">Grade: ${esc(x.grade)}</p>` : ''}${x.details ? `<p>${esc(x.details)}</p>` : ''}</div>`).join('');
    if (edu) out += section('Education', edu);
    if (includeSkills) {
      const skills = state.skills.filter(x => x.name).map(x => `<span class="skill">${esc(x.name)}${x.level ? ` · ${esc(x.level)}` : ''}</span>`).join('');
      if (skills) out += section('Skills', `<div class="skills">${skills}</div>`);
    }
    const projects = state.projects.filter(x => x.name || x.description).map(x => `<div class="exp"><div class="job">${esc(x.name)}</div>${x.technologies ? `<div class="company">${esc(x.technologies)}</div>` : ''}${x.description ? `<p>${esc(x.description)}</p>` : ''}${x.url ? `<div class="muted">${esc(x.url)}</div>` : ''}</div>`).join('');
    if (projects) out += section('Projects', projects);
    const cert = state.certifications.filter(x => x.name).map(x => `<div class="exp"><div class="job">${esc(x.name)}</div><div class="company">${esc(x.issuer)}${x.year ? ` · ${esc(x.year)}` : ''}</div>${x.url ? `<div class="muted">${esc(x.url)}</div>` : ''}</div>`).join('');
    if (cert) out += section('Certifications & Courses', cert);
    const ach = state.achievements.filter(x => x.title).map(x => `<div class="exp"><div class="job">${esc(x.title)}</div>${x.description ? `<p>${esc(x.description)}</p>` : ''}${x.year ? `<div class="date">${esc(x.year)}</div>` : ''}</div>`).join('');
    if (ach) out += section('Achievements & Awards', ach);
    const lang = state.languages.filter(x => x.name).map(x => `<span class="skill">${esc(x.name)}${x.level ? ` · ${esc(x.level)}` : ''}</span>`).join('');
    if (lang) out += section('Languages', `<div class="skills">${lang}</div>`);
    const vol = state.volunteer.filter(x => x.role || x.organization).map(x => `<div class="exp"><div class="job">${esc(x.role)}</div><div class="company">${esc(x.organization)}${x.year ? ` · ${esc(x.year)}` : ''}</div>${x.details ? `<p>${esc(x.details)}</p>` : ''}</div>`).join('');
    if (vol) out += section('Volunteer & Leadership', vol);
    const pub = state.publications.filter(x => x.title).map(x => `<div class="exp"><div class="job">${esc(x.title)}</div><div class="company">${esc(x.publisher)}${x.year ? ` · ${esc(x.year)}` : ''}</div>${x.url ? `<div class="muted">${esc(x.url)}</div>` : ''}</div>`).join('');
    if (pub) out += section('Publications', pub);
    if (state.interests) out += section('Interests', `<p>${esc(state.interests)}</p>`);
    if (state.references) out += section('References', `<p>${esc(state.references)}</p>`);
    return out;
  }

  function renderPreview() {
    const paper = document.querySelector('#resumePaper');
    if (!paper || !Array.isArray(window.TEMPLATES) || !window.TEMPLATES.length) return;
    const template = window.TEMPLATES.find(item => item.id === selected) || window.TEMPLATES[0];
    selected = Number(template.id);
    const p = state.personal;
    const templateName = document.querySelector('#templateName');
    if (templateName) templateName.textContent = template.name;
    const photo = p.photo ? `<img class="photo" src="${esc(p.photo)}" alt="Profile photo" loading="lazy" referrerpolicy="no-referrer">` : '';
    const contact = [p.email, p.phone, p.location, p.website].filter(Boolean).map(esc).join(' · ');
    const hero = `<div class="hero">${photo}<h1>${esc(p.name || 'Your Name')}</h1><div class="title">${esc(p.title || 'Professional Title')}</div>${contact ? `<div class="contact muted">${contact}</div>` : ''}</div>`;
    const keySkills = state.skills.filter(x => x.name).map(x => `<span class="skill">${esc(x.name)}</span>`).join('');
    const isColumns = ['sidebar', 'split', 'portfolio', 'timeline', 'two-column'].includes(template.layout);
    let body = hero + renderMain(true);
    if (isColumns) body = hero + `<div class="cols"><div>${renderMain(false)}</div><aside class="side">${section('Key Skills', `<div class="skills">${keySkills}</div>`)}</aside></div>`;
    if (template.layout === 'banner') body = hero + `<div class="bar"></div>` + renderMain(true);
    if (template.layout === 'boxed') body = hero + `<div class="tag">CURRICULUM VITAE</div>` + renderMain(true);
    paper.className = `resume-paper layout-${template.layout}`;
    paper.style.cssText = `--font:${template.font};--accent:${template.color};--wash:${template.wash};--pad:${34 + ((template.id * 7) % 28)}px;--gap:${10 + ((template.id * 5) % 10)}px;--title:${27 + ((template.id * 3) % 15)}px;--subtitle:${11 + (template.id % 5)}px;--photosize:${70 + ((template.id % 4) * 8)}px;--radius:${[0, 6, 12, 22][template.id % 4]}px;--float:${template.accentSide};--cols:${template.id % 2 ? '30% 1fr' : '1fr 32%'};--colgap:${18 + ((template.id % 6) * 3)}px;--rule:${template.id % 4 === 0 ? 2 : 0}px;--sectionrule:${template.id % 3 === 0 ? 1 : 0}px;`;
    paper.innerHTML = body;
    applyZoom();
  }

  function renderTemplateGrid() {
    const grid = document.querySelector('#templateGrid');
    if (!grid || !Array.isArray(window.TEMPLATES)) return;
    const query = (document.querySelector('#templateSearch')?.value || '').trim().toLowerCase();
    const list = window.TEMPLATES.filter(t => !query || `${t.name} ${t.family} ${t.layout} ${t.font}`.toLowerCase().includes(query));
    const count = document.querySelector('#templateCount');
    if (count) count.textContent = `${list.length} templates`;
    grid.innerHTML = list.map(t => `<button type="button" class="template-card ${t.id === selected ? 'active' : ''}" data-template="${t.id}" aria-label="Use ${esc(t.name)}"><div class="thumb"><span class="thumb-badge">LIVE PREVIEW</span><div class="mini resume-paper layout-${esc(t.layout)}" style="--font:${esc(t.font)};--accent:${esc(t.color)};--wash:${esc(t.wash)};--pad:34px;--title:30px;--subtitle:12px;--photosize:70px;--radius:8px;--float:left;--cols:1fr 32%;--colgap:20px;--rule:1px;--sectionrule:0px"><div class="hero"><h1>Alex Morgan</h1><div class="title">${esc(t.family)}</div><div class="contact muted">alex@email.com · New Delhi</div></div><div class="section"><div class="section-title">Experience</div><div class="exp"><div class="job">Senior Product Manager</div><div class="company">Example Technologies</div><p>Achievements and professional experience</p></div></div><div class="section"><div class="section-title">Skills</div><p>Strategy · Leadership · Analytics</p></div></div></div><div class="template-meta"><b>${esc(t.name)}</b><span class="use-template">Use this →</span></div><span class="template-type">${esc(t.family)} · ${esc(t.layout)}</span></button>`).join('');
  }

  function openTemplates() {
    renderTemplateGrid();
    document.querySelector('#templateSheet')?.classList.remove('hidden');
  }

  function closeTemplates() {
    document.querySelector('#templateSheet')?.classList.add('hidden');
  }

  function applyZoom() {
    const stage = document.querySelector('#paperStage');
    if (stage) stage.style.transform = `scale(${zoom})`;
    const label = document.querySelector('#zoomLabel');
    if (label) label.textContent = `${Math.round(zoom * 100)}%`;
  }

  function setPreview(show) {
    document.querySelector('.workspace')?.classList.toggle('show-preview', show);
  }

  function add(type) {
    if (!arrayKey[type]) return;
    getArray(type).push(emptyItem(type));
    renderRepeater(type);
    markDirty();
    const last = document.querySelector(`#${type === 'skill' ? 'skillFields' : type + 'Fields'} .repeat-card:last-child input`);
    last?.focus();
  }

  function remove(type, index) {
    const items = getArray(type);
    if (!items || !Number.isInteger(index) || index < 0 || index >= items.length) return;
    items.splice(index, 1);
    renderRepeater(type);
    markDirty();
  }

  function parseResumeObject(input) {
    if (!input || typeof input !== 'object') throw new Error('Invalid resume data');
    return normalize({
      personal: input.personal || input.basics,
      summary: input.summary || input.basics?.summary,
      experience: input.experience || input.work,
      education: input.education,
      skills: Array.isArray(input.skills) ? input.skills : undefined,
      projects: input.projects,
      certifications: input.certifications || input.certificates,
      achievements: input.achievements,
      languages: input.languages,
      volunteer: input.volunteer || input.volunteering,
      publications: input.publications,
      interests: Array.isArray(input.interests) ? input.interests.join(', ') : input.interests,
      references: input.references
    });
  }

  function importText(text, sourceName) {
    const trimmed = String(text || '').trim();
    if (!trimmed) throw new Error('The selected file is empty.');
    if (/\.json$/i.test(sourceName)) {
      state = parseResumeObject(JSON.parse(trimmed));
    } else if (/\.html?$/i.test(sourceName)) {
      const doc = new DOMParser().parseFromString(trimmed, 'text/html');
      const heading = doc.querySelector('h1')?.textContent?.trim() || '';
      const title = doc.querySelector('.title')?.textContent?.trim() || '';
      const textContent = doc.body?.innerText?.replace(/\n{3,}/g, '\n\n').trim() || '';
      state = normalize({ personal: { ...state.personal, name: heading || state.personal.name, title: title || state.personal.title }, summary: textContent.slice(0, 900) || state.summary });
    } else {
      const textValue = trimmed.replace(/\r/g, '');
      const first = lines(textValue)[0] || state.personal.name;
      state = normalize({ personal: { ...state.personal, name: first }, summary: lines(textValue).slice(1, 5).join(' ') || state.summary });
    }
    renderAllRepeaters();
    bindSimpleFields();
    markDirty();
  }

  async function handleImport(file) {
    const name = file?.name || '';
    if (/\.pdf$/i.test(name) || /\.docx$/i.test(name)) {
      showToast('PDF/DOCX import needs a parser bundle; export/import JSON is fully supported.');
      return;
    }
    const text = await file.text();
    try {
      importText(text, name);
      showToast('Resume imported');
    } catch (error) {
      showToast(error?.message || 'Could not import this file');
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'resume.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function printCV() {
    save();
    window.print();
  }

  function showToast(message) {
    let toast = document.querySelector('#appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.__resumeToastTimer);
    window.__resumeToastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function bindSimpleFields() {
    document.querySelectorAll('[data-path]').forEach(field => {
      const path = field.dataset.path.split('.');
      const value = path.reduce((obj, key) => obj?.[key], state);
      if (value !== undefined && field.value !== value) field.value = value;
      field.oninput = () => {
        const keys = field.dataset.path.split('.');
        const last = keys.pop();
        let target = state;
        keys.forEach(key => { if (!target[key] || typeof target[key] !== 'object') target[key] = {}; target = target[key]; });
        target[last] = field.value;
        markDirty();
      };
    });
  }

  function bindEvents() {
    document.querySelector('#resumeForm')?.addEventListener('submit', e => e.preventDefault());
    document.addEventListener('input', e => {
      const target = e.target.closest('[data-repeat]');
      if (!target) return;
      const [type, index, key] = target.dataset.repeat.split('.');
      const items = getArray(type);
      if (items?.[Number(index)]) { items[Number(index)][key] = target.value; markDirty(); }
    });
    document.addEventListener('click', e => {
      const addButton = e.target.closest('[data-add]');
      if (addButton) { e.preventDefault(); add(addButton.dataset.add); return; }
      const removeButton = e.target.closest('[data-remove]');
      if (removeButton) { e.preventDefault(); const [type, index] = removeButton.dataset.remove.split(':'); remove(type, Number(index)); return; }
      const templateButton = e.target.closest('[data-template]');
      if (templateButton) {
        selected = Math.max(1, Math.min(MAX_TEMPLATES, Number(templateButton.dataset.template) || 1));
        save(); renderPreview(); renderTemplateGrid(); closeTemplates(); showToast('Template applied'); return;
      }
    });

    document.querySelector('#templatesBtn')?.addEventListener('click', openTemplates);
    document.querySelector('#liveTemplateBtn')?.addEventListener('click', openTemplates);
    document.querySelector('#closeTemplates')?.addEventListener('click', closeTemplates);
    document.querySelector('#templateSheet')?.addEventListener('click', e => { if (e.target.id === 'templateSheet') closeTemplates(); });
    document.querySelector('#templateSearch')?.addEventListener('input', renderTemplateGrid);
    document.querySelector('#importBtn')?.addEventListener('click', () => document.querySelector('#importFile')?.click());
    document.querySelector('#importFile')?.addEventListener('change', async e => { const file = e.target.files?.[0]; if (file) await handleImport(file); e.target.value = ''; });
    document.querySelector('#previewBtn')?.addEventListener('click', () => setPreview(true));
    document.querySelector('#closePreview')?.addEventListener('click', () => setPreview(false));
    document.querySelector('#mobileEdit')?.addEventListener('click', () => setPreview(false));
    document.querySelector('#mobileTemplates')?.addEventListener('click', openTemplates);
    document.querySelector('#mobilePreview')?.addEventListener('click', () => setPreview(true));
    document.querySelector('#pdfBtn')?.addEventListener('click', printCV);
    document.querySelector('#mobilePdf')?.addEventListener('click', printCV);
    document.querySelector('#zoomOut')?.addEventListener('click', () => { zoom = Math.max(0.5, Number((zoom - 0.05).toFixed(2))); applyZoom(); });
    document.querySelector('#zoomIn')?.addEventListener('click', () => { zoom = Math.min(1.25, Number((zoom + 0.05).toFixed(2))); applyZoom(); });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeTemplates();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); showToast('Resume saved locally'); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') { e.preventDefault(); printCV(); }
    });

    window.addEventListener('beforeprint', () => save());
  }

  state = load();
  selected = Math.max(1, Math.min(MAX_TEMPLATES, Number(localStorage.getItem(TEMPLATE_KEY) || 1)));
  window.__RESUME_EXPORT_JSON__ = exportJSON;
  window.__RESUME_STATE__ = () => clone(state);

  bindSimpleFields();
  renderAllRepeaters();
  bindEvents();
  renderPreview();
  updateProgress();
})();
