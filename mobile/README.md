# PostQode Nexus Mobile

React Native (Expo) application for PostQode Nexus.

## Prerequisites

- Node.js
- npm
- Android Studio / Xcode (for simulators)
- `.env` file in the root directory

## Setup

1. Install dependencies:
   ```bash
   cd mobile
   npm install
   ```

2. Ensure `.env` exists in the project root (`../.env`).

## Running the App

Use the scripts in the `scripts/` directory:

- **Start Development Server**:
  ```bash
  ./scripts/start-mobile.sh
  ```

- **Build Android APK**:
  ```bash
  ./scripts/build-mobile-android.sh
  ```

- **Build iOS App**:
  ```bash
  ./scripts/build-mobile-ios.sh
  ```

## Architecture

- **State Management**: Zustand (`src/store`)
- **Navigation**: React Navigation (`App.tsx`)
- **API**: Axios with Interceptors (`src/services/api.ts`)
- **Styling**: StyleSheet + SafeAreaContext
- **Charts**: react-native-chart-kit

## Environment Variables

The app reads from the root `.env` file.
`API_BASE_URL` is automatically adjusted for Android Emulator (`10.0.2.2`) if set to `localhost`.
