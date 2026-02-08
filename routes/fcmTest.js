const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { sendPushNotification } = require('../services/pushNotificationService');
const User = require('../models/User');

// Test endpoint - Send notification to current user
router.post('/test-notification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      return res.status(400).json({ 
        message: 'No FCM tokens registered',
        hint: 'Please login from the app to register FCM token'
      });
    }

    const results = [];
    for (const fcmToken of user.fcmTokens) {
      const result = await sendPushNotification(fcmToken.token, {
        tool_id: 'TEST-001',
        tool_name: 'Test Tool',
        alert_type: 'WARNING',
        usage_percentage: 75.5,
        remaining_life: 250
      });
      results.push({
        deviceId: fcmToken.deviceId,
        ...result
      });
    }

    res.json({
      success: true,
      message: 'Test notifications sent',
      user: user.username,
      tokenCount: user.fcmTokens.length,
      results
    });

  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ 
      message: 'Failed to send test notification',
      error: error.message 
    });
  }
});

// Get FCM token status for current user
router.get('/fcm-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('username fcmTokens pushNotificationsEnabled');
    
    res.json({
      username: user.username,
      pushEnabled: user.pushNotificationsEnabled,
      tokenCount: user.fcmTokens?.length || 0,
      tokens: user.fcmTokens?.map(t => ({
        deviceId: t.deviceId,
        deviceType: t.deviceType,
        lastUsed: t.lastUsed,
        tokenPreview: t.token.substring(0, 30) + '...'
      })) || []
    });

  } catch (error) {
    console.error('FCM status error:', error);
    res.status(500).json({ message: 'Failed to get FCM status' });
  }
});

module.exports = router;
