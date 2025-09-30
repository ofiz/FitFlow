const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Connect to in-memory DB before all tests
beforeAll(async () => {
  try {
    // Close any existing connections
    await mongoose.disconnect();
    
    // Create new in-memory server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to it
    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB');
  } catch (error) {
    console.error('Setup error:', error);
    throw error;
  }
});

// Clear all test data after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (key !== 'users') {
      await collections[key].deleteMany();
    }
  }
});

// Disconnect and stop DB after all tests
afterAll(async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Teardown error:', error);
  }
});