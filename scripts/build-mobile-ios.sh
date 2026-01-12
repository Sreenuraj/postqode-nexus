#!/bin/bash
# build-mobile-ios.sh - Build iOS App for Simulator

set -e

echo "🏗️  Building iOS App (Simulator)..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$PROJECT_ROOT/mobile"

# Run prebuild to generate ios folder
echo "⚙️  Running Expo Prebuild..."
npx expo prebuild --platform ios --clean

cd ios

# Install pods
echo "📦 Installing Pods..."
pod install

# Build
echo "🔨 Running xcodebuild..."
xcodebuild -workspace PostQodeNexus.xcworkspace \
  -scheme PostQodeNexus \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath build

echo ""
echo -e "${GREEN}✅ Build Complete!${NC}"
echo "App location: mobile/ios/build/Build/Products/Debug-iphonesimulator/PostQodeNexus.app"
echo ""
