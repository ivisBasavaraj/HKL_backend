// Test FCM Notification Script
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json'); // You need to add this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Test function to send notification
async function sendTestNotification(fcmToken) {
  const message = {
    notification: {
      title: '🔔 Test Notification',
      body: 'FCM is working! This is a test from backend.'
    },
    data: {
      type: 'TEST',
      timestamp: new Date().toISOString()
    },
    token: fcmToken,
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        color: '#3B82F6',
        channelId: 'high_importance_channel',
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully!');
    console.log('Message ID:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return { success: false, error: error.message };
  }
}

// Get FCM token from command line argument
const fcmToken = process.argv[2];

if (!fcmToken) {
  console.log('❌ Please provide FCM token as argument');
  console.log('Usage: node test-fcm.js <FCM_TOKEN>');
  process.exit(1);
}

console.log('🚀 Sending test notification...');
console.log('Token:', fcmToken.substring(0, 20) + '...');

sendTestNotification(fcmToken)
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
