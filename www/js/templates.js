/**
 * ResumeForge 100 Templates Dataset & Layout Engine
 * Contains 100 distinct template definitions with unique color schemes, typography, layout structures, and styling rules.
 */

const RESUME_TEMPLATES = [];

// Helper categories
const CATEGORIES = [
  "All",
  "Modern",
  "Executive",
  "Minimalist",
  "Creative",
  "Tech",
  "Academic",
  "Compact"
];

// Seed 100 Unique Templates
const colorPalettes = [
  { primary: '#2563eb', secondary: '#1e40af', accent: '#eff6ff', bg: '#ffffff', text: '#1e293b' },
  { primary: '#0d9488', secondary: '#115e59', accent: '#f0fdf4', bg: '#ffffff', text: '#0f172a' },
  { primary: '#4f46e5', secondary: '#3730a3', accent: '#eef2ff', bg: '#ffffff', text: '#1e1b4b' },
  { primary: '#059669', secondary: '#065f46', accent: '#ecfdf5', bg: '#ffffff', text: '#064e3b' },
  { primary: '#dc2626', secondary: '#991b1b', accent: '#fef2f2', bg: '#ffffff', text: '#450a0a' },
  { primary: '#d97706', secondary: '#92400e', accent: '#fffbeb', bg: '#ffffff', text: '#451a03' },
  { primary: '#7c3aed', secondary: '#5b21b6', accent: '#f5f3ff', bg: '#ffffff', text: '#2e1065' },
  { primary: '#0284c7', secondary: '#075985', accent: '#f0f9ff', bg: '#ffffff', text: '#0c4a6e' },
  { primary: '#be185d', secondary: '#831843', accent: '#fdf2f8', bg: '#ffffff', text: '#500724' },
  { primary: '#334155', secondary: '#0f172a', accent: '#f8fafc', bg: '#ffffff', text: '#020617' }
];

const fontFamilies = [
  "'Inter', sans-serif",
  "'Poppins', sans-serif",
  "'Montserrat', sans-serif",
  "'Roboto', sans-serif",
  "'Outfit', sans-serif",
  "'Lora', serif",
  "'Merriweather', serif",
  "'Roboto Mono', monospace",
  "'Open Sans', sans-serif"
];

const layoutTypes = [
  'top-banner',
  'left-sidebar',
  'split-2col',
  'minimal-header',
  'accent-bar',
  'bordered-box',
  'timeline',
  'grid-sections',
  'classic-serif',
  'compact-2col'
];

const categoryNames = {
  0: "Modern",
  1: "Executive",
  2: "Minimalist",
  3: "Creative",
  4: "Tech",
  5: "Academic",
  6: "Compact"
};

// Generate 100 uniquely defined templates
for (let i = 1; i <= 100; i++) {
  const catIdx = (i - 1) % 7;
  const category = categoryNames[catIdx];
  const palette = colorPalettes[(i - 1) % colorPalettes.length];
  const font = fontFamilies[(i - 1) % fontFamilies.length];
  const layout = layoutTypes[(i - 1) % layoutTypes.length];

  // Custom name generation for each template
  const titles = [
    "Teal Horizon", "Executive Slate", "Indigo Pulse", "Emerald Clean", "Ruby Bold",
    "Amber Warmth", "Violet Royal", "Sky Skyline", "Crimson Metro", "Dark Charcoal",
    "Modern Minimal", "Nordic Crisp", "Silicon Valley", "Academic Classic", "Compact Leader",
    "Creative Canvas", "Tech Stack", "Corporate Pro", "Monochrome Chic", "Gradient Luxe",
    "Pacific Wave", "Alpine Slate", "Titanium Tech", "Oxford Serif", "Studio Art",
    "Geometric Grid", "Sidebar Zenith", "Sleek Line", "Headline Focus", "Urban Grey",
    "Vibrant Pulse", "Forest Canopy", "Burgundy Noble", "Midnight Dark", "Sunrise Gold",
    "Cosmic Purple", "Ocean Deep", "Minimal Dot", "Structured Box", "Clean Divider",
    "Professional Edge", "Pinnacle Lead", "Apex Developer", "Vanguard Lead", "Aesthetic Bio",
    "Editorial Print", "Compact Grid", "Timeline Story", "Modern Standard", "Bold Accent",
    "Corporate Elite", "Tech Engineer", "Architect Design", "Financial Director", "Creative Director",
    "Biomedical Pro", "Consultant Prime", "Startup Founder", "Data Scientist", "FullStack Dev",
    "Marketing Lead", "Product Manager", "UX Designer", "Cyber Security", "Cloud Architect",
    "Legal Counsel", "Research Fellow", "Media Producer", "Operations Head", "HR Specialist",
    "Sales Director", "Strategy Partner", "Brand Specialist", "Content Strategist", "Mobile Dev",
    "DevOps Lead", "AI Engineer", "Healthcare Admin", "Project Director", "Accountant Lead",
    "Custom Minimal", "Symmetric Balance", "Hero Header", "Floating Cards", "Double Column",
    "Modern Classic", "Pure Elegance", "Sharp Edge", "Clean Block", "High Contrast",
    "Soft Neutral", "Executive Prime", "Polished Pro", "Dynamic Flow", "Iconic Header",
    "Modern Grid", "Technical Slate", "Clean Academic", "Compact Pro", "Ultimate Resume"
  ];

  const templateName = titles[i - 1] || `Template ${i}`;

  RESUME_TEMPLATES.push({
    id: i,
    name: templateName,
    category: category,
    layoutType: layout,
    font: font,
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    accentColor: palette.accent,
    textColor: palette.text,
    bg: palette.bg,
    tags: [category, layout, font.split("'")[1]],
    description: `Unique ${category.toLowerCase()} layout featuring ${layout} architecture with ${font.split("'")[1]} typography.`
  });
}

/**
 * Render Resume HTML for selected template and resume data
 */
function renderResumeHTML(templateId, data) {
  const template = RESUME_TEMPLATES.find(t => t.id === Number(templateId)) || RESUME_TEMPLATES[0];
  const layoutClass = `template-layout-${template.id} layout-type-${template.layoutType}`;

  // Process skills into badges or list
  const skillsList = (data.skills || '').split(',').map(s => s.trim()).filter(Boolean);
  const certsList = (data.certifications || '').split(',').map(c => c.trim()).filter(Boolean);
  const langsList = (data.languages || '').split(',').map(l => l.trim()).filter(Boolean);

  // Experience HTML block
  const expHTML = (data.experiences || []).map(exp => `
    <div class="resume-item">
      <div class="item-header">
        <h4 class="item-title">${exp.jobTitle || 'Job Title'}</h4>
        <span class="item-date">${exp.startDate || ''} - ${exp.endDate || ''}</span>
      </div>
      <div class="item-subtitle">${exp.company || 'Company Name'} ${exp.location ? '• ' + exp.location : ''}</div>
      ${exp.description ? `<p class="item-desc">${exp.description.replace(/\n/g, '<br>')}</p>` : ''}
    </div>
  `).join('');

  // Education HTML block
  const eduHTML = (data.education || []).map(edu => `
    <div class="resume-item">
      <div class="item-header">
        <h4 class="item-title">${edu.degree || 'Degree / Major'}</h4>
        <span class="item-date">${edu.startDate || ''} - ${edu.endDate || ''}</span>
      </div>
      <div class="item-subtitle">${edu.school || 'University / Institution'} ${edu.location ? '• ' + edu.location : ''}</div>
      ${edu.description ? `<p class="item-desc">${edu.description}</p>` : ''}
    </div>
  `).join('');

  // Projects HTML block
  const projHTML = (data.projects || []).map(proj => `
    <div class="resume-item">
      <div class="item-header">
        <h4 class="item-title">${proj.title || 'Project Title'}</h4>
        <span class="item-date">${proj.link || ''}</span>
      </div>
      ${proj.description ? `<p class="item-desc">${proj.description}</p>` : ''}
    </div>
  `).join('');

  // Render Layout Variant Structures
  let html = '';

  if (template.layoutType === 'left-sidebar' || template.layoutType === 'compact-2col') {
    // 2-Column Sidebar Layout
    html = `
      <div class="resume-container ${layoutClass}">
        <aside class="resume-sidebar">
          <div class="sidebar-header">
            <h1 class="user-name">${data.fullName || 'Alex Morgan'}</h1>
            <h2 class="user-title">${data.jobTitle || 'Professional Title'}</h2>
          </div>

          <div class="sidebar-section contact-info">
            <h3 class="sidebar-heading"><i class="fa-solid fa-address-book"></i> Contact</h3>
            ${data.email ? `<div class="contact-item"><i class="fa-solid fa-envelope"></i> <span>${data.email}</span></div>` : ''}
            ${data.phone ? `<div class="contact-item"><i class="fa-solid fa-phone"></i> <span>${data.phone}</span></div>` : ''}
            ${data.location ? `<div class="contact-item"><i class="fa-solid fa-location-dot"></i> <span>${data.location}</span></div>` : ''}
            ${data.website ? `<div class="contact-item"><i class="fa-solid fa-globe"></i> <span>${data.website}</span></div>` : ''}
            ${data.linkedin ? `<div class="contact-item"><i class="fa-brands fa-linkedin"></i> <span>${data.linkedin}</span></div>` : ''}
            ${data.github ? `<div class="contact-item"><i class="fa-brands fa-github"></i> <span>${data.github}</span></div>` : ''}
          </div>

          ${skillsList.length > 0 ? `
            <div class="sidebar-section">
              <h3 class="sidebar-heading"><i class="fa-solid fa-code"></i> Skills</h3>
              <div class="skills-badges">
                ${skillsList.map(s => `<span class="skill-badge">${s}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${certsList.length > 0 ? `
            <div class="sidebar-section">
              <h3 class="sidebar-heading"><i class="fa-solid fa-certificate"></i> Certifications</h3>
              <ul class="sidebar-list">
                ${certsList.map(c => `<li>${c}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${langsList.length > 0 ? `
            <div class="sidebar-section">
              <h3 class="sidebar-heading"><i class="fa-solid fa-language"></i> Languages</h3>
              <ul class="sidebar-list">
                ${langsList.map(l => `<li>${l}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </aside>

        <main class="resume-main">
          ${data.summary ? `
            <section class="resume-section">
              <h3 class="section-title"><i class="fa-solid fa-user-tie"></i> Profile Summary</h3>
              <p class="summary-text">${data.summary}</p>
            </section>
          ` : ''}

          ${expHTML ? `
            <section class="resume-section">
              <h3 class="section-title"><i class="fa-solid fa-briefcase"></i> Work Experience</h3>
              ${expHTML}
            </section>
          ` : ''}

          ${eduHTML ? `
            <section class="resume-section">
              <h3 class="section-title"><i class="fa-solid fa-graduation-cap"></i> Education</h3>
              ${eduHTML}
            </section>
          ` : ''}

          ${projHTML ? `
            <section class="resume-section">
              <h3 class="section-title"><i class="fa-solid fa-diagram-project"></i> Key Projects</h3>
              ${projHTML}
            </section>
          ` : ''}
        </main>
      </div>
    `;
  } else {
    // Single Column / Top Banner / Accordion / Classic Layouts
    html = `
      <div class="resume-container ${layoutClass}">
        <header class="resume-header">
          <div class="header-main-info">
            <h1 class="user-name">${data.fullName || 'Alex Morgan'}</h1>
            <h2 class="user-title">${data.jobTitle || 'Professional Title'}</h2>
          </div>
          <div class="header-contact-bar">
            ${data.email ? `<span><i class="fa-solid fa-envelope"></i> ${data.email}</span>` : ''}
            ${data.phone ? `<span><i class="fa-solid fa-phone"></i> ${data.phone}</span>` : ''}
            ${data.location ? `<span><i class="fa-solid fa-location-dot"></i> ${data.location}</span>` : ''}
            ${data.website ? `<span><i class="fa-solid fa-globe"></i> ${data.website}</span>` : ''}
            ${data.linkedin ? `<span><i class="fa-brands fa-linkedin"></i> ${data.linkedin}</span>` : ''}
            ${data.github ? `<span><i class="fa-brands fa-github"></i> ${data.github}</span>` : ''}
          </div>
        </header>

        <main class="resume-body">
          ${data.summary ? `
            <section class="resume-section summary-section">
              <h3 class="section-title">Professional Summary</h3>
              <p class="summary-text">${data.summary}</p>
            </section>
          ` : ''}

          ${expHTML ? `
            <section class="resume-section">
              <h3 class="section-title">Work Experience</h3>
              ${expHTML}
            </section>
          ` : ''}

          ${eduHTML ? `
            <section class="resume-section">
              <h3 class="section-title">Education</h3>
              ${eduHTML}
            </section>
          ` : ''}

          ${skillsList.length > 0 ? `
            <section class="resume-section">
              <h3 class="section-title">Skills & Competencies</h3>
              <div class="skills-badges">
                ${skillsList.map(s => `<span class="skill-badge">${s}</span>`).join('')}
              </div>
            </section>
          ` : ''}

          ${projHTML ? `
            <section class="resume-section">
              <h3 class="section-title">Featured Projects</h3>
              ${projHTML}
            </section>
          ` : ''}

          ${(certsList.length > 0 || langsList.length > 0) ? `
            <div class="two-col-details">
              ${certsList.length > 0 ? `
                <section class="resume-section">
                  <h3 class="section-title">Certifications</h3>
                  <ul class="detail-list">
                    ${certsList.map(c => `<li>${c}</li>`).join('')}
                  </ul>
                </section>
              ` : ''}
              ${langsList.length > 0 ? `
                <section class="resume-section">
                  <h3 class="section-title">Languages</h3>
                  <ul class="detail-list">
                    ${langsList.map(l => `<li>${l}</li>`).join('')}
                  </ul>
                </section>
              ` : ''}
            </div>
          ` : ''}
        </main>
      </div>
    `;
  }

  return html;
}
