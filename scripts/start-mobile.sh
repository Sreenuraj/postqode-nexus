#!/bin/bash
# start-mobile.sh - Start mobile development environment

set -e

echo "🚀 Starting PostQode Nexus Mobile App..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd "$PROJECT_ROOT"

# Load .env variables
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi
BACKEND_PORT=${BACKEND_PORT:-8080}

# 1. Check Backend
echo "🔍 Checking Backend status on port $BACKEND_PORT..."
if ! curl -s http://localhost:$BACKEND_PORT/health > /dev/null; then
    echo -e "${YELLOW}⚠️  Backend is not running on port $BACKEND_PORT.${NC}"
    read -p "   Do you want to start the backend? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   ☕ Starting Backend..."
        ./scripts/start-backend.sh > /dev/null 2>&1 &
        BACKEND_PID=$!
        echo "   ⏳ Waiting for backend to be ready..."
        # Wait loop
        for i in {1..30}; do
            if curl -s http://localhost:$BACKEND_PORT/health > /dev/null; then
                echo -e "${GREEN}   ✅ Backend is ready!${NC}"
                break
            fi
            sleep 2
        done
    else
        echo -e "${RED}❌ Backend is required for the app to function.${NC}"
        # Continue anyway?
    fi
else
    echo -e "${GREEN}✅ Backend is running.${NC}"
fi

echo ""

# 2. Ask Platform
echo "📱 Select Platform:"
PS3="Select number: "
options=("Android" "iOS")
select PLATFORM in "${options[@]}"; do
    case $PLATFORM in
        "Android")
            echo "   Selected: Android"
            break
            ;;
        "iOS")
            echo "   Selected: iOS"
            break
            ;;
        *) echo "Invalid option $REPLY";;
    esac
done

echo ""

# 3. Ask Device Type
echo "📲 Select Device Type:"
options=("Simulator/Emulator" "Physical Device")
select DEVICE in "${options[@]}"; do
    case $DEVICE in
        "Simulator/Emulator")
            echo "   Selected: Simulator/Emulator"
            break
            ;;
        "Physical Device")
            echo "   Selected: Physical Device"
            break
            ;;
        *) echo "Invalid option $REPLY";;
    esac
done

echo ""

# 4. Configure Network (IP)
if [ "$DEVICE" == "Physical Device" ]; then
    # Get Local IP
    if [[ "$OSTYPE" == "darwin"* ]]; then
        LOCAL_IP=$(ipconfig getifaddr en0)
    else
        LOCAL_IP=$(hostname -I | awk '{print $1}')
    fi
    
    if [ -z "$LOCAL_IP" ]; then
        echo -e "${RED}❌ Could not detect local IP. Using localhost.${NC}"
    else
        echo -e "${GREEN}🌐 Local IP detected: $LOCAL_IP${NC}"
        
        # Backup .env
        if [ ! -f ".env.bak" ]; then
            cp .env .env.bak
            echo "   💾 Backed up .env to .env.bak"
        fi
        
        # Update .env (Replace localhost with IP)
        # Use perl for cross-platform compatibility or sed with backup
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/localhost/$LOCAL_IP/g" .env
        else
            sed -i "s/localhost/$LOCAL_IP/g" .env
        fi
        echo "   ✅ Updated .env to use $LOCAL_IP"
    fi
fi

echo ""
echo "🚀 Launching App..."
echo ""

cd mobile

# 5. Run App
if [ "$PLATFORM" == "Android" ]; then
    if [ "$DEVICE" == "Physical Device" ]; then
        echo "   👉 Scan the QR code with Expo Go on your Android device"
        npx expo start --android
    else
        echo "   🤖 Launching Android Emulator..."
        npx expo run:android
    fi
elif [ "$PLATFORM" == "iOS" ]; then
    if [ "$DEVICE" == "Physical Device" ]; then
        echo "   👉 Scan the QR code with Camera app on your iOS device"
        npx expo start --ios
    else
        echo "   🍎 Launching iOS Simulator..."
        npx expo run:ios
    fi
fi
