/**
 * ResumeForge App Logic
 * - State Management & LocalStorage
 * - Live Text Editing & Binding
 * - Dynamic Section Array Editors (Work Exp, Education, Projects)
 * - Template Selector & Filter Engine (100 Unique Templates)
 * - PDF Export Engine (html2pdf.js)
 */

const STORAGE_KEY = 'resumeforge_user_data_v1';
const SELECTED_TEMPLATE_KEY = 'resumeforge_selected_template_id';

// Default Sample Data
const DEFAULT_RESUME_DATA = {
  fullName: 'Alex Morgan',
  jobTitle: 'Senior Full Stack Engineer',
  email: 'alex.morgan@example.com',
  phone: '+1 (555) 019-2834',
  location: 'San Francisco, CA',
  website: 'alexmorgan.dev',
  linkedin: 'linkedin.com/in/alexmorgan',
  github: 'github.com/alexmorgan',
  summary: 'Results-driven Senior Software Engineer with 7+ years of experience designing and building scalable cloud-native web and mobile applications. Specialist in JavaScript/TypeScript, Node.js, React, and modern CSS architecture. Proven track record of improving application performance by 40% and leading high-velocity engineering teams.',
  skills: 'JavaScript, TypeScript, React, Node.js, Express, HTML5/CSS3, PostgreSQL, Docker, AWS, GraphQL, REST APIs, Git, Mobile Web, TailwindCSS, Jest',
  certifications: 'AWS Certified Solutions Architect, Certified Scrum Master (CSM)',
  languages: 'English (Native), Spanish (Professional), German (Elementary)',
  experiences: [
    {
      id: 1,
      jobTitle: 'Senior Software Engineer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      startDate: 'Jan 2021',
      endDate: 'Present',
      description: '• Architected and developed scalable frontend components in React and TypeScript for 1M+ active monthly users.\n• Optimized CI/CD build pipelines reducing deployment duration by 35%.\n• Mentored 5 junior engineers and conducted code reviews to maintain code quality.'
    },
    {
      id: 2,
      jobTitle: 'Frontend Web Developer',
      company: 'Innovate Digital Agency',
      location: 'Austin, TX',
      startDate: 'Mar 2018',
      endDate: 'Dec 2020',
      description: '• Built high-performance responsive web portals and PWAs for enterprise clients.\n• Worked closely with UI/UX designers to translate Figma mockups into pixel-perfect web interfaces.'
    }
  ],
  education: [
    {
      id: 1,
      degree: 'B.S. in Computer Science',
      school: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      startDate: '2014',
      endDate: '2018',
      description: 'Graduated with Honors. Focus on Software Systems, Algorithms, and Data Structures.'
    }
  ],
  projects: [
    {
      id: 1,
      title: 'ResumeForge App',
      link: 'github.com/alexmorgan/resumeforge',
      description: 'Cross-platform mobile resume builder supporting 100 unique resume layouts with client-side PDF export and local data persistence.'
    }
  ]
};

// Global App State
let state = {
  currentTemplateId: 1,
  activeCategory: 'All',
  searchQuery: '',
  resumeData: JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA))
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  setupNavigationTabs();
  setupCategoryPills();
  renderTemplateBrowser();
  setupFormBindings();
  renderDynamicLists();
  updateActiveTemplateUI();
  renderPreview();
  setupPdfExport();
  setupResetAction();
});

// Load stored data from LocalStorage
function loadStoredData() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      state.resumeData = JSON.parse(savedData);
    } catch (e) {
      console.error('Failed to parse saved resume data', e);
    }
  }

  const savedTemplateId = localStorage.getItem(SELECTED_TEMPLATE_KEY);
  if (savedTemplateId) {
    state.currentTemplateId = Number(savedTemplateId);
  }
}

// Save state to LocalStorage
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.resumeData));
  localStorage.setItem(SELECTED_TEMPLATE_KEY, state.currentTemplateId.toString());
}

// Navigation Tabs Handling (Mobile & Desktop)
function setupNavigationTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  const panels = document.querySelectorAll('.view-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const activePanel = document.getElementById(targetId);
      if (activePanel) {
        activePanel.classList.add('active');
      }

      if (targetId === 'preview-view') {
        renderPreview();
      }
    });
  });

  // Accordion Toggles in Editor
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('active');
    });
  });
}

// Render Category Pills
function setupCategoryPills() {
  const pillsContainer = document.getElementById('category-pills');
  if (!pillsContainer) return;

  pillsContainer.innerHTML = CATEGORIES.map(cat => `
    <button class="pill ${cat === state.activeCategory ? 'active' : ''}" data-category="${cat}">
      ${cat}
    </button>
  `).join('');

  pillsContainer.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      pillsContainer.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeCategory = pill.getAttribute('data-category');
      renderTemplateBrowser();
    });
  });

  // Search filter listener
  const searchInput = document.getElementById('template-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderTemplateBrowser();
    });
  }
}

// Render 100 Templates Browser Grid
function renderTemplateBrowser() {
  const grid = document.getElementById('templates-grid');
  const countBadge = document.getElementById('templates-count-badge');
  if (!grid) return;

  const filtered = RESUME_TEMPLATES.filter(tpl => {
    const matchesCat = state.activeCategory === 'All' || tpl.category === state.activeCategory;
    const matchesSearch = !state.searchQuery ||
      tpl.name.toLowerCase().includes(state.searchQuery) ||
      tpl.category.toLowerCase().includes(state.searchQuery) ||
      tpl.layoutType.toLowerCase().includes(state.searchQuery);
    return matchesCat && matchesSearch;
  });

  if (countBadge) {
    countBadge.textContent = `Showing ${filtered.length} of 100 Templates`;
  }

  grid.innerHTML = filtered.map(tpl => `
    <div class="template-card ${tpl.id === state.currentTemplateId ? 'active-template' : ''}" data-id="${tpl.id}">
      <div class="template-preview-box" style="border-top: 4px solid ${tpl.primaryColor}">
        <div class="mini-layout-mockup" style="font-family: ${tpl.font}">
          <div style="height: 12px; width: 60%; background: ${tpl.primaryColor}; border-radius: 2px;"></div>
          <div style="height: 6px; width: 40%; background: ${tpl.secondaryColor}; border-radius: 2px; margin-bottom: 6px;"></div>
          <div style="height: 4px; width: 100%; background: #e2e8f0; border-radius: 2px;"></div>
          <div style="height: 4px; width: 90%; background: #e2e8f0; border-radius: 2px;"></div>
          <div style="height: 4px; width: 75%; background: #e2e8f0; border-radius: 2px;"></div>
          <div style="margin-top: 6px; height: 8px; width: 45%; background: ${tpl.primaryColor}; border-radius: 2px;"></div>
          <div style="height: 4px; width: 95%; background: #cbd5e1; border-radius: 2px;"></div>
        </div>
      </div>
      <div class="template-card-footer">
        <div class="template-card-title">${tpl.name}</div>
        <div class="template-card-tags">
          <span class="tag-badge" style="background:${tpl.accentColor}; color:${tpl.primaryColor}; border: 1px solid ${tpl.primaryColor}44;">${tpl.category}</span>
          <span class="tag-badge">${tpl.layoutType}</span>
        </div>
        <button class="btn-select-template">
          ${tpl.id === state.currentTemplateId ? '<i class="fa-solid fa-check"></i> Selected' : 'Use Layout'}
        </button>
      </div>
    </div>
  `).join('');

  // Click events for template selection
  grid.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = Number(card.getAttribute('data-id'));
      selectTemplate(id);
    });
  });
}

// Select a Template
function selectTemplate(id) {
  state.currentTemplateId = id;
  saveData();
  renderTemplateBrowser();
  updateActiveTemplateUI();
  renderPreview();
  showToast(`Applied Layout #${id}: ${RESUME_TEMPLATES.find(t=>t.id===id).name}`);
}

// Update UI info about current active template
function updateActiveTemplateUI() {
  const current = RESUME_TEMPLATES.find(t => t.id === state.currentTemplateId) || RESUME_TEMPLATES[0];

  const editorName = document.getElementById('editor-active-template-name');
  if (editorName) editorName.textContent = `#${current.id} - ${current.name} (${current.category})`;

  const previewTitle = document.getElementById('preview-template-title');
  if (previewTitle) previewTitle.textContent = `#${current.id} - ${current.name}`;

  const changeBtn = document.getElementById('btn-change-template');
  if (changeBtn) {
    changeBtn.onclick = () => {
      document.querySelector('.nav-tab[data-tab="browser-view"]').click();
    };
  }
}

// Setup Form Bindings for static inputs
function setupFormBindings() {
  const textInputs = document.querySelectorAll('.text-bind');
  textInputs.forEach(input => {
    const key = input.getAttribute('data-key');
    if (key && state.resumeData[key] !== undefined) {
      input.value = state.resumeData[key];
    }

    input.addEventListener('input', (e) => {
      state.resumeData[key] = e.target.value;
      saveData();
      renderPreview();
    });
  });
}

// Dynamic List Rendering (Experience, Education, Projects)
function renderDynamicLists() {
  renderExperienceList();
  renderEducationList();
  renderProjectsList();
}

function renderExperienceList() {
  const container = document.getElementById('experience-list');
  if (!container) return;

  container.innerHTML = state.resumeData.experiences.map((exp, index) => `
    <div class="dynamic-item">
      <div class="dynamic-item-header">
        <span>Experience #${index + 1}</span>
        <button class="btn-remove-item" onclick="removeExperience(${index})"><i class="fa-solid fa-trash"></i> Delete</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Job Title</label>
          <input type="text" class="form-control" value="${exp.jobTitle || ''}" oninput="updateExp(${index}, 'jobTitle', this.value)" />
        </div>
        <div class="form-group">
          <label>Company</label>
          <input type="text" class="form-control" value="${exp.company || ''}" oninput="updateExp(${index}, 'company', this.value)" />
        </div>
        <div class="form-group">
          <label>Start Date</label>
          <input type="text" class="form-control" value="${exp.startDate || ''}" oninput="updateExp(${index}, 'startDate', this.value)" />
        </div>
        <div class="form-group">
          <label>End Date</label>
          <input type="text" class="form-control" value="${exp.endDate || ''}" oninput="updateExp(${index}, 'endDate', this.value)" />
        </div>
      </div>
      <div class="form-group" style="margin-top: 8px;">
        <label>Description / Key Responsibilities</label>
        <textarea rows="3" class="form-control" oninput="updateExp(${index}, 'description', this.value)">${exp.description || ''}</textarea>
      </div>
    </div>
  `).join('');

  document.getElementById('btn-add-experience').onclick = () => {
    state.resumeData.experiences.push({
      id: Date.now(),
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      description: ''
    });
    saveData();
    renderExperienceList();
    renderPreview();
  };
}

window.updateExp = function(index, field, value) {
  state.resumeData.experiences[index][field] = value;
  saveData();
  renderPreview();
};

window.removeExperience = function(index) {
  state.resumeData.experiences.splice(index, 1);
  saveData();
  renderExperienceList();
  renderPreview();
};

function renderEducationList() {
  const container = document.getElementById('education-list');
  if (!container) return;

  container.innerHTML = state.resumeData.education.map((edu, index) => `
    <div class="dynamic-item">
      <div class="dynamic-item-header">
        <span>Education #${index + 1}</span>
        <button class="btn-remove-item" onclick="removeEducation(${index})"><i class="fa-solid fa-trash"></i> Delete</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Degree / Qualification</label>
          <input type="text" class="form-control" value="${edu.degree || ''}" oninput="updateEdu(${index}, 'degree', this.value)" />
        </div>
        <div class="form-group">
          <label>School / University</label>
          <input type="text" class="form-control" value="${edu.school || ''}" oninput="updateEdu(${index}, 'school', this.value)" />
        </div>
        <div class="form-group">
          <label>Start Year</label>
          <input type="text" class="form-control" value="${edu.startDate || ''}" oninput="updateEdu(${index}, 'startDate', this.value)" />
        </div>
        <div class="form-group">
          <label>End Year</label>
          <input type="text" class="form-control" value="${edu.endDate || ''}" oninput="updateEdu(${index}, 'endDate', this.value)" />
        </div>
      </div>
    </div>
  `).join('');

  document.getElementById('btn-add-education').onclick = () => {
    state.resumeData.education.push({
      id: Date.now(),
      degree: '',
      school: '',
      startDate: '',
      endDate: ''
    });
    saveData();
    renderEducationList();
    renderPreview();
  };
}

window.updateEdu = function(index, field, value) {
  state.resumeData.education[index][field] = value;
  saveData();
  renderPreview();
};

window.removeEducation = function(index) {
  state.resumeData.education.splice(index, 1);
  saveData();
  renderEducationList();
  renderPreview();
};

function renderProjectsList() {
  const container = document.getElementById('projects-list');
  if (!container) return;

  container.innerHTML = state.resumeData.projects.map((proj, index) => `
    <div class="dynamic-item">
      <div class="dynamic-item-header">
        <span>Project #${index + 1}</span>
        <button class="btn-remove-item" onclick="removeProject(${index})"><i class="fa-solid fa-trash"></i> Delete</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Project Title</label>
          <input type="text" class="form-control" value="${proj.title || ''}" oninput="updateProj(${index}, 'title', this.value)" />
        </div>
        <div class="form-group">
          <label>Link / URL</label>
          <input type="text" class="form-control" value="${proj.link || ''}" oninput="updateProj(${index}, 'link', this.value)" />
        </div>
      </div>
      <div class="form-group" style="margin-top: 8px;">
        <label>Project Details</label>
        <textarea rows="2" class="form-control" oninput="updateProj(${index}, 'description', this.value)">${proj.description || ''}</textarea>
      </div>
    </div>
  `).join('');

  document.getElementById('btn-add-project').onclick = () => {
    state.resumeData.projects.push({
      id: Date.now(),
      title: '',
      link: '',
      description: ''
    });
    saveData();
    renderProjectsList();
    renderPreview();
  };
}

window.updateProj = function(index, field, value) {
  state.resumeData.projects[index][field] = value;
  saveData();
  renderPreview();
};

window.removeProject = function(index) {
  state.resumeData.projects.splice(index, 1);
  saveData();
  renderProjectsList();
  renderPreview();
};

// Live Preview Renderer
function renderPreview() {
  const paper = document.getElementById('resume-paper');
  if (!paper) return;

  paper.className = `resume-paper template-layout-${state.currentTemplateId}`;
  paper.innerHTML = renderResumeHTML(state.currentTemplateId, state.resumeData);
}

// PDF Export Handling using html2pdf.js
function setupPdfExport() {
  const exportBtns = [
    document.getElementById('btn-export-pdf'),
    document.getElementById('btn-preview-export')
  ];

  exportBtns.forEach(btn => {
    if (!btn) return;
    btn.onclick = () => {
      const element = document.getElementById('resume-paper');
      if (!element) return;

      showToast('Generating high-resolution PDF...');

      const opt = {
        margin:       0,
        filename:     `${(state.resumeData.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
      };

      if (window.html2pdf) {
        window.html2pdf().set(opt).from(element).save().then(() => {
          showToast('PDF Download complete!');
        }).catch(err => {
          console.error(err);
          showToast('Failed to download PDF');
        });
      } else {
        showToast('PDF engine loading, please try again in a moment');
      }
    };
  });
}

// Reset Default Data
function setupResetAction() {
  const resetBtn = document.getElementById('btn-reset-data');
  if (!resetBtn) return;

  resetBtn.onclick = () => {
    if (confirm('Are you sure you want to reset your resume content to default sample data?')) {
      state.resumeData = JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA));
      saveData();
      setupFormBindings();
      renderDynamicLists();
      renderPreview();
      showToast('Resume content reset to sample data');
    }
  };
}

// Toast notification helper
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}
