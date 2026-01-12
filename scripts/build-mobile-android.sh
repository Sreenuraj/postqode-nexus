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
NC='\033[0m'

cd "$PROJECT_ROOT/mobile"

# Run prebuild to generate android folder
echo "⚙️  Running Expo Prebuild..."
npx expo prebuild --platform android --clean

cd android

# Check if local.properties exists (needed for SDK location)
if [ ! -f "local.properties" ]; then
    echo -e "${YELLOW}⚠️  local.properties not found. Ensure Android SDK is setup.${NC}"
fi

# Build Debug APK
echo "🔨 Running ./gradlew assembleDebug..."
./gradlew assembleDebug

echo ""
echo -e "${GREEN}✅ Build Complete!${NC}"
echo "APK location: mobile/android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
