require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase
const serviceAccountPath = path.resolve(__dirname, './firebase-service-account.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('✅ Firebase Admin initialized');

// Get FCM token from command line
const fcmToken = process.argv[2];

if (!fcmToken) {
  console.log('❌ Please provide FCM token');
  console.log('Usage: node test-fcm-direct.js <FCM_TOKEN>');
  process.exit(1);
}

const message = {
  token: fcmToken,
  notification: {
    title: '🔔 Test Notification',
    body: 'FCM is working! This is a direct test from Firebase Admin SDK.',
  },
  data: {
    type: 'TEST',
    timestamp: new Date().toISOString(),
  },
  android: {
    priority: 'high',
    notification: {
      sound: 'default',
      color: '#2196F3',
      channelId: 'high_importance_channel',
    }
  }
};

console.log('🚀 Sending test notification...');
console.log('Token:', fcmToken.substring(0, 30) + '...');

admin.messaging().send(message)
  .then((response) => {
    console.log('✅ Notification sent successfully!');
    console.log('Message ID:', response);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error sending notification:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    process.exit(1);
  });
