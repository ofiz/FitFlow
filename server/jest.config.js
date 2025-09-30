module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 30000, // Increased timeout
  maxWorkers: 1,
  // Add setup file
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};