# Resume Studio — 100-template mobile resume builder

Resume Studio is an offline-first Android/web resume builder with a polished editor and a live A4 canvas.

## Features
- **100 resume templates** across professional, modern, minimal, executive, creative, editorial, ATS, portfolio, academic and premium families
- A4 live preview above every template name
- Template thumbnails and the live canvas share the same rendering primitives
- Template design is locked: users edit content/data while typography and layout rules remain template-controlled
- Photo and no-photo support
- Search/filter template library
- Personal details, summary, experience, education, skills, projects, certifications, achievements, languages, volunteering, publications, interests and references
- Live updates while typing
- Add/remove repeated entries for all supported sections
- Automatic localStorage saving with visible save state
- Offline-first startup with no CDN/font dependency
- Native browser/device **Export PDF** through print-to-PDF
- Capacitor Android project with GitHub Actions debug APK build
- Custom **ResuMate1-style GitHub-branch OTA** system; no Capgo dependency
- Automated static audit for duplicate IDs, missing local assets, template uniqueness, JavaScript syntax and stale Capgo references

## Template and licensing policy

The 100 current layouts are native HTML/CSS compositions owned by this project. The repository does not redistribute third-party PSD/FIG binaries, screenshots, or proprietary marketplace files.

Open-source resume projects may be used as design/code references only where their licenses permit it. See `docs/OPEN_SOURCE_TEMPLATE_SOURCES.md` for the reference registry and policy.

## Architecture

- `www/index.html` — single UI shell and component wiring
- `www/js/app.js` — single application state/event layer, editing, persistence, preview and import/print handling
- `www/js/templates.js` — 100 deterministic template definitions
- `www/css/style.css` — base UI and A4 resume styles
- `www/css/components.css` — component polish/accessibility layer
- `www/css/template-variants.css` — additional layout variants
- `www/js/ota-bootstrap.js` — update detection, verification, activation and rollback
- `scripts/publish-ota.mjs` — creates a self-contained OTA HTML bundle and manifest
- `scripts/audit-project.mjs` — static integrity audit used in CI

## OTA flow

A main-branch change affecting web assets triggers `.github/workflows/publish-ota.yml`. The workflow increments the OTA build number, validates the repository, creates a **self-contained** `index.html` containing the required CSS/JS, calculates SHA-256, and force-updates the dedicated `ota` branch with `index.html` + `version.json`.

The installed app checks the manifest on launch, downloads the newer bundle, verifies its build marker and SHA-256, stores it locally, then activates it on the next launch. The bootstrap records the previous bundle and rolls back a pending update when the updated app fails to report healthy initialization.

## Local build

```bash
npm install
node scripts/audit-project.mjs
npx cap sync android
cd android
./gradlew assembleDebug
```

APK output:
`android/app/build/outputs/apk/debug/app-debug.apk`

## GitHub Actions

`.github/workflows/build-signed-aab.yml` builds and uploads the debug APK.

`.github/workflows/publish-ota.yml` publishes the self-contained GitHub-branch OTA bundle.
