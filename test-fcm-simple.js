// Simple FCM Test using HTTP API (No service account needed)
const https = require('https');

// Get from Firebase Console → Project Settings → Cloud Messaging → Server Key
const SERVER_KEY = 'YOUR_SERVER_KEY_HERE'; // Replace with your server key

function sendTestNotification(fcmToken) {
  const data = JSON.stringify({
    to: fcmToken,
    notification: {
      title: '🔔 Test Notification',
      body: 'FCM is working! This is a test from backend.'
    },
    data: {
      type: 'TEST',
      timestamp: new Date().toISOString()
    },
    priority: 'high'
  });

  const options = {
    hostname: 'fcm.googleapis.com',
    port: 443,
    path: '/fcm/send',
    method: 'POST',
    headers: {
      'Authorization': `key=${SERVER_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('Response Status:', res.statusCode);
      console.log('Response:', responseData);
      
      if (res.statusCode === 200) {
        console.log('✅ Notification sent successfully!');
      } else {
        console.log('❌ Failed to send notification');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error);
  });

  req.write(data);
  req.end();
}

// Get FCM token from command line
const fcmToken = process.argv[2];

if (!fcmToken) {
  console.log('❌ Please provide FCM token');
  console.log('Usage: node test-fcm-simple.js <FCM_TOKEN>');
  console.log('\nTo get Server Key:');
  console.log('1. Go to Firebase Console');
  console.log('2. Project Settings → Cloud Messaging');
  console.log('3. Copy "Server key"');
  console.log('4. Replace SERVER_KEY in this file');
  process.exit(1);
}

if (SERVER_KEY === 'YOUR_SERVER_KEY_HERE') {
  console.log('❌ Please set SERVER_KEY in the script');
  console.log('\nGet it from:');
  console.log('https://console.firebase.google.com/project/hklfcm-4bb6e/settings/cloudmessaging');
  process.exit(1);
}

console.log('🚀 Sending test notification...');
console.log('Token:', fcmToken.substring(0, 20) + '...');
sendTestNotification(fcmToken);
