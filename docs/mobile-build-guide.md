# Mobile App Build & Distribution Guide

Complete guide for building and distributing Android and iOS apps for PostQode Nexus.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Android Build](#android-build)
3. [iOS Build](#ios-build)
4. [Distribution Options](#distribution-options)

---

## Prerequisites

### Required Tools
- **Node.js** (v16+)
- **Android**: Android Studio, Android SDK
- **iOS**: Xcode (macOS only), CocoaPods

### Environment Configuration
Update `.env` file in project root:
```bash
API_BASE_URL=https://nexus-api.postqode.io
```

---

## Android Build

### Build APK

```bash
./scripts/build-mobile-android.sh
```

**What it does:**
1. Cleans caches (`.expo`, `node_modules/.cache`)
2. Runs `expo prebuild` to generate native Android project
3. Exports standalone JavaScript bundle (Hermes bytecode)
4. Copies bundle to `android/app/src/main/assets/`
5. Builds APK using Gradle

**Output:**
```
mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

### Install on Android Device/Emulator

**Option 1: Using ADB**
```bash
adb install -r mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

**Option 2: Manual Installation**
1. Copy APK to device
2. Open APK file on device
3. Allow installation from unknown sources if prompted
4. Install

### Android Distribution Options

| Method | Ease | Reach | Cost |
|--------|------|-------|------|
| **Direct APK Sharing** | ✅ Easy | Anyone with Android | Free |
| **Google Play Store** | Medium | Public/Unlimited | $25 one-time |
| **Internal Testing** | Easy | Up to 100 testers | Free (via Play Console) |
| **Firebase App Distribution** | Easy | Unlimited testers | Free |

**Recommended: Direct APK Sharing**
- Share the APK file via email, cloud storage, or messaging
- Users install directly on their devices
- No registration or accounts needed

---

## iOS Build

### Important: Simulator vs Physical Device

iOS has **two different build types**:

| Type | SDK | Code Signing | Can Share? | Use Case |
|------|-----|--------------|------------|----------|
| **Simulator** | iphonesimulator | ❌ Not needed | ❌ No | Local testing only |
| **Physical Device** | iphoneos | ✅ Required | ⚠️ Limited | Testing on real devices |

### Build for Simulator

```bash
./scripts/build-mobile-ios.sh
```

**Output:**
```
mobile/ios/build/Build/Products/Release-iphonesimulator/PostQodeNexus.app
```

**Install on Simulator:**
```bash
# 1. Open Simulator
open -a Simulator

# 2. Install app
xcrun simctl install booted mobile/ios/build/Build/Products/Release-iphonesimulator/PostQodeNexus.app

# 3. Launch app
xcrun simctl launch booted com.postqode.nexus
```

### Build for Physical Device

```bash
./scripts/build-mobile-ios.sh device
```

**Output:**
```
mobile/ios/build-device/Build/Products/Release-iphoneos/PostQodeNexus.app
```

**Install on Physical Device:**

1. **Connect iPhone to Mac**

2. **Find Device ID:**
```bash
xcrun devicectl list devices
```

3. **Install App:**
```bash
xcrun devicectl device install app --device <DEVICE_ID> mobile/ios/build-device/Build/Products/Release-iphoneos/PostQodeNexus.app
```

4. **Trust Developer Certificate:**
   - On iPhone: Settings → General → VPN & Device Management
   - Tap on "Apple Development: [your email]"
   - Tap "Trust"

### iOS Distribution Options

#### 1. **TestFlight** (Recommended for Beta Testing)
- **Reach**: Up to 10,000 external testers
- **Cost**: Requires Apple Developer Program ($99/year)
- **Ease**: Medium
- **Process**:
  1. Archive app in Xcode
  2. Upload to App Store Connect
  3. Add testers via email
  4. Testers install via TestFlight app

**Steps:**
```bash
# 1. Archive the app
xcodebuild -workspace mobile/ios/PostQodeNexus.xcworkspace \
  -scheme PostQodeNexus \
  -configuration Release \
  -archivePath build/PostQodeNexus.xcarchive \
  archive

# 2. Export IPA
xcodebuild -exportArchive \
  -archivePath build/PostQodeNexus.xcarchive \
  -exportPath build/ \
  -exportOptionsPlist ExportOptions.plist

# 3. Upload to App Store Connect (use Xcode or Transporter app)
```

#### 2. **Ad Hoc Distribution**
- **Reach**: Up to 100 registered devices per year
- **Cost**: Requires Apple Developer Program ($99/year)
- **Ease**: Hard
- **Process**:
  1. Register device UDIDs in Apple Developer Portal
  2. Create Ad Hoc provisioning profile
  3. Build IPA with Ad Hoc profile
  4. Share IPA file
  5. Install via Xcode, Apple Configurator, or OTA

#### 3. **Enterprise Distribution**
- **Reach**: Unlimited devices within organization
- **Cost**: Apple Developer Enterprise Program ($299/year)
- **Ease**: Medium
- **Use Case**: Internal company apps only

#### 4. **App Store**
- **Reach**: Public/Unlimited
- **Cost**: Apple Developer Program ($99/year)
- **Ease**: Medium-Hard
- **Process**: Full App Store review process

### iOS Distribution Comparison

| Method | Best For | Limitations |
|--------|----------|-------------|
| **Development Build** | Personal testing | Only devices you have physical access to |
| **TestFlight** | Beta testing | Requires Apple Developer account |
| **Ad Hoc** | Small team testing | Max 100 devices, manual UDID registration |
| **Enterprise** | Large organizations | Internal use only, expensive |
| **App Store** | Public release | Review process, ongoing maintenance |

---

## Quick Reference

### Android
```bash
# Build
./scripts/build-mobile-android.sh

# Install
adb install -r mobile/android/app/build/outputs/apk/debug/app-debug.apk

# Share
# Just send the APK file!
```

### iOS Simulator
```bash
# Build
./scripts/build-mobile-ios.sh

# Install
xcrun simctl install booted mobile/ios/build/Build/Products/Release-iphonesimulator/PostQodeNexus.app

# Launch
xcrun simctl launch booted com.postqode.nexus
```

### iOS Physical Device
```bash
# Build
./scripts/build-mobile-ios.sh device

# Install
xcrun devicectl device install app --device <DEVICE_ID> mobile/ios/build-device/Build/Products/Release-iphoneos/PostQodeNexus.app

# Trust certificate on device (one-time)
# Settings → General → VPN & Device Management → Trust
```

---

## Troubleshooting

### Android

**Issue**: "Installation failed"
- **Solution**: Enable "Install from Unknown Sources" in device settings

**Issue**: "App crashes on login"
- **Solution**: Ensure `.env` has correct `API_BASE_URL` and rebuild

### iOS

**Issue**: "Untrusted Developer"
- **Solution**: Trust certificate in Settings → General → VPN & Device Management

**Issue**: "No code signature found"
- **Solution**: Build with `device` parameter: `./scripts/build-mobile-ios.sh device`

**Issue**: "No profiles for 'com.postqode.nexus'"
- **Solution**: Ensure you have Apple Developer account configured in Xcode

---

## App Credentials

**Test Login:**
- Username: `admin`
- Password: `Admin@123`

---

## Notes

- **Android APK**: Can be shared freely, works on any Android device
- **iOS Simulator Build**: Only works on Mac simulators, cannot be shared
- **iOS Device Build**: Requires code signing, limited sharing options
- **Production Backend**: Both apps connect to `https://nexus-api.postqode.io`
- **Standalone Apps**: No Metro bundler needed, JavaScript bundle is embedded

---

## For Production Release

### Android
1. Generate release keystore
2. Update `android/app/build.gradle` with signing config
3. Build release APK: `./gradlew assembleRelease`
4. Upload to Google Play Console

### iOS
1. Create App Store provisioning profile
2. Archive app in Xcode
3. Upload to App Store Connect
4. Submit for review

---

**Last Updated**: January 15, 2026
