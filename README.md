# Resume — simple mobile resume builder

This repository is now a clean, simple resume app built for mobile.

## Core features
- **100 fixed, original resume templates** inspired by common professional resume patterns across the web
- Every template has a predefined **font, color, spacing and layout**
- User can edit **text/content only**
- Live preview while typing
- Mobile-friendly editor and preview mode
- Personal info, summary, experience, education, skills, projects and certifications
- Auto-save to **localStorage**
- Works without an account and keeps resume data on the device
- **Export PDF** through the device/browser print-to-PDF flow
- Capacitor Android project and GitHub Actions APK build

## Important template rule
The 100 designs are original implementations. They are informed by current resume-design categories and ATS/readability practices rather than copying proprietary template artwork or assets from another product.

## Build
```bash
npm install
npx cap sync android
cd android
./gradlew assembleDebug
```

APK output:
`android/app/build/outputs/apk/debug/app-debug.apk`
