const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`;

// Test admin login via API
const testAdminLoginAPI = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password,
      role: 'Admin'
    });

    console.log('Login successful!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message);
    return null;
  }
};

// Create admin via API (requires existing admin token)
const createAdminAPI = async (adminToken, userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    console.log('Admin created successfully!');
    console.log('User:', response.data.user);
    return response.data;
  } catch (error) {
    console.error('Admin creation failed:', error.response?.data?.message || error.message);
    return null;
  }
};

// Main function
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'login':
      if (args.length < 3) {
        console.log('Usage: node test-admin-api.js login <username> <password>');
        process.exit(1);
      }
      await testAdminLoginAPI(args[1], args[2]);
      break;

    case 'create':
      if (args.length < 6) {
        console.log('Usage: node test-admin-api.js create <admin-token> <name> <username> <password> <role>');
        process.exit(1);
      }
      await createAdminAPI(args[1], {
        name: args[2],
        username: args[3],
        password: args[4],
        role: args[5]
      });
      break;

    default:
      console.log('Available commands:');
      console.log('  login <username> <password> - Test admin login');
      console.log('  create <admin-token> <name> <username> <password> <role> - Create new user');
      console.log('\nExample:');
      console.log('  node test-admin-api.js login admin admin123');
  }
};

main().catch(console.error);