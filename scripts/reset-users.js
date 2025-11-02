const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Reset users
const resetUsers = async () => {
  try {
    // Delete all existing users
    await User.deleteMany({});
    console.log('All users deleted');

    // Create the 3 new users
    const users = [
      {
        name: 'Test Admin',
        username: 'testA1',
        password: '1234',
        role: 'Admin',
        isActive: true
      },
      {
        name: 'Test Supervisor',
        username: 'testS1',
        password: '1234',
        role: 'Supervisor',
        isActive: true
      },
      {
        name: 'Test User',
        username: 'testU1',
        password: '1234',
        role: 'User',
        isActive: true
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`${userData.role} user created: ${userData.username}`);
    }

    console.log('User reset completed successfully');
  } catch (error) {
    console.error('Error resetting users:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await resetUsers();
  mongoose.connection.close();
};

main().catch(console.error);