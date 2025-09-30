const request = require('supertest');
const app = require('../../server');
const Meal = require('../../models/Meal');

describe('Nutrition API Tests', () => {
  let token;
  let userId;
  let mealId;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'nutrition@example.com',
        password: 'password123'
      });

    token = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('POST /api/nutrition/meals', () => {
    test('Should create a new meal with valid data', async () => {
      const response = await request(app)
        .post('/api/nutrition/meals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Chicken Salad',
          mealType: 'Lunch',
          calories: 450,
          protein: 35,
          carbs: 20,
          fats: 15,
          time: '12:30'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('Chicken Salad');
      expect(response.body.calories).toBe(450);
      
      mealId = response.body._id;
    });

    test('Should reject meal without required fields', async () => {
      const response = await request(app)
        .post('/api/nutrition/meals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Meal'
          // Missing mealType, calories, time
        });

      expect(response.status).toBe(400);
    });

    test('Should reject meal without authentication', async () => {
      const response = await request(app)
        .post('/api/nutrition/meals')
        .send({
          name: 'Test Meal',
          mealType: 'Lunch',
          calories: 300,
          time: '12:00'
        });

      expect(response.status).toBe(401);
    });

    test('Should reject invalid meal type', async () => {
      const response = await request(app)
        .post('/api/nutrition/meals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Meal',
          mealType: 'InvalidType',
          calories: 300,
          time: '12:00'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/nutrition/today', () => {
    beforeEach(async () => {
      await Meal.create({
        userId,
        name: 'Breakfast',
        mealType: 'Breakfast',
        calories: 350,
        time: '08:00',
        date: new Date()
      });
    });

    test('Should get today\'s meals', async () => {
      const response = await request(app)
        .get('/api/nutrition/today')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    test('Should return empty array if no meals today', async () => {
      await Meal.deleteMany({ userId });

      const response = await request(app)
        .get('/api/nutrition/today')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    test('Should require authentication', async () => {
      const response = await request(app)
        .get('/api/nutrition/today');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/nutrition/meals/:id', () => {
    test('Should update a meal', async () => {
      const createResponse = await request(app)
        .post('/api/nutrition/meals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Original Meal',
          mealType: 'Lunch',
          calories: 400,
          time: '12:00'
        });

      const id = createResponse.body._id;

      const response = await request(app)
        .put(`/api/nutrition/meals/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Meal',
          calories: 500,
          protein: 40
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Meal');
      expect(response.body.calories).toBe(500);
      expect(response.body.protein).toBe(40);
    });

    test('Should return 404 for non-existent meal', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/nutrition/meals/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Meal'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/nutrition/meals/:id', () => {
    test('Should delete a meal', async () => {
      const createResponse = await request(app)
        .post('/api/nutrition/meals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Meal to Delete',
          mealType: 'Snack',
          calories: 200,
          time: '15:00'
        });

      const id = createResponse.body._id;

      const response = await request(app)
        .delete(`/api/nutrition/meals/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Meal deleted');
    });

    test('Should return 404 for non-existent meal', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/nutrition/meals/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});