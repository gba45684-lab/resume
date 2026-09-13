# Resume Studio — 100-template mobile resume builder

A clean, offline-first resume builder for Android and web with a premium editor experience inspired by modern Figma/Canva-style workflows.

## Features
- **100 resume templates** across professional, modern, minimal, executive, creative, editorial, ATS, portfolio, academic and premium families
- A4 live preview above every template name
- Template selection uses the same HTML/CSS rendering primitives as the live resume canvas
- Each template is design-locked: users edit **content/text only**
- Photo and no-photo variants
- Premium editor UI with live canvas preview, zoom controls and responsive mobile navigation
- Search/filter template library
- Personal details, summary, experience, education, skills, projects and certifications
- Live updates while typing
- Add/remove multiple experience and education entries
- Automatic localStorage saving with visible save state
- Works offline without an account
- Browser/device **Export PDF** using the native print-to-PDF flow
- Capacitor Android project with GitHub Actions debug APK build and Capgo OTA workflow

## Open-source template sources

The template system was expanded using permissively licensed open-source resume/CV projects as references. Current registry metadata records Apache-2.0 and MIT sources such as `mnjul/html-resume`, `Tombarr/html-resume-template`, `gligor99/resume-template`, `imvpn22/resume`, `ArthurViniNunes/open-CV-template`, `bjafl-sps/cv-html-template`, `jgibson02/awesome-cv-html`, `happysnaker/Resume`, and `LiuMengxuan04/vibe-resume`.

These references are implemented through the app's own HTML/CSS rendering system. Third-party PSD/FIG binaries, screenshots and proprietary artwork are not redistributed.

See `docs/OPEN_SOURCE_TEMPLATE_SOURCES.md` for the audit registry and licensing policy.

## Magnific licensing

Magnific's current documentation states that Free-license resources may be used commercially with visible attribution, but its terms also prohibit sublicensing or redistributing the original files. Resume Studio therefore does **not** bulk-import Magnific stock/template files into the app. Any future Magnific asset must be individually reviewed, licensed and attributed before use.

## Template system

`www/js/templates.js` contains 100 deterministic template definitions. `www/css/template-variants.css` adds the expanded compositions. The template preview and live A4 canvas use the same design primitives, preventing thumbnail/final-resume mismatches.

## Local build
```bash
npm install
npx cap sync android
cd android
./gradlew assembleDebug
```

APK output:
`android/app/build/outputs/apk/debug/app-debug.apk`

## GitHub Actions

The repository currently contains `build-signed-aab.yml` and `capgo-ota.yml` workflows. See `.github/workflows/` for the Android build and OTA automation.
