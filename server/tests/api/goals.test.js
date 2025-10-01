const request = require('supertest');
const app = require('../../server');
const Goal = require('../../models/Goal');

describe('Goals API Tests', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'goals@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'goals@example.com',
        password: 'password123'
      });

    token = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  describe('POST /api/goals', () => {
    test('Should create a new goal with valid data', async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Lose 5kg',
          current: 75,
          target: 70,
          unit: 'kg',
          category: 'weight'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe('Lose 5kg');
      expect(response.body.current).toBe(75);
      expect(response.body.target).toBe(70);
    });

    test('Should reject goal without required fields', async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Goal'
          // Missing current, target, unit
        });

      expect(response.status).toBe(400);
    });

    test('Should reject goal without authentication', async () => {
      const response = await request(app)
        .post('/api/goals')
        .send({
          title: 'Test Goal',
          current: 10,
          target: 20,
          unit: 'kg'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/goals', () => {
    test('Should get all goals for authenticated user', async () => {
      await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Goal 1',
          current: 5,
          target: 10,
          unit: 'days'
        });

      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    test('Should return empty array if no goals', async () => {
      await Goal.deleteMany({ userId });

      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/goals/:id', () => {
    test('Should get a single goal by ID', async () => {
      const createResponse = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Single Goal',
          current: 5,
          target: 10,
          unit: 'kg'
        });

      const id = createResponse.body._id;

      const response = await request(app)
        .get(`/api/goals/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(id);
      expect(response.body.title).toBe('Single Goal');
    });

    test('Should return 404 for non-existent goal', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/goals/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/goals/:id', () => {
    test('Should update a goal', async () => {
      const createResponse = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Original Goal',
          current: 5,
          target: 10,
          unit: 'kg'
        });

      const goalId = createResponse.body._id;

      const response = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          current: 7
        });

      expect(response.status).toBe(200);
      expect(response.body.current).toBe(7);
    });

    test('Should not allow updating another user\'s goal', async () => {
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: 'othergoals@example.com',
          password: 'password123'
        });

      const otherToken = otherUserResponse.body.token;

      const createResponse = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Goal',
          current: 5,
          target: 10,
          unit: 'kg'
        });

      const goalId = createResponse.body._id;

      const response = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          current: 8
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/goals/:id', () => {
    test('Should delete a goal', async () => {
      const createResponse = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Goal to Delete',
          current: 5,
          target: 10,
          unit: 'days'
        });

      const goalId = createResponse.body._id;

      const response = await request(app)
        .delete(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Goal deleted');
    });
  });
});