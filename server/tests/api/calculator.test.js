const request = require('supertest');
const app = require('../../server');

describe('Calculator API Tests', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'calculator@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'calculator@example.com',
        password: 'password123'
      });

    token = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  describe('POST /api/calculator/calculate', () => {
    test('Should calculate BMR and TDEE for male', async () => {
      const response = await request(app)
        .post('/api/calculator/calculate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          age: 25,
          weight: 75,
          height: 175,
          gender: 'male',
          activityLevel: 'moderately'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bmr');
      expect(response.body).toHaveProperty('tdee');
      expect(response.body.bmr).toBeGreaterThan(1000);
      expect(response.body.tdee).toBeGreaterThan(response.body.bmr);
    });

    test('Should calculate BMR and TDEE for female', async () => {
      const response = await request(app)
        .post('/api/calculator/calculate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          age: 30,
          weight: 60,
          height: 165,
          gender: 'female',
          activityLevel: 'lightly'
        });

      expect(response.status).toBe(200);
      expect(response.body.bmr).toBeGreaterThan(1000);
      expect(response.body.tdee).toBeGreaterThan(response.body.bmr);
    });

    test('Should reject calculation without required fields', async () => {
      const response = await request(app)
        .post('/api/calculator/calculate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          age: 25,
          weight: 75
          // Missing height, gender, activityLevel
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    test('Should reject invalid age', async () => {
      const response = await request(app)
        .post('/api/calculator/calculate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          age: 10,
          weight: 75,
          height: 175,
          gender: 'male',
          activityLevel: 'moderately'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Age');
    });

    test('Should reject invalid weight', async () => {
      const response = await request(app)
        .post('/api/calculator/calculate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          age: 25,
          weight: 20,
          height: 175,
          gender: 'male',
          activityLevel: 'moderately'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Weight');
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .post('/api/calculator/calculate')
        .send({
          age: 25,
          weight: 75,
          height: 175,
          gender: 'male',
          activityLevel: 'moderately'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/calculator/history', () => {
    test('Should get calculation history', async () => {
      // Create a calculation first
      await request(app)
        .post('/api/calculator/calculate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          age: 25,
          weight: 75,
          height: 175,
          gender: 'male',
          activityLevel: 'moderately'
        });

      const response = await request(app)
        .get('/api/calculator/history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('bmr');
      expect(response.body[0]).toHaveProperty('tdee');
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .get('/api/calculator/history');

      expect(response.status).toBe(401);
    });
  });
});