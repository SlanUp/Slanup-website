# Slanup Mobile App — Setup Guide

## Prerequisites (on Mac)
- Xcode (latest) from App Store
- Android Studio
- Node.js 18+
- CocoaPods: `sudo gem install cocoapods`

## 1. Clone & Install
```bash
git clone <repo-url> slanup-website
cd slanup-website
npm install
```

## 2. Generate Native Projects
```bash
npx cap add ios
npx cap add android
```

## 3. Copy Firebase Config Files
```bash
# iOS — copy to ios/App/App/
cp GoogleService-Info.plist ios/App/App/GoogleService-Info.plist

# Android — copy to android/app/
cp google-services.json android/app/google-services.json
```

## 4. iOS Setup (Xcode)
```bash
npx cap open ios
```

In Xcode:
1. Select the **App** target → **Signing & Capabilities**
2. Set Team: "Siddhivinayak Dubey" (BSV5Z75H2P)
3. Bundle ID should be: `com.slanup.app`
4. Click **+ Capability** → Add **Push Notifications**
5. Click **+ Capability** → Add **Background Modes** → Check "Remote notifications"
6. Set Deployment Target to iOS 16.0+

## 5. Android Setup
```bash
npx cap open android
```
- Build & run from Android Studio
- Push notifications work automatically via `google-services.json`

## 6. App Icons & Splash Screen
Use https://capacitorjs.com/docs/guides/splash-screens-and-icons or:
```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --iconBackgroundColor '#FFFFFF' --splashBackgroundColor '#FFFFFF'
```
Place `icon-only.png` (1024x1024, your logo) and `splash.png` (2732x2732) in `assets/` folder first.

## 7. Build & Run
```bash
# iOS
npx cap sync ios
npx cap run ios

# Android
npx cap sync android
npx cap run android
```

## 8. Backend Setup
Add to your backend `.env`:
```
FIREBASE_SERVICE_ACCOUNT=<your-firebase-service-account-json>
```
Generate a Firebase service account key:
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Copy the JSON content as a single line into the env var

## How Updates Work
- **Web changes**: Push to Vercel → instantly live in the app (loads slanup.com)
- **Native plugin changes**: `npx cap sync` → rebuild in Xcode/Android Studio → submit to stores
- For OTA updates without store review, consider [Capgo](https://capgo.app)

## Store Submission
### iOS (App Store Connect)
1. In Xcode: Product → Archive
2. Upload to App Store Connect
3. Fill in app details, screenshots, description
4. Submit for review (1-3 days)

### Android (Google Play Console)
1. In Android Studio: Build → Generate Signed Bundle/APK
2. Upload to Google Play Console
3. Fill in store listing
4. Submit for review (few hours to 2 days)
