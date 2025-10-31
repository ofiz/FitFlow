const request = require('supertest');
const app = require('../../server');  
const User = require('../../models/User');  
const crypto = require('crypto');

describe('Password Reset API Tests', () => {
  
  let testUser;
  let testEmail = 'resettest@example.com';

  // Create a test user before each test
  beforeEach(async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Reset Test User',
        email: testEmail,
        password: 'oldpassword123'
      });
    
    testUser = response.body.user;
  });

  describe('POST /api/auth/forgot-password', () => {
    test('Should send reset email for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testEmail
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password reset email sent successfully');

      // Verify token was saved in database
      const user = await User.findOne({ email: testEmail });
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordToken).not.toBeNull();
      expect(user.resetPasswordExpire).toBeDefined();
      expect(user.resetPasswordExpire).toBeInstanceOf(Date);
      expect(user.resetPasswordExpire.getTime()).toBeGreaterThan(Date.now());
    });

    test('Should return 404 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(response.status).toBe(404);
    });

    test('Should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'invalid-email-format'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email format');
    });

    test('Should reject empty email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: ''
        });

      expect(response.status).toBe(400);
    });

    test('Should reject missing email field', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email is required');
    });

    test('Token should be hashed with SHA-256', async () => {
      await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testEmail
        });

      const user = await User.findOne({ email: testEmail });
      
      // SHA-256 hash is 64 characters long (hex)
      expect(user.resetPasswordToken).toHaveLength(64);
      expect(user.resetPasswordToken).toMatch(/^[a-f0-9]{64}$/);
    });

    test('Token should expire in 1 hour', async () => {
      const beforeTime = Date.now();
      
      await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testEmail
        });

      const afterTime = Date.now();
      const user = await User.findOne({ email: testEmail });
      
      const expectedExpire = beforeTime + 3600000; // 1 hour
      const actualExpire = user.resetPasswordExpire.getTime();
      
      // Allow 5 second variance
      expect(actualExpire).toBeGreaterThanOrEqual(expectedExpire - 5000);
      expect(actualExpire).toBeLessThanOrEqual(afterTime + 3600000 + 5000);
    });

    test('Should overwrite previous reset token', async () => {
      // First request
      await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testEmail
        });

      const firstUser = await User.findOne({ email: testEmail });
      const firstToken = firstUser.resetPasswordToken;

      // Wait a moment to ensure different token
      await new Promise(resolve => setTimeout(resolve, 100));

      // Second request
      await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testEmail
        });

      const secondUser = await User.findOne({ email: testEmail });
      const secondToken = secondUser.resetPasswordToken;

      expect(secondToken).not.toBe(firstToken);
    });
  });

  describe('POST /api/auth/reset-password/:token', () => {
    let plainToken;
    let hashedToken;

    beforeEach(async () => {
      // Generate a plain token and its SHA-256 hash
      plainToken = crypto.randomBytes(32).toString('hex');
      hashedToken = crypto
        .createHash('sha256')
        .update(plainToken)
        .digest('hex');

      const user = await User.findOne({ email: testEmail });
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
      await user.save();
    });

    test('Should reset password with valid token', async () => {
      const newPassword = 'newpassword456';

      const response = await request(app)
        .post(`/api/auth/reset-password/${plainToken}`)
        .send({
          password: newPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password reset successful');

      // Verify token was cleared
      const user = await User.findOne({ email: testEmail });
      expect(user.resetPasswordToken).toBeNull();
      expect(user.resetPasswordExpire).toBeNull();

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: newPassword
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.message).toBe('Login successful');
    });

    test('Should reject invalid token', async () => {
      const invalidToken = crypto.randomBytes(32).toString('hex');

      const response = await request(app)
        .post(`/api/auth/reset-password/${invalidToken}`)
        .send({
          password: 'newpassword456'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    test('Should reject expired token', async () => {
      // Set token as expired
      const user = await User.findOne({ email: testEmail });
      user.resetPasswordExpire = Date.now() - 1000; // Expired 1 second ago
      await user.save();

      const response = await request(app)
        .post(`/api/auth/reset-password/${plainToken}`)
        .send({
          password: 'newpassword456'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    test('Should reject empty password', async () => {
      const response = await request(app)
        .post(`/api/auth/reset-password/${plainToken}`)
        .send({
          password: ''
        });

      expect(response.status).toBe(400);
    });

    test('Should reject missing password field', async () => {
      const response = await request(app)
        .post(`/api/auth/reset-password/${plainToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password is required');
    });

    test('Should hash new password before saving', async () => {
      const newPassword = 'newpassword456';

      await request(app)
        .post(`/api/auth/reset-password/${plainToken}`)
        .send({
          password: newPassword
        });

      const user = await User.findOne({ email: testEmail });
      
      // Password should be hashed (not plain text)
      expect(user.password).not.toBe(newPassword);
      expect(user.password).toContain('$2'); // bcrypt hash starts with $2
    });

    test('Should not allow old password after reset', async () => {
      const oldPassword = 'oldpassword123';
      const newPassword = 'newpassword456';

      // Reset password
      await request(app)
        .post(`/api/auth/reset-password/${plainToken}`)
        .send({
          password: newPassword
        });

      // Try to login with old password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: oldPassword
        });

      expect(loginResponse.status).toBe(400);
      expect(loginResponse.body.message).toBe('Invalid email or password');
    });

    test('Token should be single-use only', async () => {
      const newPassword = 'newpassword456';

      // First reset - should succeed
      const firstResponse = await request(app)
        .post(`/api/auth/reset-password/${plainToken}`)
        .send({
          password: newPassword
        });

      expect(firstResponse.status).toBe(200);

      // Second reset with same token - should fail
      const secondResponse = await request(app)
        .post(`/api/auth/reset-password/${plainToken}`)
        .send({
          password: 'anotherpassword789'
        });

      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body.message).toBe('Invalid or expired reset token');
    });
  });

  describe('Password Reset Flow - End to End', () => {
    test('Complete password reset flow', async () => {
      // Step 1: Request password reset
      const forgotResponse = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testEmail
        });

      expect(forgotResponse.status).toBe(200);

      // Step 2: Get hashed token from database
      const user = await User.findOne({ email: testEmail });
      const hashedToken = user.resetPasswordToken;

      // We need to get the plain token (in real app, user gets this via email)
      // For testing, we'll generate a matching plain token
      // This is a simplification - in reality, the plain token is in the email URL
      
      // Generate a new token pair for testing
      const plainToken = crypto.randomBytes(32).toString('hex');
      const newHashedToken = crypto
        .createHash('sha256')
        .update(plainToken)
        .digest('hex');
      
      user.resetPasswordToken = newHashedToken;
      await user.save();

      // Step 3: Reset password with token
      const newPassword = 'brandnewpassword789';
      const resetResponse = await request(app)
        .post(`/api/auth/reset-password/${plainToken}`)
        .send({
          password: newPassword
        });

      expect(resetResponse.status).toBe(200);

      // Step 4: Login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: newPassword
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.message).toBe('Login successful');
      expect(loginResponse.body).toHaveProperty('token');
    });
  });
});
