// tests/e2e/setup/globalSetup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');

require('dotenv').config({ 
  path: path.join(__dirname, '../../../server/.env.test') 
});

const app = require('../../../server/server');

let mongoServer;
let server;

async function globalSetup() {
  console.log('Starting E2E test environment...');

  try {
    console.log('Starting in-memory MongoDB...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    process.env.MONGODB_URI = mongoUri;
    
    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB');

    const TEST_PORT = process.env.PORT || 5001;
    
    return new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        console.log(`Test server running on port ${TEST_PORT}`);
        
        global.__MONGO_SERVER__ = mongoServer;
        global.__EXPRESS_SERVER__ = server;
        global.__SERVER_PORT__ = TEST_PORT;
        
        console.log('E2E environment ready!');
        resolve();
      });
    });

  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  }
}

module.exports = globalSetup;