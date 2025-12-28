// Quick FCM Test Script
// Run: node test-fcm-quick.js

const https = require('https');

const FCM_TOKEN = 'dt_ZcabORhezciTqwZ8E42:APA91bFOrrzWx0tHmNgB53LM22ESg9Eym62WJaRGbEfq0KllggyOekg_N6Wa5Q8OGyrsC3T2Ft6i_lTUjXuA6qiXL04Alv6oqu9v6HK0TwIZ24pOYYGNyk0';

// Get Server Key from: https://console.firebase.google.com/project/hklfcm-4bb6e/settings/cloudmessaging
const SERVER_KEY = 'YOUR_SERVER_KEY_HERE'; // Replace this!

const data = JSON.stringify({
  to: FCM_TOKEN,
  notification: {
    title: '🔔 Test from Backend',
    body: 'FCM is working perfectly!'
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

console.log('🚀 Sending test notification...');

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
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
