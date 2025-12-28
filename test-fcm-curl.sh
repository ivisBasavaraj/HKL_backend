#!/bin/bash
# FCM Test using cURL

# Replace these values
SERVER_KEY="YOUR_SERVER_KEY_HERE"
FCM_TOKEN="$1"

if [ -z "$FCM_TOKEN" ]; then
  echo "❌ Please provide FCM token"
  echo "Usage: ./test-fcm-curl.sh <FCM_TOKEN>"
  exit 1
fi

if [ "$SERVER_KEY" = "YOUR_SERVER_KEY_HERE" ]; then
  echo "❌ Please set SERVER_KEY in the script"
  echo ""
  echo "Get it from:"
  echo "https://console.firebase.google.com/project/hklfcm-4bb6e/settings/cloudmessaging"
  exit 1
fi

echo "🚀 Sending test notification..."
echo "Token: ${FCM_TOKEN:0:20}..."

curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=$SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"to\": \"$FCM_TOKEN\",
    \"notification\": {
      \"title\": \"🔔 Test Notification\",
      \"body\": \"FCM is working! This is a test from cURL.\"
    },
    \"data\": {
      \"type\": \"TEST\",
      \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    },
    \"priority\": \"high\"
  }"

echo ""
echo "✅ Request sent!"
