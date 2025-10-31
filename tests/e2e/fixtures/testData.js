// tests/e2e/fixtures/testData.js
module.exports = {
  validUser: {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'Test@123456'
  },
  
  invalidUsers: {
    shortPassword: {
      name: 'Test User',
      email: 'test@example.com',
      password: '123'
    },
    invalidEmail: {
      name: 'Test User',
      email: 'invalid-email',
      password: 'Test@123456'
    },
    weakPassword: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password' 
    }
  },

  existingUser: {
    name: 'Existing User',
    email: 'existing@example.com',
    password: 'Existing@123'
  }
};

