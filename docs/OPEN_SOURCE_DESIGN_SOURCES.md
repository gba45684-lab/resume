# Open-source design sources reviewed for Resume Studio

This project uses open-source design systems and resume references as **inspiration and implementation guidance**. It does not ship third-party PSD/FIG binaries, screenshots, logos, or proprietary template artwork.

## Sources reviewed

### 1. Bootflat UI Kit PSD
- Repository: `Bootflat/Bootflat.UI.Kit.PSD`
- License: MIT
- Used for: early UI component patterns such as buttons, cards, inputs, panels, navigation and consistent component spacing.
- Integration rule: recreate the useful interaction patterns in HTML/CSS; do not redistribute the PSD binary.

### 2. Ahmed Rizwan resume-template
- Repository: `ahmedrizwan/resume-template`
- License: MIT
- Used for: resume-board structure, auto-layout thinking, clean single-page hierarchy and editable content blocks.
- Integration rule: the app renders its own HTML resume templates rather than embedding the Figma file.

### 3. Noah Buscher resumes
- Repository: `noahbuscher/resumes`
- License: MIT
- Used for: clean single-page resume composition, restrained typography and photo/no-photo composition ideas.
- Integration rule: layouts in this app remain original deterministic implementations.

### 4. Tabler UI Kit
- Repository: `tabler/tabler`
- License: MIT
- Used for: application shell, forms, cards, modal/sheet, responsive navigation, spacing and accessibility-oriented component patterns.

### 5. Tabler Icons
- Repository: `tabler/tabler-icons`
- License: MIT
- Used as the preferred future source for small UI icons where an icon is needed. The app should keep icons as SVG/UI assets rather than raster screenshots.

### 6. Shiva Kar Resume Builder
- Repository: `shiva-kar/resume-builder`
- License: MIT
- Used for: architecture ideas around template registries, shared resume sections, live DOM preview, local persistence and PDF consistency.
- Integration rule: no source code or template artwork is copied into this project.

## Components covered

The design review covers the full product surface:

- App shell / top navigation
- Template library and search
- Template preview cards
- Editor sections and field groups
- Add/remove repeatable experience and education cards
- Live A4 resume canvas
- Zoom controls
- Preview mode / mobile navigation
- Save state and local persistence
- PDF export action
- Empty states and responsive behavior
- Resume primitives: header, contact line, section heading, experience, education, skills, projects and certifications
- Photo/no-photo resume variants
- Single-column, two-column, sidebar, timeline, editorial, ATS and portfolio compositions

## Licensing policy

Only assets with a license compatible with this project should be added to the repository. MIT/ISC/BSD assets are preferred for code and icons. Every redistributed third-party asset must retain its required copyright/license notice.

Do not import random PSD/FIG files from template marketplaces or image-search results into the app. A search result being downloadable does **not** make its artwork open source.

## Implementation policy

Resume Studio's 100 templates are generated from the project's own template definitions in `www/js/templates.js`. The references above inform component quality and layout patterns, but the shipped resume designs are implemented independently so the application remains maintainable, editable and safe to redistribute.
