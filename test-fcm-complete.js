require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const mongoose = require('mongoose');

console.log('🔍 FCM Complete System Check\n');

// Test 1: Check environment variables
console.log('📋 Test 1: Environment Variables');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('FIREBASE_SERVICE_ACCOUNT_PATH:', process.env.FIREBASE_SERVICE_ACCOUNT_PATH ? '✅ Set' : '❌ Missing');
console.log('');

// Test 2: Check Firebase service account file
console.log('📋 Test 2: Firebase Service Account File');
try {
  const serviceAccountPath = path.resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json');
  const serviceAccount = require(serviceAccountPath);
  console.log('✅ File exists:', serviceAccountPath);
  console.log('✅ Project ID:', serviceAccount.project_id);
  console.log('✅ Client Email:', serviceAccount.client_email);
} catch (error) {
  console.log('❌ Error:', error.message);
  process.exit(1);
}
console.log('');

// Test 3: Initialize Firebase Admin
console.log('📋 Test 3: Firebase Admin Initialization');
try {
  const serviceAccountPath = path.resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json');
  const serviceAccount = require(serviceAccountPath);
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.log('❌ Error:', error.message);
  process.exit(1);
}
console.log('');

// Test 4: Connect to MongoDB
console.log('📋 Test 4: MongoDB Connection');
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    console.log('');

    // Test 5: Check User model and FCM tokens
    console.log('📋 Test 5: Check Users with FCM Tokens');
    const User = require('./models/User');
    const users = await User.find({}).select('username role fcmTokens pushNotificationsEnabled');
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`\n  User: ${user.username} (${user.role})`);
      console.log(`  Push Enabled: ${user.pushNotificationsEnabled ? '✅' : '❌'}`);
      console.log(`  FCM Tokens: ${user.fcmTokens?.length || 0}`);
      if (user.fcmTokens?.length > 0) {
        user.fcmTokens.forEach((t, i) => {
          console.log(`    ${i + 1}. Device: ${t.deviceId}, Type: ${t.deviceType}`);
          console.log(`       Token: ${t.token.substring(0, 30)}...`);
        });
      }
    });
    console.log('');

    // Test 6: Send test notification if token exists
    console.log('📋 Test 6: Send Test Notification');
    const usersWithTokens = users.filter(u => u.fcmTokens?.length > 0);
    
    if (usersWithTokens.length === 0) {
      console.log('⚠️  No users with FCM tokens found');
      console.log('   Please run the Flutter app and login to register a token');
    } else {
      const testUser = usersWithTokens[0];
      const testToken = testUser.fcmTokens[0].token;
      
      console.log(`Sending to: ${testUser.username}`);
      console.log(`Token: ${testToken.substring(0, 30)}...`);
      
      const message = {
        token: testToken,
        notification: {
          title: '🔔 FCM System Test',
          body: `Hello ${testUser.username}! Your notifications are working perfectly.`,
        },
        data: {
          type: 'SYSTEM_TEST',
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

      try {
        const response = await admin.messaging().send(message);
        console.log('✅ Notification sent successfully!');
        console.log('   Message ID:', response);
      } catch (error) {
        console.log('❌ Failed to send notification');
        console.log('   Error Code:', error.code);
        console.log('   Error Message:', error.message);
        
        if (error.code === 'messaging/invalid-registration-token' || 
            error.code === 'messaging/registration-token-not-registered') {
          console.log('\n⚠️  Token is invalid or expired. Solutions:');
          console.log('   1. Reinstall the Flutter app');
          console.log('   2. Clear app data and login again');
          console.log('   3. Check if google-services.json matches firebase-service-account.json');
        }
      }
    }
    
    console.log('\n✅ All tests completed!');
    process.exit(0);
  })
  .catch(error => {
    console.log('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });
