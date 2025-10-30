// tests/e2e/setup/globalTeardown.js
const mongoose = require('mongoose');

async function globalTeardown() {
  console.log('Cleaning up E2E test environment...');

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }

    if (global.__EXPRESS_SERVER__) {
      await new Promise((resolve) => {
        global.__EXPRESS_SERVER__.close(() => {
          console.log('Express server stopped');
          resolve();
        });
      });
    }

    if (global.__MONGO_SERVER__) {
      await global.__MONGO_SERVER__.stop({ doCleanup: true, force: true });
      console.log('In-memory MongoDB stopped');
    }

    console.log('Cleanup complete!');
  } catch (error) {
    console.error('Global teardown error:', error);
    throw error;
  }
}

module.exports = globalTeardown;