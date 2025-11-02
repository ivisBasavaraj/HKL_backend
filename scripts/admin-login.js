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

// Create user with role
const createUser = async (name, username, password, role = 'Admin') => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username, role });
    if (existingUser) {
      console.log(`${role} user already exists`);
      return existingUser;
    }

    // Create new user
    const user = new User({
      name,
      username,
      password,
      role,
      isActive: true
    });
    
    // Don't set assignedTask for admin/supervisor
    if (role === 'Admin' || role === 'Supervisor') {
      user.assignedTask = undefined;
    }

    await user.save();
    console.log(`${role} user created successfully`);
    return user;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

// Test admin login
const testAdminLogin = async (username, password) => {
  try {
    const admin = await User.findOne({ username, role: 'Admin' });
    if (!admin) {
      console.log('Admin not found');
      return false;
    }

    const isMatch = await admin.comparePassword(password);
    if (isMatch && admin.isActive) {
      console.log('Admin login successful');
      return true;
    } else {
      console.log('Invalid credentials or account inactive');
      return false;
    }
  } catch (error) {
    console.error('Login test error:', error);
    return false;
  }
};

// Main function
const main = async () => {
  await connectDB();

  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'create':
      if (args.length < 4) {
        console.log('Usage: node admin-login.js create <name> <username> <password> [role]');
        process.exit(1);
      }
      const role = args[4] || 'Admin';
      await createUser(args[1], args[2], args[3], role);
      break;

    case 'test':
      if (args.length < 3) {
        console.log('Usage: node admin-login.js test <username> <password>');
        process.exit(1);
      }
      await testAdminLogin(args[1], args[2]);
      break;

    case 'default':
      // Create default admin
      await createUser('Administrator', 'admin', 'admin123', 'Admin');
      break;

    case 'supervisor':
      // Create default supervisor
      await createUser('Supervisor User', 'supervisor', 'supervisor123', 'Supervisor');
      break;

    default:
      console.log('Available commands:');
      console.log('  create <name> <username> <password> [role] - Create new user');
      console.log('  test <username> <password> - Test user login');
      console.log('  default - Create default admin (admin/admin123)');
      console.log('  supervisor - Create default supervisor (supervisor/supervisor123)');
  }

  mongoose.connection.close();
};

main().catch(console.error);