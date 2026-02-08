const admin = require('firebase-admin');
const path = require('path');

let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return;
  
  try {
    if (!admin.apps.length) {
      // Try environment variable first (for production)
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        firebaseInitialized = true;
        console.log('✅ Firebase Admin initialized from env variable');
      }
      // Try file path (for local development)
      else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccountPath = path.isAbsolute(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
          ? process.env.FIREBASE_SERVICE_ACCOUNT_PATH
          : path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
          
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        firebaseInitialized = true;
        console.log('✅ Firebase Admin initialized from file path');
      } else {
        console.log('⚠️ Firebase not configured - push notifications disabled');
      }
    } else {
      firebaseInitialized = true;
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
  }
};

const sendPushNotification = async (fcmToken, alertData) => {
  initializeFirebase();
  
  if (!firebaseInitialized || !fcmToken) {
    console.log('⚠️ Push notification skipped: Firebase not initialized or no token');
    return { success: false, error: 'Firebase not configured or no FCM token' };
  }

  const { tool_id, tool_name, alert_type, usage_percentage, remaining_life } = alertData;
  const isCritical = alert_type === 'CRITICAL';

  const message = {
    token: fcmToken,
    notification: {
      title: isCritical 
        ? `🚨 CRITICAL: Tool ${tool_id} Replacement Required`
        : `⚠️ WARNING: Tool ${tool_id} Nearing End of Life`,
      body: `${tool_name} - ${usage_percentage.toFixed(1)}% used, ${remaining_life} units remaining`,
    },
    data: {
      type: 'TOOL_LIFE_ALERT',
      tool_id: String(tool_id),
      tool_name: tool_name,
      alert_type: alert_type,
      usage_percentage: String(usage_percentage),
      remaining_life: String(remaining_life),
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        color: isCritical ? '#dc3545' : '#ff9800',
        channelId: 'tool_alerts',
      }
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        }
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Push notification sent successfully:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Push notification error:', error.code, error.message);
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      console.log('⚠️ Invalid FCM token, should be removed from database');
    }
    return { success: false, error: error.message, code: error.code };
  }
};

const sendPushToMultipleDevices = async (fcmTokens, alertData) => {
  initializeFirebase();
  
  if (!firebaseInitialized || !fcmTokens || fcmTokens.length === 0) {
    console.log('⚠️ Multicast notification skipped: Firebase not initialized or no tokens');
    return { success: false, error: 'Firebase not configured or no FCM tokens' };
  }

  const { tool_id, tool_name, alert_type, usage_percentage, remaining_life } = alertData;
  const isCritical = alert_type === 'CRITICAL';

  const message = {
    notification: {
      title: isCritical 
        ? `🚨 CRITICAL: Tool ${tool_id} Replacement Required`
        : `⚠️ WARNING: Tool ${tool_id} Nearing End of Life`,
      body: `${tool_name} - ${usage_percentage.toFixed(1)}% used, ${remaining_life} units remaining`,
    },
    data: {
      type: 'TOOL_LIFE_ALERT',
      tool_id: String(tool_id),
      tool_name: tool_name,
      alert_type: alert_type,
    },
    tokens: fcmTokens,
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log(`✅ Multicast sent: ${response.successCount}/${fcmTokens.length} successful`);
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`❌ Failed for token ${idx}:`, resp.error?.code);
        }
      });
    }
    return { 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    console.error('❌ Multicast error:', error.code, error.message);
    return { success: false, error: error.message, code: error.code };
  }
};

module.exports = {
  initializeFirebase,
  sendPushNotification,
  sendPushToMultipleDevices
};
