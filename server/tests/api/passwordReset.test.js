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

    test('Should return generic message for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('If this email exists, a reset link has been sent');
    });

    test('Should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'invalid-email-format'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Please provide a valid email');
    });

    test('Should reject empty email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Please provide a valid email');
    });

    test('Should reject missing email field', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Please provide a valid email');
    });

    test('Token should be hashed with SHA-1', async () => {
      await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testEmail
        });

      const user = await User.findOne({ email: testEmail });
      
      // SHA-1 hash is 40 characters long (hex)
      expect(user.resetPasswordToken).toHaveLength(40);
      expect(user.resetPasswordToken).toMatch(/^[a-f0-9]{40}$/);
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
    let validToken;

    beforeEach(async () => {
      // Generate and save a valid token
      const user = await User.findOne({ email: testEmail });
      
      validToken = crypto
        .createHash('sha1')
        .update(`${user._id}${Date.now()}${Math.random()}`)
        .digest('hex');

      user.resetPasswordToken = validToken;
      user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
      await user.save();
    });

    test('Should reset password with valid token', async () => {
      const newPassword = 'newpassword456';

      const response = await request(app)
        .post(`/api/auth/reset-password/${validToken}`)
        .send({
          newPassword: newPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password has been reset successfully');

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
      const invalidToken = 'invalid_token_12345';

      const response = await request(app)
        .post(`/api/auth/reset-password/${invalidToken}`)
        .send({
          newPassword: 'newpassword456'
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
        .post(`/api/auth/reset-password/${validToken}`)
        .send({
          newPassword: 'newpassword456'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    test('Should reject password shorter than 6 characters', async () => {
      const response = await request(app)
        .post(`/api/auth/reset-password/${validToken}`)
        .send({
          newPassword: '12345'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password must be at least 6 characters');
    });

    test('Should reject empty password', async () => {
      const response = await request(app)
        .post(`/api/auth/reset-password/${validToken}`)
        .send({
          newPassword: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password must be at least 6 characters');
    });

    test('Should reject missing password field', async () => {
      const response = await request(app)
        .post(`/api/auth/reset-password/${validToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password must be at least 6 characters');
    });

    test('Should hash new password before saving', async () => {
      const newPassword = 'newpassword456';

      await request(app)
        .post(`/api/auth/reset-password/${validToken}`)
        .send({
          newPassword: newPassword
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
        .post(`/api/auth/reset-password/${validToken}`)
        .send({
          newPassword: newPassword
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
        .post(`/api/auth/reset-password/${validToken}`)
        .send({
          newPassword: newPassword
        });

      expect(firstResponse.status).toBe(200);

      // Second reset with same token - should fail
      const secondResponse = await request(app)
        .post(`/api/auth/reset-password/${validToken}`)
        .send({
          newPassword: 'anotherpassword789'
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

      // Step 2: Get token from database (in real app, user gets this via email)
      const user = await User.findOne({ email: testEmail });
      const resetToken = user.resetPasswordToken;

      // Step 3: Reset password with token
      const newPassword = 'brandnewpassword789';
      const resetResponse = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({
          newPassword: newPassword
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

    test('Should handle multiple reset requests correctly', async () => {
      // Request 1
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testEmail });

      const user1 = await User.findOne({ email: testEmail });
      const token1 = user1.resetPasswordToken;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Request 2 - should invalidate first token
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testEmail });

      const user2 = await User.findOne({ email: testEmail });
      const token2 = user2.resetPasswordToken;

      // Try to use first token - should fail
      const response1 = await request(app)
        .post(`/api/auth/reset-password/${token1}`)
        .send({ newPassword: 'newpass123' });

      expect(response1.status).toBe(400);

      // Use second token - should succeed
      const response2 = await request(app)
        .post(`/api/auth/reset-password/${token2}`)
        .send({ newPassword: 'newpass123' });

      expect(response2.status).toBe(200);
    });
  });
});