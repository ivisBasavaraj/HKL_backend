const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

// Sample users for testing
const sampleUsers = [
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
    name: 'Test User 1',
    username: 'testU1',
    password: '1234',
    role: 'User',
    isActive: true
  },
  {
    name: 'Test User 2',
    username: 'testU2',
    password: '1234',
    role: 'User',
    isActive: true
  },
  {
    name: 'Test User 3',
    username: 'testU3',
    password: '1234',
    role: 'User',
    isActive: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create sample users
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.name} (${userData.role})`);
    }

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: testA1 / 1234');
    console.log('Supervisor: testS1 / 1234');
    console.log('Users: testU1, testU2, testU3 / 1234');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();