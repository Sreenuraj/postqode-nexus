#!/bin/bash
# build-mobile-android.sh - Build Android APK

set -e

echo "🏗️  Building Android APK..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd "$PROJECT_ROOT/mobile"

echo -e "${BLUE}📋 Current API_BASE_URL from .env:${NC}"
grep "^API_BASE_URL=" "$PROJECT_ROOT/.env" || echo "API_BASE_URL not found in .env"
echo ""

# Clean caches to ensure fresh env variables
echo -e "${YELLOW}🧹 Cleaning caches...${NC}"
rm -rf .expo
rm -rf node_modules/.cache

# Clean Android build
if [ -d "android" ]; then
    cd android
    ./gradlew clean
    cd ..
fi

# Run prebuild to generate android folder
echo -e "${BLUE}⚙️  Running Expo Prebuild...${NC}"
npx expo prebuild --platform android --clean

# Create assets directory for bundled JS
echo -e "${BLUE}📦 Creating assets directory...${NC}"
mkdir -p android/app/src/main/assets

# Export the app (this creates a standalone bundle)
echo -e "${BLUE}📦 Exporting app bundle...${NC}"
npx expo export --platform android --output-dir .expo-export

# Copy the Hermes bytecode bundle to the correct location
echo -e "${BLUE}📦 Copying bundle to assets...${NC}"
if [ -f .expo-export/_expo/static/js/android/*.hbc ]; then
    cp .expo-export/_expo/static/js/android/*.hbc android/app/src/main/assets/index.android.bundle
    echo -e "${GREEN}✅ Hermes bytecode bundle copied${NC}"
elif [ -f .expo-export/_expo/static/js/android/index.js ]; then
    cp .expo-export/_expo/static/js/android/index.js android/app/src/main/assets/index.android.bundle
    echo -e "${GREEN}✅ JavaScript bundle copied${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Bundle file not found in expected location${NC}"
fi

# Copy assets
if [ -d ".expo-export/assets" ]; then
    echo -e "${BLUE}📦 Copying assets...${NC}"
    cp -r .expo-export/assets/* android/app/src/main/res/ 2>/dev/null || true
fi

cd android

# Check if local.properties exists (needed for SDK location)
if [ ! -f "local.properties" ]; then
    echo -e "${YELLOW}⚠️  local.properties not found. Ensure Android SDK is setup.${NC}"
fi

# Build Debug APK
echo -e "${BLUE}🔨 Running ./gradlew assembleDebug...${NC}"
./gradlew assembleDebug

echo ""
echo -e "${GREEN}✅ Build Complete!${NC}"
echo "APK location: mobile/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo -e "${BLUE}📱 To install on emulator:${NC}"
echo "adb install -r mobile/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
