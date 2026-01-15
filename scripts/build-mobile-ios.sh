#!/bin/bash
# build-mobile-ios.sh - Build iOS App with Standalone Bundle

set -e

echo "🏗️  Building iOS App..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if building for device or simulator
BUILD_FOR_DEVICE=${1:-"simulator"}

if [ "$BUILD_FOR_DEVICE" = "device" ]; then
    echo -e "${BLUE}📱 Building for Physical Device${NC}"
    SDK="iphoneos"
    BUILD_DIR="build-device"
    PRODUCT_DIR="Release-iphoneos"
else
    echo -e "${BLUE}📱 Building for Simulator${NC}"
    SDK="iphonesimulator"
    BUILD_DIR="build"
    PRODUCT_DIR="Release-iphonesimulator"
fi
echo ""

cd "$PROJECT_ROOT/mobile"

echo -e "${BLUE}📋 Current API_BASE_URL from .env:${NC}"
grep "^API_BASE_URL=" "$PROJECT_ROOT/.env" || echo "API_BASE_URL not found in .env"
echo ""

# Clean caches to ensure fresh env variables
echo -e "${YELLOW}🧹 Cleaning caches...${NC}"
rm -rf .expo
rm -rf node_modules/.cache

# Clean iOS build
if [ -d "ios" ]; then
    echo -e "${YELLOW}🧹 Cleaning iOS build artifacts...${NC}"
    cd ios
    xcodebuild clean -workspace PostQodeNexus.xcworkspace -scheme PostQodeNexus 2>/dev/null || true
    rm -rf build build-device
    cd ..
fi

# Run prebuild to generate ios folder
echo -e "${BLUE}⚙️  Running Expo Prebuild...${NC}"
npx expo prebuild --platform ios --clean

# Export the app (this creates a standalone bundle)
echo -e "${BLUE}📦 Exporting app bundle...${NC}"
npx expo export --platform ios --output-dir .expo-export

# Copy the bundle to the iOS project
echo -e "${BLUE}📦 Copying bundle to iOS project...${NC}"

# Find and copy the Hermes bytecode or JavaScript bundle
if ls .expo-export/_expo/static/js/ios/*.hbc 1> /dev/null 2>&1; then
    cp .expo-export/_expo/static/js/ios/*.hbc ios/PostQodeNexus/main.jsbundle
    echo -e "${GREEN}✅ Hermes bytecode bundle copied${NC}"
elif [ -f ".expo-export/_expo/static/js/ios/index.js" ]; then
    cp .expo-export/_expo/static/js/ios/index.js ios/PostQodeNexus/main.jsbundle
    echo -e "${GREEN}✅ JavaScript bundle copied${NC}"
else
    echo -e "${RED}❌ Error: Bundle file not found in expected location${NC}"
    echo "Looking for files in .expo-export/_expo/static/js/ios/"
    ls -la .expo-export/_expo/static/js/ios/ 2>/dev/null || echo "Directory doesn't exist"
    exit 1
fi

# Copy assets
if [ -d ".expo-export/assets" ]; then
    echo -e "${BLUE}📦 Copying assets...${NC}"
    cp -r .expo-export/assets/* ios/PostQodeNexus/ 2>/dev/null || true
    echo -e "${GREEN}✅ Assets copied${NC}"
fi

cd ios

# Install pods
echo -e "${BLUE}📦 Installing Pods...${NC}"
pod install

# Build based on target
echo -e "${BLUE}🔨 Building for $SDK...${NC}"

if [ "$BUILD_FOR_DEVICE" = "device" ]; then
    # Build for physical device with code signing
    xcodebuild -workspace PostQodeNexus.xcworkspace \
      -scheme PostQodeNexus \
      -configuration Release \
      -sdk $SDK \
      -derivedDataPath $BUILD_DIR \
      -allowProvisioningUpdates \
      ONLY_ACTIVE_ARCH=YES \
      DEVELOPMENT_TEAM=97FZW836HG \
      CODE_SIGN_STYLE=Automatic
else
    # Build for simulator (no code signing needed)
    xcodebuild -workspace PostQodeNexus.xcworkspace \
      -scheme PostQodeNexus \
      -configuration Release \
      -sdk $SDK \
      -derivedDataPath $BUILD_DIR \
      ONLY_ACTIVE_ARCH=YES
fi

echo ""
echo -e "${GREEN}✅ Build Complete!${NC}"
echo "App location: mobile/ios/$BUILD_DIR/Build/Products/$PRODUCT_DIR/PostQodeNexus.app"
echo ""

if [ "$BUILD_FOR_DEVICE" = "device" ]; then
    echo -e "${BLUE}📱 To install on physical device:${NC}"
    echo "1. Connect your iPhone"
    echo "2. Find device ID: xcrun devicectl list devices"
    echo "3. Install: xcrun devicectl device install app --device <DEVICE_ID> mobile/ios/$BUILD_DIR/Build/Products/$PRODUCT_DIR/PostQodeNexus.app"
    echo ""
    echo -e "${YELLOW}⚠️  Note: You'll need to trust the developer certificate on your iPhone:${NC}"
    echo "Settings > General > VPN & Device Management > Trust Developer"
else
    echo -e "${BLUE}📱 To install on simulator:${NC}"
    echo "1. Boot a simulator: open -a Simulator"
    echo "2. Install: xcrun simctl install booted mobile/ios/$BUILD_DIR/Build/Products/$PRODUCT_DIR/PostQodeNexus.app"
    echo "3. Launch: xcrun simctl launch booted com.postqode.nexus"
fi
echo ""
