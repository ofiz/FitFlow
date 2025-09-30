const request = require('supertest');
const app = require('../../server');

describe('User API Tests', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123'
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
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).toHaveProperty('email', 'user@example.com');
      expect(response.body).not.toHaveProperty('password');
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
          height: 175
        });

      expect(response.status).toBe(200);
      expect(response.body.currentWeight).toBe(75);
      expect(response.body.targetWeight).toBe(70);
      expect(response.body.height).toBe(175);
    });
  });
});