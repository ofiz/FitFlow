const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');

describe('User API Tests', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'user@example.com',
        password: 'Password123!'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'Password123!'
      });

    token = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  describe('GET /api/user/profile', () => {
    test('Should get user profile', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe('user@example.com');
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .get('/api/user/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/user/profile', () => {
    test('Should update user profile', async () => {
      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentWeight: 75,
          targetWeight: 70,
          height: 175,
          age: 30,
          gender: 'male',
          activityLevel: 'moderate'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.user.currentWeight).toBe(75);
      expect(response.body.user.targetWeight).toBe(70);
      expect(response.body.user.height).toBe(175);
    });

    test('Should update partial profile data', async () => {
      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentWeight: 74
        });

      expect(response.status).toBe(200);
      expect(response.body.user.currentWeight).toBe(74);
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .put('/api/user/profile')
        .send({
          currentWeight: 75
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/user/stats', () => {
    test('Should get user stats with BMI calculation', async () => {
      // First update profile with weight and height
      await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentWeight: 75,
          targetWeight: 70,
          height: 175
        });

      const response = await request(app)
        .get('/api/user/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('bmi');
      expect(response.body).toHaveProperty('weightProgress');
      expect(response.body.bmi).not.toBeNull();
      expect(response.body.weightProgress).toHaveProperty('current');
      expect(response.body.weightProgress).toHaveProperty('target');
    });

    test('Should return null BMI if no height/weight', async () => {
      // Create new user with no weight/height
      const newUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123!'
        });

      const newToken = newUserResponse.body.token;

      const response = await request(app)
        .get('/api/user/stats')
        .set('Authorization', `Bearer ${newToken}`);

      expect(response.status).toBe(200);
      expect(response.body.bmi).toBeNull();
    });
  });

  describe('PUT /api/user/change-password', () => {
    test('Should change password with valid credentials', async () => {
      const response = await request(app)
        .put('/api/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword456!'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password changed successfully');

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'NewPassword456!'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');

      // Change back to original password for other tests
      await request(app)
        .put('/api/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'NewPassword456!',
          newPassword: 'Password123!'
        });
    });

    test('Should reject incorrect current password', async () => {
      const response = await request(app)
        .put('/api/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword!',
          newPassword: 'NewPassword456!'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Current password is incorrect');
    });

    test('Should reject weak password (too short)', async () => {
      const response = await request(app)
        .put('/api/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'Short1!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('at least 8 characters');
    });

    test('Should reject password without uppercase', async () => {
      const response = await request(app)
        .put('/api/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'password123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('uppercase, lowercase, number and special character');
    });

    test('Should reject password without lowercase', async () => {
      const response = await request(app)
        .put('/api/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'PASSWORD123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('uppercase, lowercase, number and special character');
    });

    test('Should reject password without number', async () => {
      const response = await request(app)
        .put('/api/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'Password!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('uppercase, lowercase, number and special character');
    });

    test('Should reject password without special character', async () => {
      const response = await request(app)
        .put('/api/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'Password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('uppercase, lowercase, number and special character');
    });

    test('Should reject request without current password', async () => {
      const response = await request(app)
        .put('/api/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          newPassword: 'NewPassword456!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    test('Should reject request without new password', async () => {
      const response = await request(app)
        .put('/api/user/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .put('/api/user/change-password')
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword456!'
        });

      expect(response.status).toBe(401);
    });
  });
});