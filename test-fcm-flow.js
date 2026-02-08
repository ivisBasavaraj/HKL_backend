const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test FCM token (you'll need to get this from the Flutter app)
const TEST_FCM_TOKEN = process.argv[2];

if (!TEST_FCM_TOKEN) {
  console.log('❌ Please provide FCM token from Flutter app');
  console.log('Usage: node test-fcm-flow.js <FCM_TOKEN>');
  console.log('\nTo get FCM token:');
  console.log('1. Run Flutter app: flutter run');
  console.log('2. Look for log: "✅ FCM Token obtained: ..."');
  console.log('3. Copy the full token and run this script');
  process.exit(1);
}

async function testFlow() {
  console.log('🔍 Testing Complete FCM Flow\n');

  // Step 1: Login
  console.log('📋 Step 1: Login as admin');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const authToken = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ Login successful');
    console.log(`   User: ${user.name} (${user.role})`);
    console.log(`   Token: ${authToken.substring(0, 30)}...`);
    console.log('');

    // Step 2: Register FCM Token
    console.log('📋 Step 2: Register FCM Token');
    try {
      const fcmResponse = await axios.post(
        `${BASE_URL}/auth/fcm-token`,
        {
          token: TEST_FCM_TOKEN,
          deviceId: 'test-device-' + Date.now(),
          deviceType: 'android'
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ FCM token registered successfully');
      console.log('   Response:', fcmResponse.data);
      console.log('');

      // Step 3: Verify token was saved
      console.log('📋 Step 3: Verify token in database');
      const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const fcmTokens = profileResponse.data.fcmTokens || [];
      console.log(`✅ User has ${fcmTokens.length} FCM token(s)`);
      if (fcmTokens.length > 0) {
        fcmTokens.forEach((t, i) => {
          console.log(`   ${i + 1}. Device: ${t.deviceId}, Type: ${t.deviceType}`);
        });
      }
      console.log('');

      // Step 4: Test sending notification
      console.log('📋 Step 4: Test notification (run test-fcm-complete.js)');
      console.log('   Run: node test-fcm-complete.js');
      console.log('');
      
      console.log('✅ All steps completed successfully!');
      console.log('\n📱 Check your device for the test notification');
      
    } catch (error) {
      console.log('❌ FCM token registration failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.message || error.message);
      if (error.response?.data?.errors) {
        console.log('   Validation errors:', error.response.data.errors);
      }
    }
    
  } catch (error) {
    console.log('❌ Login failed');
    console.log('   Error:', error.response?.data?.message || error.message);
  }
}

testFlow();
