# ResumeForge — Android (Capacitor) Project

This folder is a working Capacitor project. `npm install` and `npx cap add android`
have already been run for you — the native `android/` project exists and is synced
to `www/index.html` (your ResumeForge app). You just need Android Studio to finish
the build; nothing else needs scaffolding.

## What's inside
- `www/index.html` — the full ResumeForge app (10 templates, editor, PDF export)
- `android/` — the generated native Android Studio project
- `capacitor.config.json` — app ID `com.krapal.resumeforge`, app name "ResumeForge"
- `variables.gradle` is already set to `compileSdk 36` / `targetSdk 36`, meeting
  Google Play's Aug 31, 2026 requirement

## What you need to do locally (this part can't be done in this sandbox — it
needs the Android SDK and Google's Maven repo, which aren't reachable here)

1. **Install Android Studio** (includes the Android SDK, emulator, and Gradle).
2. Open this folder in Android Studio: `File → Open → select the android/ folder`
   (or run `npx cap open android` from this project root if you have the CLI).
3. Let Gradle sync — first sync downloads dependencies, takes a few minutes.
4. **Replace the placeholder app icon**: Android Studio → right-click `res` →
   `New → Image Asset` → pick your logo. (I didn't design one — happy to mock up
   an icon concept if you want.)
5. **Add AdMob**: run `npm install @capacitor-community/admob` in this folder,
   then `npx cap sync android`, and follow the plugin's README to drop in your
   AdMob App ID (from your AdMob account) into `AndroidManifest.xml`.
6. **Test on a device/emulator**: `Run ▶` in Android Studio.
7. **Generate a signing key** (`Build → Generate Signed Bundle/APK`), keep the
   keystore file somewhere safe — you'll need the same key for every future update.
8. **Build a release AAB** (`Build → Generate Signed Bundle/APK → Android App
   Bundle`) — Play Console requires `.aab`, not `.apk`.
9. Upload the `.aab` to Play Console under a Closed Testing track first.

## Updating the app later
Whenever you change `www/index.html` (e.g. new templates), just run:
```
npx cap sync android
```
then rebuild in Android Studio. You don't need to redo any of the setup above.

## Notes
- `allowMixedContent: true` is set in `capacitor.config.json` so the Google Fonts
  and html2pdf.js CDN calls in the app work inside the WebView.
- App icon and splash screen are currently Capacitor's defaults — swap these
  before publishing.
