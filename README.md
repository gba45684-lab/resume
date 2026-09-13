# Resume Studio — 100-template mobile resume builder

A clean, offline-first resume builder for Android and web with a premium editor experience inspired by modern Figma/Canva-style workflows while using original resume layouts.

## Features
- **100 fixed resume templates** with predefined typography, colors, spacing and layout
- Each template is design-locked: users edit **content/text only**
- Premium editor UI with live canvas preview, zoom controls and responsive mobile navigation
- Template library with visual thumbnails and search
- Personal details, summary, experience, education, skills, projects and certifications
- Live updates while typing
- Add/remove multiple experience and education entries
- Automatic localStorage saving with visible save state
- Works offline without an account
- Browser/device **Export PDF** using the native print-to-PDF flow
- Capacitor Android project with GitHub Actions debug APK build

## Open-source design review

The app's component system and resume composition have been reviewed against permissively licensed/open-source references including Bootflat UI Kit PSD (MIT), MIT-licensed Figma resume references, Noah Buscher's MIT resume templates, Tabler UI/Tabler Icons, and the MIT-licensed Shiva Kar resume-builder architecture. These are used for design and implementation guidance only; third-party PSD/FIG binaries, screenshots, logos and proprietary artwork are not bundled.

See `docs/OPEN_SOURCE_DESIGN_SOURCES.md` for the source-by-source review, licensing rules and the component coverage checklist.

## Template system
The template library contains 100 deterministic, original template definitions across professional, modern, minimal, executive, creative, editorial, ATS, portfolio, academic and premium families. Designs use fixed typography, color, spacing and structural rules so editing content does not accidentally change the chosen design.

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
Pushes to `main` and manual workflow runs build the debug APK and upload it as the `resume-debug-apk` artifact. The Android debug build does not require a release keystore.
